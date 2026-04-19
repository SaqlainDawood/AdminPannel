import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
  MDBBadge,
  MDBSpinner,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBInput,
  MDBPagination,
  MDBPaginationItem,
  MDBPaginationLink,
} from "mdb-react-ui-kit";
import { toast } from "react-toastify";
import {
  getClassStudents,
  getAvailableStudents,
  enrollBulkStudents,
  removeStudentFromClass,
  updateStudentStatus,
  getEnrollmentStats,
} from "../../../classesAPI/studentEnrollmentAPI";

const ManageEnrollment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State variables
  const [activeTab, setActiveTab] = useState("enrolled");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  
  // Dynamic filter options
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // Dropdown handlers
  const toggleDropdown = (studentId) => {
    if (openDropdown === studentId) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(studentId);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".custom-dropdown")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchEnrollmentStats();
    fetchEnrolledStudents();
  }, [id]);

  // Fetch available students when filters change
  useEffect(() => {
    if (activeTab === "available") {
      fetchAvailableStudents();
    }
  }, [activeTab, searchTerm, filterDepartment, filterSemester, currentPage, pageSize]);

  // Fetch enrollment statistics
  const fetchEnrollmentStats = async () => {
    try {
      const response = await getEnrollmentStats(id);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch enrolled students
  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const response = await getClassStudents(id, 1, 50);
      if (response.success) {
        setEnrolledStudents(response.data.students || []);
      }
    } catch (error) {
      toast.error("Failed to fetch enrolled students");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available students with pagination and filters
  const fetchAvailableStudents = async () => {
    try {
      setLoading(true);
      const response = await getAvailableStudents(id, {
        search: searchTerm,
        department: filterDepartment,
        semester: filterSemester,
        page: currentPage,
        limit: pageSize,
      });
      if (response.success) {
        const students = response.data.students || [];
        setAvailableStudents(students);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalStudents(response.data.pagination?.totalStudents || 0);
        
        // Fetch filter options only when no filters are applied
        if (!filterDepartment && !filterSemester && !searchTerm) {
          await fetchFilterOptions();
        }
      }
    } catch (error) {
      toast.error("Failed to fetch available students");
    } finally {
      setLoading(false);
    }
  };

  // Fetch unique departments and semesters for filter dropdowns
  const fetchFilterOptions = async () => {
    try {
      const response = await getAvailableStudents(id, {
        search: "",
        department: "",
        semester: "",
        page: 1,
        limit: 1000,
      });
      
      if (response.success) {
        const allStudents = response.data.students || [];
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(
          allStudents
            .map(s => s.enrollment?.department)
            .filter(dept => dept && dept !== "undefined" && dept !== "null")
        )];
        
        // Extract unique semesters
        const uniqueSemesters = [...new Set(
          allStudents
            .map(s => s.enrollment?.semester)
            .filter(sem => sem && sem !== "undefined" && sem !== "null")
        )];
        
        // Sort departments alphabetically
        uniqueDepartments.sort();
        
        // Sort semesters numerically
        uniqueSemesters.sort((a, b) => {
          const numA = parseInt(a) || 0;
          const numB = parseInt(b) || 0;
          return numA - numB;
        });
        
        setDepartmentOptions(uniqueDepartments);
        setSemesterOptions(uniqueSemesters);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  // Enroll selected students
  const handleEnrollSelected = async () => {
    if (selectedStudents.length === 0) {
      toast.info("Please select at least one student");
      return;
    }

    try {
      setLoading(true);
      const response = await enrollBulkStudents(id, selectedStudents);

      if (response.success) {
        toast.success(response.message);
        setSelectedStudents([]);
        fetchEnrolledStudents();
        fetchEnrollmentStats();
        fetchAvailableStudents();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to enroll students");
    } finally {
      setLoading(false);
    }
  };

  // Remove student from class
  const handleRemoveStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from this class?`)) {
      try {
        const response = await removeStudentFromClass(id, studentId);
        if (response.success) {
          toast.success(response.message);
          fetchEnrolledStudents();
          fetchEnrollmentStats();
          fetchAvailableStudents();
        }
      } catch (error) {
        toast.error("Failed to remove student");
      }
    }
  };

  // Update student status
  const handleUpdateStatus = async (studentId, status, studentName) => {
    try {
      const response = await updateStudentStatus(id, studentId, status);
      if (response.success) {
        toast.success(`${studentName} status updated to ${status}`);
        fetchEnrolledStudents();
        fetchEnrollmentStats();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select/Deselect all students
  const selectAllStudents = () => {
    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(availableStudents.map((s) => s._id));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterSemester("");
    setCurrentPage(1);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Loading state
  if (loading && activeTab === "enrolled") {
    return (
      <div className="text-center py-5">
        <MDBSpinner grow className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </MDBSpinner>
      </div>
    );
  }

  return (
    <MDBContainer fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <MDBBtn
            color="link"
            className="text-dark p-1 me-3"
            onClick={() => navigate(-1)}
          >
            <MDBIcon fas icon="arrow-left" size="lg" />
          </MDBBtn>
          <h3 className="d-inline">Manage Enrollment</h3>
        </div>
        <MDBBtn
          color="secondary"
          onClick={() => navigate(`/admin/dashboard/classes/view/${id}`)}
        >
          <MDBIcon fas icon="eye" className="me-2" />
          View Class
        </MDBBtn>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <MDBCard className="shadow-3">
              <MDBCardBody className="text-center">
                <h6 className="text-muted">Enrolled Students</h6>
                <h2 className="text-primary">{stats.counts?.enrolled || 0}</h2>
                <small>Capacity: {stats.capacity}</small>
              </MDBCardBody>
            </MDBCard>
          </div>
          <div className="col-md-3">
            <MDBCard className="shadow-3">
              <MDBCardBody className="text-center">
                <h6 className="text-muted">Available Seats</h6>
                <h2 className="text-success">
                  {stats.capacity - (stats.counts?.enrolled || 0)}
                </h2>
                <small>Utilization: {stats.utilization}</small>
              </MDBCardBody>
            </MDBCard>
          </div>
          <div className="col-md-3">
            <MDBCard className="shadow-3">
              <MDBCardBody className="text-center">
                <h6 className="text-muted">Dropped</h6>
                <h2 className="text-warning">{stats.counts?.dropped || 0}</h2>
                <small>Withdrawn students</small>
              </MDBCardBody>
            </MDBCard>
          </div>
          <div className="col-md-3">
            <MDBCard className="shadow-3">
              <MDBCardBody className="text-center">
                <h6 className="text-muted">Completed</h6>
                <h2 className="text-info">{stats.counts?.completed || 0}</h2>
                <small>Finished the course</small>
              </MDBCardBody>
            </MDBCard>
          </div>
        </div>
      )}

      {/* Main Card */}
      <MDBCard className="shadow-4">
        <MDBCardBody>
          {/* Tabs Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "enrolled" ? "active" : ""}`}
                onClick={() => setActiveTab("enrolled")}
                style={{ cursor: "pointer" }}
              >
                <MDBIcon fas icon="user-graduate" className="me-2" />
                Enrolled Students ({stats?.counts?.enrolled || 0})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "available" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("available");
                  fetchFilterOptions();
                }}
                style={{ cursor: "pointer" }}
              >
                <MDBIcon fas icon="users" className="me-2" />
                Available Students
              </button>
            </li>
          </ul>

          {/* Tab Content - Enrolled Students */}
          {activeTab === "enrolled" ? (
            <div className="tab-pane fade show active">
              <div className="table-responsive">
                <MDBTable striped hover>
                  <MDBTableHead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Enrollment Date</th>
                      <th>Actions</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {enrolledStudents.length > 0 ? (
                      enrolledStudents.map((student) => (
                        <tr key={student._id}>
                          <td>{student.studentDetails?.rollNo || "N/A"}</td>
                          <td>
                            <strong>
                              {student.studentDetails?.firstName}{" "}
                              {student.studentDetails?.lastName}
                            </strong>
                          </td>
                          <td>
                            <MDBBadge
                              color={
                                student.status === "enrolled"
                                  ? "success"
                                  : student.status === "dropped"
                                  ? "warning"
                                  : "info"
                              }
                              pill
                            >
                              {student.status}
                            </MDBBadge>
                          </td>
                          <td>
                            {new Date(student.enrollmentDate).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="custom-dropdown" style={{ position: "relative" }}>
                              <button
                                className="btn btn-sm btn-secondary dropdown-toggle"
                                onClick={() => toggleDropdown(student._id)}
                                style={{ minWidth: "80px" }}
                              >
                                Actions
                              </button>

                              {openDropdown === student._id && (
                                <ul
                                  className="dropdown-menu show"
                                  style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    zIndex: 1000,
                                    display: "block",
                                    minWidth: "180px",
                                    padding: "0.5rem 0",
                                    margin: "0.125rem 0 0",
                                    fontSize: "0.875rem",
                                    backgroundColor: "#fff",
                                    backgroundClip: "padding-box",
                                    border: "1px solid rgba(0,0,0,0.15)",
                                    borderRadius: "0.375rem",
                                    boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.15)",
                                  }}
                                >
                                  {student.status === "enrolled" && (
                                    <>
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => {
                                            handleUpdateStatus(
                                              student.student,
                                              "completed",
                                              student.studentDetails?.firstName
                                            );
                                            setOpenDropdown(null);
                                          }}
                                          style={{
                                            display: "block",
                                            width: "100%",
                                            padding: "0.25rem 1rem",
                                            clear: "both",
                                            fontWeight: "400",
                                            color: "#212529",
                                            textAlign: "inherit",
                                            textDecoration: "none",
                                            whiteSpace: "nowrap",
                                            backgroundColor: "transparent",
                                            border: 0,
                                            cursor: "pointer",
                                          }}
                                        >
                                          <MDBIcon fas icon="check-circle" className="me-2 text-success" />
                                          Mark as Completed
                                        </button>
                                      </li>
                                      <li>
                                        <hr className="dropdown-divider" style={{ margin: "0.25rem 0" }} />
                                      </li>
                                    </>
                                  )}
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => {
                                        handleRemoveStudent(
                                          student.student,
                                          student.studentDetails?.firstName
                                        );
                                        setOpenDropdown(null);
                                      }}
                                      style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "0.25rem 1rem",
                                        clear: "both",
                                        fontWeight: "400",
                                        textAlign: "inherit",
                                        textDecoration: "none",
                                        whiteSpace: "nowrap",
                                        backgroundColor: "transparent",
                                        border: 0,
                                        cursor: "pointer",
                                      }}
                                    >
                                      <MDBIcon fas icon="trash" className="me-2" />
                                      Remove from Class
                                    </button>
                                  </li>
                                </ul>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          <div className="py-4">
                            <MDBIcon fas icon="user-graduate" size="3x" className="text-muted mb-3" />
                            <p className="text-muted">No students enrolled in this class</p>
                            <MDBBtn color="primary" size="sm" onClick={() => setActiveTab("available")}>
                              <MDBIcon fas icon="user-plus" className="me-2" />
                              Enroll Students
                            </MDBBtn>
                          </div>
                        </td>
                      </tr>
                    )}
                  </MDBTableBody>
                </MDBTable>
              </div>
            </div>
          ) : (
            // Tab Content - Available Students
            <div className="tab-pane fade show active">
              {/* Filters Section */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <MDBInput
                    label="Search Students"
                    icon="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="">All Departments ({departmentOptions.length})</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                  >
                    <option value="">All Semesters ({semesterOptions.length})</option>
                    {semesterOptions.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                    <option value="500">500 per page</option>
                    <option value="1000">1000 per page</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <div className="d-flex gap-2">
                    <MDBBtn color="primary" onClick={handleEnrollSelected} style={{ flex: 1 }}>
                      <MDBIcon fas icon="user-plus" className="me-2" />
                      Enroll ({selectedStudents.length})
                    </MDBBtn>
                    {(searchTerm || filterDepartment || filterSemester) && (
                      <MDBBtn color="secondary" onClick={clearFilters}>
                        <MDBIcon fas icon="times" />
                      </MDBBtn>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Bar */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <small className="text-muted">
                  Showing {availableStudents.length} of {totalStudents} students (Page {currentPage} of {totalPages})
                </small>
              </div>

              {/* Available Students Table */}
              <div className="table-responsive">
                <MDBTable hover>
                  <MDBTableHead>
                    <tr>
                      <th style={{ width: "50px" }}>
                        <input
                          type="checkbox"
                          checked={
                            selectedStudents.length === availableStudents.length &&
                            availableStudents.length > 0
                          }
                          onChange={selectAllStudents}
                        />
                      </th>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Status</th>
                      <th>Schedule Conflict</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {availableStudents.length > 0 ? (
                      availableStudents.map((student) => (
                        <tr key={student._id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student._id)}
                              onChange={() => toggleStudentSelection(student._id)}
                              disabled={student.hasScheduleConflict}
                            />
                          </td>
                          <td>{student.rollNo || "N/A"}</td>
                          <td>
                            <strong>
                              {student.firstName} {student.lastName}
                            </strong>
                          </td>
                          <td>{student.enrollment?.department || "N/A"}</td>
                          <td>{student.enrollment?.semester || "N/A"}</td>
                          <td>
                            <MDBBadge color="success" pill>
                              Active
                            </MDBBadge>
                          </td>
                          <td>
                            {student.hasScheduleConflict ? (
                              <span className="text-danger">
                                <MDBIcon fas icon="exclamation-triangle" />
                                <small className="ms-1">Conflict!</small>
                              </span>
                            ) : (
                              <span className="text-success">
                                <MDBIcon fas icon="check-circle" />
                                <small className="ms-1">Available</small>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <MDBIcon fas icon="users" size="3x" className="text-muted mb-3" />
                          <p className="text-muted">No available students found</p>
                          {(searchTerm || filterDepartment || filterSemester) && (
                            <MDBBtn color="secondary" size="sm" onClick={clearFilters}>
                              Clear Filters
                            </MDBBtn>
                          )}
                        </td>
                      </tr>
                    )}
                  </MDBTableBody>
                </MDBTable>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <MDBPagination>
                    <MDBPaginationItem disabled={currentPage === 1}>
                      <MDBPaginationLink onClick={() => setCurrentPage(currentPage - 1)}>
                        Previous
                      </MDBPaginationLink>
                    </MDBPaginationItem>
                    {[...Array(totalPages)].map((_, i) => {
                      // Show limited page numbers for better UX
                      if (
                        i + 1 === 1 ||
                        i + 1 === totalPages ||
                        (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2)
                      ) {
                        return (
                          <MDBPaginationItem key={i} active={currentPage === i + 1}>
                            <MDBPaginationLink onClick={() => setCurrentPage(i + 1)}>
                              {i + 1}
                            </MDBPaginationLink>
                          </MDBPaginationItem>
                        );
                      } else if (
                        (i + 1 === currentPage - 3 && currentPage > 4) ||
                        (i + 1 === currentPage + 3 && currentPage < totalPages - 3)
                      ) {
                        return <MDBPaginationItem key={i}>...</MDBPaginationItem>;
                      }
                      return null;
                    })}
                    <MDBPaginationItem disabled={currentPage === totalPages}>
                      <MDBPaginationLink onClick={() => setCurrentPage(currentPage + 1)}>
                        Next
                      </MDBPaginationLink>
                    </MDBPaginationItem>
                  </MDBPagination>
                </div>
              )}
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};
export default ManageEnrollment;