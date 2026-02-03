import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Faculty.css';
import { useEffect } from 'react';
import axios from 'axios'
import {toast} from 'react-toastify'
import { useNavigate } from 'react-router-dom';
const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading , setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterDesignation, setFilterDesignation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedView, setSelectedView] = useState('grid'); // 'grid' or 'table'
const navigate = useNavigate(); 
    useEffect(()=>{
      const fetchFaculties = async()=>{
        try {
          const res = await axios.get("http://localhost:8000/api/faculty/all")
          if(res.data.success){
            setFaculty(res.data.data);
            // console.log("Faculty Data:", res.data.data);
          }
        } catch (error) {
            console.error("Error fetching faculty:", error);
        }finally {
        setLoading(false);
      }
      }
      fetchFaculties();
    } , []);

   const handleDelete = async(id) => {
     if (!id) {
      toast.error("Invalid faculty ID");
      return;
    }
  const confirmDelete = window.confirm("Are you sure you want to delete this faculty member?");
  if(!confirmDelete) return
  
  const member = faculty.find(f => f._id === id);
  try {
    const res = await axios.delete(`http://localhost:8000/api/faculty/${id}`)        
    if(res.status === 200 && res.data.success){
      toast.success(`${member?.name || "Faculty"} was deleted successfully`)
      setFaculty((prev) => prev.filter((f) => f._id !== id));
    } else {
      toast.error(res.data.message || "Failed to delete faculty!");
      console.log("Delete Failed", res.data);
    }
  } 
  catch (error) {
    console.error("Error deleting faculty", error)
    toast.error(error.response?.data?.message || "Faculty not deleted! (Server error)");
  }
}
  const departments = ['all', ...new Set(faculty.map(f => f.department))];
  const designations = ['all', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesDesignation = filterDesignation === 'all' || member.designation === filterDesignation;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesDepartment&& matchesDesignation && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      'Active': { class: 'badge-success', icon: 'fa-check-circle' },
      'On Leave': { class: 'badge-warning', icon: 'fa-exclamation-circle' },
      'Inactive': { class: 'badge-secondary', icon: 'fa-times-circle' }
    };
    const c = config[status] || config['Active'];
    return (
      <span className={`status-badge ${c.class}`}>
        <i className={`fas ${c.icon} me-1`}></i>
        {status}
      </span>
    );
  };
 if (loading) {
    return (
      <div className="faculty-list-container text-center mt-5">
        <h3>Loading Faculty Data!!!!</h3>
      </div>
    );
  }
  return (
    <div className="faculty-list-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="fas fa-chalkboard-teacher me-3"></i>Faculty Management
            </h1>
            <p className="page-subtitle">
              Manage faculty members and their details
            </p>
          </div>
          <div className="header-actions">
            <Link to="/admin/dashboard/faculty/add" className="btn btn-primary btn-lg">
              <i className="fas fa-user-plus me-2"></i>Add Faculty
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-primary">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <div className="stat-info">
                <h3>{faculty.length}</h3>
                <p>Total Faculty</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-success">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="stat-info">
                <h3>{faculty.filter(f => f.status === 'Active').length}</h3>
                <p>Active</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-warning">
                <i className="fas fa-user-clock"></i>
              </div>
              <div className="stat-info">
                <h3>{faculty.filter(f => f.status === 'On Leave').length}</h3>
                <p>On Leave</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-info">
                <i className="fas fa-building"></i>
              </div>
              <div className="stat-info">
                <h3>{departments.length - 1}</h3>
                <p>Departments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="content-card">
          {/* Search and Filter */}
          <div className="search-filter-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, employee ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="view-toggle">
              <button
                className={`view-btn ${selectedView === 'grid' ? 'active' : ''}`}
                onClick={() => setSelectedView('grid')}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                className={`view-btn ${selectedView === 'table' ? 'active' : ''}`}
                onClick={() => setSelectedView('table')}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            <select
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map((dept , index) => (
                <option key={index} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
            >
              {designations.map((des , index) => (
                <option key={index} value={des}>
                  {des === 'all' ? 'All Designations' : des}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Grid View */}
          {selectedView === 'grid' && (
            <div className="faculty-grid">
              {filteredFaculty.map(member => (
                <div key={member._id} className="faculty-card">
                  <div className="faculty-card-header">
                    <img src={member.image} alt={member.name} className="faculty-avatar" />
                    {getStatusBadge(member.status)}
                  </div>
                  <div className="faculty-card-body">
                    <h3 className="faculty-name">{member.name}</h3>
                    <p className="faculty-designation">{member.designation}</p>
                    <p className="faculty-emp-id">
                      <i className="fas fa-id-badge me-2"></i>
                      {member.employeeID}
                    </p>
                    <p className="faculty-dept">
                      <i className="fas fa-building me-2"></i>
                      {member.department}
                    </p>
                    <p className="faculty-detail">
                      <i className="fas fa-envelope me-2"></i>
                      {member.email}
                    </p>
                    <p className="faculty-detail">
                      <i className="fas fa-phone me-2"></i>
                      {member.phone}
                    </p>
                    <div className="faculty-meta">
                      <div className="meta-item">
                        <i className="fas fa-book"></i>
                        <span>{member.coursesAssigned} Courses</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-clock"></i>
                        <span>{member.experience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="faculty-card-footer">
                    <button className="btn-action btn-view" title="View Details"
                    onClick={()=>navigate(`/admin/dashboard/faculty/view/${member._id}`)}>
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn-action btn-edit" title="Edit"
                    onClick={()=>navigate(`/admin/dashboard/faculty/update/${member._id}`)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-action btn-delete" title="Delete"
                      onClick={()=>handleDelete(member._id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {selectedView === 'table' && (
            <div className="table-responsive">
              <table className="faculty-table">
                <thead>
                  <tr>
                    <th>Faculty Member</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Courses</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.map(member => (
                    <tr key={member._id}>
                      <td>
                        <div className="faculty-info-table">
                          <img src={member.image} alt={member?.name} className="faculty-avatar-small" />
                          <div>
                            <div className="faculty-name-table">{member.name}</div>
                            <div className="faculty-email-table">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="emp-id-badge">{member.employeeID}</span>
                      </td>
                      <td>{member.department}</td>
                      <td>{member.designation}</td>
                      <td>
                        <span className="courses-badge">{member.coursesAssigned}</span>
                      </td>
                      <td>{getStatusBadge(member.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-action btn-view" title="View">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn-action btn-edit" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn-action btn-delete" title="Delete"
                          onClick={()=>handleDelete(member._id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {filteredFaculty.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h3>No Faculty Found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyList;