import React, { useEffect, useState } from "react";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon,
  MDBBadge,
  MDBSpinner,
  MDBTooltip,
  MDBPagination,
  MDBPaginationItem,
  MDBPaginationLink,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../../../api";
import { toast } from "react-toastify";
// import "./ClassList.css";

const ClassList = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  
  // Department and semester options
  const [departments, setDepartments] = useState(["all"]);
  const semesters = ["all", 1, 2, 3, 4, 5, 6, 7, 8];

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [classes, searchTerm, filterDepartment, filterSemester, filterStatus]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      const response = await AdminAPI.get("/classes/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Classes response:", response.data);

      if (response.data && response.data.success) {
        const classData = response.data.data || [];
        setClasses(classData);
        setFilteredClasses(classData);
        
        // Extract unique departments for filter
        const depts = ["all", ...new Set(classData.map(c => c.department).filter(Boolean))];
        setDepartments(depts);
        
        toast.success(`Loaded ${classData.length} classes`);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...classes];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.className?.toLowerCase().includes(term) ||
          cls.classCode?.toLowerCase().includes(term) ||
          cls.subject?.toLowerCase().includes(term) ||
          cls.teachers?.some(t => t.name?.toLowerCase().includes(term))
      );
    }

    // Apply department filter
    if (filterDepartment !== "all") {
      filtered = filtered.filter((cls) => cls.department === filterDepartment);
    }

    // Apply semester filter
    if (filterSemester !== "all") {
      filtered = filtered.filter((cls) => cls.semester === parseInt(filterSemester));
    }

    // Apply status filter
    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        filtered = filtered.filter((cls) => cls.isActive === true);
      } else if (filterStatus === "inactive") {
        filtered = filtered.filter((cls) => cls.isActive === false);
      } else if (filterStatus === "completed") {
        // You can define your own logic for completed
        filtered = filtered.filter((cls) => cls.status === "completed");
      }
    }

    setFilteredClasses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("all");
    setFilterSemester("all");
    setFilterStatus("all");
  };

  const handleViewClass = (id) => {
    navigate(`/admin/dashboard/classes/${id}`);
  };

  const handleEditClass = (id) => {
    navigate(`/admin/dashboard/classes/edit/${id}`);
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this class?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await AdminAPI.delete(`/classes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        toast.success("Class deactivated successfully");
        fetchClasses(); // Refresh the list
      } catch (error) {
        console.error("Error deactivating class:", error);
        toast.error("Failed to deactivate class");
      }
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get status badge color
  const getStatusBadge = (isActive) => {
    return isActive ? "success" : "secondary";
  };

  // Get semester badge color
  const getSemesterBadge = (semester) => {
    const colors = ["info", "primary", "warning", "success", "danger", "dark", "info", "primary"];
    return colors[semester - 1] || "secondary";
  };

  return (
    <>
      <div className="class-list-container">
        <MDBContainer fluid className="py-4">
          {/* Header Card */}
          <MDBCard className="shadow-4 header-card mb-4">
            <MDBCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="page-title">
                    <i className="fas fa-chalkboard-teacher me-3 text-primary"></i>
                    Class Management
                  </h2>
                  <p className="text-muted mb-0">
                    Manage all your classes, schedules, and assignments
                  </p>
                </div>
                <MDBBtn
                  className="create-btn"
                  onClick={() => navigate("/admin/dashboard/classes/createclass")}
                >
                  <MDBIcon fas icon="plus" className="me-2" />
                  Create New Class
                </MDBBtn>
              </div>
            </MDBCardBody>
          </MDBCard>

          {/* Search and Filter Section */}
          <MDBCard className="shadow-3 filter-card mb-4">
            <MDBCardBody>
              <div className="search-filter-section">
                <div className="search-box-wrapper">
                  <div className="search-box">
                    <i className="fas fa-search search-icon"></i>
                    <input
                      type="text"
                      placeholder="Search by class name, code, subject, or teacher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    {searchTerm && (
                      <button
                        className="clear-search"
                        onClick={() => setSearchTerm("")}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="filter-actions">
                  <button
                    className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className="fas fa-filter me-2"></i>
                    Filters
                    <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'} ms-2`}></i>
                  </button>
                  
                  {(searchTerm || filterDepartment !== "all" || filterSemester !== "all" || filterStatus !== "all") && (
                    <button
                      className="clear-filters-btn"
                      onClick={clearFilters}
                    >
                      <i className="fas fa-times me-1"></i>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="filters-panel animate-slide-down">
                  <div className="row g-4">
                    <div className="col-md-4">
                      <label className="filter-label">
                        <i className="fas fa-building me-2"></i>
                        Department
                      </label>
                      <select
                        className="filter-select"
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept === "all" ? "All Departments" : dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-4">
                      <label className="filter-label">
                        <i className="fas fa-layer-group me-2"></i>
                        Semester
                      </label>
                      <select
                        className="filter-select"
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                      >
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            {sem === "all" ? "All Semesters" : `${sem}${getOrdinalSuffix(sem)} Semester`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-4">
                      <label className="filter-label">
                        <i className="fas fa-circle me-2"></i>
                        Status
                      </label>
                      <select
                        className="filter-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className="results-count">
                <i className="fas fa-list-ul me-2"></i>
                Showing {currentItems.length} of {filteredClasses.length} classes
              </div>
            </MDBCardBody>
          </MDBCard>

          {/* Classes Table Card */}
          <MDBCard className="shadow-4 table-card">
            <MDBCardBody>
              <div className="table-header">
                <h5 className="mb-0">
                  <i className="fas fa-table me-2 text-primary"></i>
                  Class List
                </h5>
                <div className="table-actions">
                  <button className="btn-refresh" onClick={fetchClasses}>
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <MDBSpinner role="status" color="primary" size="lg">
                    <span className="visually-hidden">Loading...</span>
                  </MDBSpinner>
                  <p className="mt-3 text-muted">Loading classes...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="class-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Class Details</th>
                          <th>Department</th>
                          <th>Semester</th>
                          <th>Section</th>
                          <th>Schedule</th>
                          <th>Teacher</th>
                          <th>Students</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length > 0 ? (
                          currentItems.map((cls, index) => (
                            <tr key={cls._id} className="class-row">
                              <td>
                                <span className="row-number">
                                  {indexOfFirstItem + index + 1}
                                </span>
                              </td>
                              
                              <td>
                                <div className="class-info">
                                  <div className="class-name">{cls.className}</div>
                                  <div className="class-code">{cls.classCode}</div>
                                  <div className="class-subject">{cls.subject}</div>
                                </div>
                              </td>
                              
                              <td>
                                <MDBBadge color="info" pill className="department-badge">
                                  {cls.department}
                                </MDBBadge>
                              </td>
                              
                              <td>
                                <MDBBadge color={getSemesterBadge(cls.semester)} pill className="semester-badge">
                                  {cls.semester}
                                </MDBBadge>
                              </td>
                              
                              <td>
                                <span className="section-badge">{cls.section || 'A'}</span>
                              </td>
                              
                              <td>
                                <div className="schedule-info">
                                  {cls.schedule && cls.schedule.length > 0 ? (
                                    <>
                                      <MDBTooltip
                                        tag="span"
                                        title={cls.schedule.map(s => 
                                          `${s.day} ${s.startTime}-${s.endTime} (${s.room})`
                                        ).join(', ')}
                                      >
                                        <span className="schedule-count">
                                          <i className="far fa-calendar-alt me-1"></i>
                                          {cls.schedule.length} slot{cls.schedule.length > 1 ? 's' : ''}
                                        </span>
                                      </MDBTooltip>
                                      <div className="schedule-preview">
                                        {cls.schedule.slice(0, 1).map((s, i) => (
                                          <span key={i} className="schedule-item">
                                            {s.day}, {s.startTime}
                                          </span>
                                        ))}
                                        {cls.schedule.length > 1 && (
                                          <span className="more-schedule">+{cls.schedule.length - 1}</span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-muted">No schedule</span>
                                  )}
                                </div>
                              </td>
                              
                              <td>
                                <div className="teacher-info">
                                  {cls.teachers && cls.teachers.length > 0 ? (
                                    <>
                                      <div className="teacher-avatar">
                                        {cls.teachers[0]?.name?.charAt(0) || 'T'}
                                      </div>
                                      <div className="teacher-details">
                                        <div className="teacher-name">{cls.teachers[0]?.name || 'N/A'}</div>
                                        <div className="teacher-role">{cls.teachers[0]?.role || 'Teacher'}</div>
                                      </div>
                                      {cls.teachers.length > 1 && (
                                        <MDBTooltip
                                          tag="span"
                                          title={cls.teachers.slice(1).map(t => t.name).join(', ')}
                                        >
                                          <span className="more-teachers">+{cls.teachers.length - 1}</span>
                                        </MDBTooltip>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-muted">No teacher</span>
                                  )}
                                </div>
                              </td>
                              
                              <td>
                                <div className="students-count">
                                  <i className="fas fa-user-graduate me-1"></i>
                                  <span>{cls.enrolledCount || 0}</span>
                                  <span className="capacity">/{cls.capacity || 50}</span>
                                </div>
                              </td>
                              
                              <td>
                                <MDBBadge color={getStatusBadge(cls.isActive)} pill className="status-badge">
                                  {cls.isActive ? 'Active' : 'Inactive'}
                                </MDBBadge>
                              </td>
                              
                              <td>
                                <div className="action-buttons">
                                  <MDBTooltip tag="span" title="View Details">
                                    <button
                                      className="action-btn view-btn"
                                      onClick={() => handleViewClass(cls._id)}
                                    >
                                      <i className="fas fa-eye"></i>
                                    </button>
                                  </MDBTooltip>
                                  
                                  <MDBTooltip tag="span" title="Edit Class">
                                    <button
                                      className="action-btn edit-btn"
                                      onClick={() => handleEditClass(cls._id)}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                  </MDBTooltip>
                                  
                                  <MDBTooltip tag="span" title={cls.isActive ? 'Deactivate' : 'Activate'}>
                                    <button
                                      className={`action-btn ${cls.isActive ? 'delete-btn' : 'restore-btn'}`}
                                      onClick={() => handleDeleteClass(cls._id)}
                                    >
                                      <i className={`fas fa-${cls.isActive ? 'trash' : 'undo'}`}></i>
                                    </button>
                                  </MDBTooltip>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="empty-state">
                              <div className="empty-state-content">
                                <i className="fas fa-chalkboard-teacher fa-3x mb-3 text-muted"></i>
                                <h5>No Classes Found</h5>
                                <p className="text-muted">
                                  {searchTerm || filterDepartment !== "all" || filterSemester !== "all" || filterStatus !== "all"
                                    ? "No classes match your search criteria. Try adjusting your filters."
                                    : "Start by creating your first class"}
                                </p>
                                {(searchTerm || filterDepartment !== "all" || filterSemester !== "all" || filterStatus !== "all") ? (
                                  <button className="btn btn-outline-primary" onClick={clearFilters}>
                                    <i className="fas fa-times me-2"></i>
                                    Clear Filters
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => navigate("/admin/dashboard/classes/createclass")}
                                  >
                                    <i className="fas fa-plus me-2"></i>
                                    Create Class
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {filteredClasses.length > itemsPerPage && (
                    <div className="pagination-wrapper">
                      <MDBPagination className="mb-0 custom-pagination">
                        <MDBPaginationItem disabled={currentPage === 1}>
                          <MDBPaginationLink
                            onClick={() => paginate(currentPage - 1)}
                            aria-label="Previous"
                          >
                            <span aria-hidden="true">
                              <i className="fas fa-chevron-left"></i>
                            </span>
                          </MDBPaginationLink>
                        </MDBPaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <MDBPaginationItem key={i + 1} active={currentPage === i + 1}>
                            <MDBPaginationLink onClick={() => paginate(i + 1)}>
                              {i + 1}
                            </MDBPaginationLink>
                          </MDBPaginationItem>
                        ))}
                        
                        <MDBPaginationItem disabled={currentPage === totalPages}>
                          <MDBPaginationLink
                            onClick={() => paginate(currentPage + 1)}
                            aria-label="Next"
                          >
                            <span aria-hidden="true">
                              <i className="fas fa-chevron-right"></i>
                            </span>
                          </MDBPaginationLink>
                        </MDBPaginationItem>
                      </MDBPagination>
                      
                      <div className="pagination-info">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClasses.length)} of {filteredClasses.length} entries
                      </div>
                    </div>
                  )}
                </>
              )}
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </div>
    </>
  );
};

// Helper function for ordinal suffixes
const getOrdinalSuffix = (num) => {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

export default ClassList;