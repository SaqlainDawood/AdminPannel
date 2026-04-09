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
  MDBPaginationLink
} from "mdb-react-ui-kit";
import { toast } from "react-toastify";
import {
  getClassStudents,
  getAvailableStudents,
  enrollBulkStudents,
  removeStudentFromClass,
  updateStudentStatus,
  getEnrollmentStats
} from "../../../classesAPI/studentEnrollmentAPI";

const ManageEnrollment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
  
  useEffect(() => {
    fetchEnrollmentStats();
    fetchEnrolledStudents();
  }, [id]);
  
  useEffect(() => {
    if (activeTab === "available") {
      fetchAvailableStudents();
    }
  }, [activeTab, searchTerm, filterDepartment, filterSemester, currentPage]);
  
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
  
  const fetchAvailableStudents = async () => {
    try {
      setLoading(true);
      const response = await getAvailableStudents(id, {
        search: searchTerm,
        department: filterDepartment,
        semester: filterSemester,
        page: currentPage,
        limit: 20
      });
      if (response.success) {
        setAvailableStudents(response.data.students || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to fetch available students");
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };
  
  const selectAllStudents = () => {
    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(availableStudents.map(s => s._id));
    }
  };
  
  if (loading) {
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
          <MDBBtn color="link" className="text-dark p-0 me-3" onClick={() => navigate(-1)}>
            <MDBIcon fas icon="arrow-left" size="lg" />
          </MDBBtn>
          <h3 className="d-inline">Manage Enrollment</h3>
        </div>
        <MDBBtn color="secondary" onClick={() => navigate(`/admin/dashboard/classes/view/${id}`)}>
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
                <h2 className="text-success">{stats.capacity - (stats.counts?.enrolled || 0)}</h2>
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
      
      {/* Tabs */}
      <MDBCard className="shadow-4">
        <MDBCardBody>
          {/* Custom Tabs Navigation */}
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
                onClick={() => setActiveTab("available")}
                style={{ cursor: "pointer" }}
              >
                <MDBIcon fas icon="users" className="me-2" />
                Available Students
              </button>
            </li>
          </ul>
          
          {/* Tab Content */}
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
                              {student.studentDetails?.firstName} {student.studentDetails?.lastName}
                            </strong>
                          </td>
                          <td>
                            <MDBBadge
                              color={student.status === "enrolled" ? "success" : student.status === "dropped" ? "warning" : "info"}
                              pill
                            >
                              {student.status}
                            </MDBBadge>
                          </td>
                          <td>{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                          <td>
                            <div className="dropdown">
                              <button className="btn btn-sm btn-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                Actions
                              </button>
                              <ul className="dropdown-menu">
                                {student.status === "enrolled" && (
                                  <>
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleUpdateStatus(student.student, "completed", student.studentDetails?.firstName)}
                                      >
                                        <MDBIcon fas icon="check-circle" className="me-2 text-success" />
                                        Mark as Completed
                                      </button>
                                    </li>
                                    <li>
                                      <hr className="dropdown-divider" />
                                    </li>
                                  </>
                                )}
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleRemoveStudent(student.student, student.studentDetails?.firstName)}
                                  >
                                    <MDBIcon fas icon="trash" className="me-2" />
                                    Remove from Class
                                  </button>
                                </li>
                              </ul>
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
            <div className="tab-pane fade show active">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <MDBInput
                    label="Search Students"
                    icon="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                  >
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>{sem}{sem === 1 ? "st" : sem === 2 ? "nd" : sem === 3 ? "rd" : "th"} Semester</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <MDBBtn color="primary" onClick={handleEnrollSelected} block>
                    <MDBIcon fas icon="user-plus" className="me-2" />
                    Enroll ({selectedStudents.length})
                  </MDBBtn>
                </div>
              </div>
              
              {/* Available Students Table */}
              <div className="table-responsive">
                <MDBTable hover>
                  <MDBTableHead>
                    <tr>
                      <th style={{ width: "50px" }}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === availableStudents.length && availableStudents.length > 0}
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
                            <strong>{student.firstName} {student.lastName}</strong>
                          </td>
                          <td>{student.enrollment?.department || "N/A"}</td>
                          <td>{student.enrollment?.semester || "N/A"}</td>
                          <td>
                            <MDBBadge color="success" pill>Active</MDBBadge>
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
                            <MDBBtn color="secondary" size="sm" onClick={() => {
                              setSearchTerm("");
                              setFilterDepartment("");
                              setFilterSemester("");
                            }}>
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
                    {[...Array(totalPages)].map((_, i) => (
                      <MDBPaginationItem key={i} active={currentPage === i + 1}>
                        <MDBPaginationLink onClick={() => setCurrentPage(i + 1)}>
                          {i + 1}
                        </MDBPaginationLink>
                      </MDBPaginationItem>
                    ))}
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