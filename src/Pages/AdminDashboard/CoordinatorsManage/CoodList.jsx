import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Coordinator.css';

const CoodList = () => {
  const [coordinators, setCoordinators] = useState([
    {
      id: 1,
      coordId: 'COORD-001',
      name: 'Dr. Sarah Ahmed',
      email: 'sarah.ahmed@university.edu.pk',
      phone: '+92 300 1234567',
      department: 'Computer Science',
      role: 'Department Coordinator',
      assignedPrograms: ['BS Computer Science', 'MS Computer Science'],
      studentsManaged: 450,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      joiningDate: '2020-01-15'
    },
    {
      id: 2,
      coordId: 'COORD-002',
      name: 'Engr. Usman Ali',
      email: 'usman.ali@university.edu.pk',
      phone: '+92 301 2345678',
      department: 'Electrical Engineering',
      role: 'Semester Coordinator',
      assignedPrograms: ['BS Electrical Engineering'],
      studentsManaged: 320,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      joiningDate: '2021-03-20'
    },
    {
      id: 3,
      coordId: 'COORD-003',
      name: 'Dr. Fatima Khan',
      email: 'fatima.khan@university.edu.pk',
      phone: '+92 302 3456789',
      department: 'Mechanical Engineering',
      role: 'Examination Coordinator',
      assignedPrograms: ['BS Mechanical Engineering'],
      studentsManaged: 280,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      joiningDate: '2019-09-01'
    },
    {
      id: 4,
      coordId: 'COORD-004',
      name: 'Engr. Hassan Raza',
      email: 'hassan.raza@university.edu.pk',
      phone: '+92 303 4567890',
      department: 'Software Engineering',
      role: 'Department Coordinator',
      assignedPrograms: ['BS Software Engineering'],
      studentsManaged: 380,
      status: 'On Leave',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      joiningDate: '2020-06-15'
    }
  ]);


  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const departments = ['all', ...new Set(coordinators.map(c => c.department))];
  const roles = ['all', 'Department Coordinator', 'Semester Coordinator', 'Program Coordinator' , 'Fee Coordinator', 'Examination Coordinator'];

  const filteredCoordinators = coordinators.filter(coord => {
    const matchesSearch = coord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coord.coordId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || coord.department === filterDepartment;
    const matchesRole = filterRole === 'all' || coord.role === filterRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
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

  return (
    <div className="cood-list-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="fas fa-user-tie me-3"></i>Coordinators Management
            </h1>
            <p className="page-subtitle">
              Manage program and department coordinators
            </p>
          </div>
          <div className="header-actions">
            <Link to="/admin/dashboard/coordinators/add" className="btn btn-primary btn-lg">
              <i className="fas fa-user-plus me-2"></i>Add Coordinator
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-primary">
                <i className="fas fa-user-tie"></i>
              </div>
              <div className="stat-info">
                <h3>{coordinators.length}</h3>
                <p>Total Coordinators</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-success">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="stat-info">
                <h3>{coordinators.filter(c => c.status === 'Active').length}</h3>
                <p>Active</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-info">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>{coordinators.reduce((sum, c) => sum + c.studentsManaged, 0)}</h3>
                <p>Students Managed</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card-small">
              <div className="stat-icon bg-warning">
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
                placeholder="Search by name or coordinator ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            <select
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinators Grid */}
          <div className="coordinators-grid">
            {filteredCoordinators.map(coord => (
              <div key={coord.id} className="coordinator-card">
                <div className="coord-card-header">
                  <img src={coord.image} alt={coord.name} className="coord-avatar" />
                  {getStatusBadge(coord.status)}
                </div>
                <div className="coord-card-body">
                  <h3 className="coord-name">{coord.name}</h3>
                  <p className="coord-role">{coord.role}</p>
                  <p className="coord-id">
                    <i className="fas fa-id-badge me-2"></i>
                    {coord.coordId}
                  </p>
                  <p className="coord-dept">
                    <i className="fas fa-building me-2"></i>
                    {coord.department}
                  </p>
                  <p className="coord-detail">
                    <i className="fas fa-envelope me-2"></i>
                    {coord.email}
                  </p>
                  <p className="coord-detail">
                    <i className="fas fa-phone me-2"></i>
                    {coord.phone}
                  </p>
                  
                  <div className="programs-section">
                    <h4>Assigned Programs</h4>
                    {coord.assignedPrograms.map((program, index) => (
                      <span key={index} className="program-badge">
                        {program}
                      </span>
                    ))}
                  </div>

                  <div className="coord-stats">
                    <div className="stat-item">
                      <i className="fas fa-users"></i>
                      <span>{coord.studentsManaged} Students</span>
                    </div>
                    <div className="stat-item">
                      <i className="fas fa-calendar"></i>
                      <span>Since {new Date(coord.joiningDate).getFullYear()}</span>
                    </div>
                  </div>
                </div>
                <div className="coord-card-footer">
                  <button className="btn-action btn-view" title="View Details">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="btn-action btn-edit" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn-action btn-delete" title="Remove">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCoordinators.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h3>No Coordinators Found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoodList;