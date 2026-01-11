import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Student.css';
import axios from 'axios';
import { toast } from 'react-toastify';
const StudentList = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  // {
  //   id: 1,
  //   rollNo: 'CS-2024-001',
  //   name: 'Ahmed Ali Khan',
  //   email: 'ahmed.ali@university.edu.pk',
  //   phone: '+92 300 1234567',
  //   department: 'Computer Science',
  //   semester: '4th',
  //   section: 'A',
  //   cgpa: 3.45,
  //   status: 'Active',
  //   admissionDate: '2022-09-15',
  //   image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  // },
  // {
  //   id: 2,
  //   rollNo: 'CS-2024-002',
  //   name: 'Sara Ahmed',
  //   email: 'sara.ahmed@university.edu.pk',
  //   phone: '+92 301 2345678',
  //   department: 'Computer Science',
  //   semester: '6th',
  //   section: 'B',
  //   cgpa: 3.78,
  //   status: 'Active',
  //   admissionDate: '2021-09-15',
  //   image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  // },
  // {
  //   id: 3,
  //   rollNo: 'EE-2024-015',
  //   name: 'Muhammad Hassan',
  //   email: 'hassan.m@university.edu.pk',
  //   phone: '+92 302 3456789',
  //   department: 'Electrical Engineering',
  //   semester: '2nd',
  //   section: 'A',
  //   cgpa: 3.12,
  //   status: 'Active',
  //   admissionDate: '2023-09-15',
  //   image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
  // },
  // {
  //   id: 4,
  //   rollNo: 'CS-2024-045',
  //   name: 'Fatima Noor',
  //   email: 'fatima.noor@university.edu.pk',
  //   phone: '+92 303 4567890',
  //   department: 'Computer Science',
  //   semester: '4th',
  //   section: 'C',
  //   cgpa: 3.92,
  //   status: 'Active',
  //   admissionDate: '2022-09-15',
  //   image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
  // },
  // {
  //   id: 5,
  //   rollNo: 'ME-2024-023',
  //   name: 'Ali Raza',
  //   email: 'ali.raza@university.edu.pk',
  //   phone: '+92 304 5678901',
  //   department: 'Mechanical Engineering',
  //   semester: '8th',
  //   section: 'A',
  //   cgpa: 3.56,
  //   status: 'Active',
  //   admissionDate: '2020-09-15',
  //   image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
  // },
  // {
  //   id: 6,
  //   rollNo: 'CS-2023-089',
  //   name: 'Ayesha Malik',
  //   email: 'ayesha.malik@university.edu.pk',
  //   phone: '+92 305 6789012',
  //   department: 'Computer Science',
  //   semester: '5th',
  //   section: 'B',
  //   cgpa: 3.68,
  //   status: 'Suspended',
  //   admissionDate: '2022-01-15',
  //   image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
  // }
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  useEffect(() => {
    const fetchallStudentList = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate('/admin/login');
          return;
        }
        const res = await axios.get("http://localhost:8000/api/admin/stats/students/all", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        console.log('API Response:', res.data);

        if (res.data && res.data.success) {
          setStudents(res.data.students);
        //    console.log('Received students with statuses:', 
        //   res.data.students.map(s => ({ name: s.firstName, status: s.status }))
        // );
        }
        else {
          toast.error('Failed to fetch students');
        }
      } catch (error) {
        console.log("Failed to fetch student records", error);
        if (error.response?.status === 401) {
          toast.error("Unauthorized --- Please Login");
          localStorage.removeItem("adminToken");
          navigate('/admin/login');
        }
        else if (error.response?.status === 403) {
          toast.error('Forbidden - You do not have permission');
        }
        else {
          toast.error('Failed to fetch student records');
        }
      }
    }
    fetchallStudentList();
  }, [navigate]);


  const handleDeleteStudent = async (studentId, studentName) => {

    setDeleteLoading(studentId);
    const isConfirmed = window.confirm(`Are you sure you want to Delete student ${studentName}`);
    if (!isConfirmed) {
      return;
    }
    try {
      const token = localStorage.getItem("adminToken")
      const res = await axios.delete(`http://localhost:8000/api/admin/student/delete/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.data.success) {
        toast.success(`Student ${studentName} was deleted successfully`);
        setStudents(prevStudent => prevStudent.filter(student => student._id !== studentId))
        setSelectedStudents(prev => prev.filter(id => id !== studentId));
        // console.log("Student remove from local state");
      }
      else {
        toast.error(res.data.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized! Please login again.");
        localStorage.removeItem("adminToken");
        navigate('/admin/login');
      } else if (error.response?.status === 404) {
        toast.error("Student not found!");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error deleting student");
      }
    } finally {
      setDeleteLoading(null);
    }
  }

  const handleBulkDelete = async () => {

    if (selectedStudents.lengh === 0) {
      toast.warning("No Students selected for deletion. Please Select the students");
      return;
    }
    const isConfirmed = window.confirm(`Are you sure you want to delete ${selectedStudents.length} 
        selected students. This action cannot be undone.`)
    if (!isConfirmed) {
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.post("http://localhost:8000/api/admin/student/delete-bulk",
        { studentIds: selectedStudents },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (res.data.success) {
        toast.success(`${res.data.deletedCount} student(s) deleted successfully!`)
        setStudents(prevStudents =>
          prevStudents.filter(student => !selectedStudents.includes(student._id))
        );
        setSelectedStudents([]);
      }
      else {
        toast.error(res.data.message || 'Failed to delete students');
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized! Please login again.");
        localStorage.removeItem("adminToken");
        navigate('/admin/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error deleting students");
      }
    } finally {
      setLoading(false);
    }
  }
// Get unique departments
const departments = ['all', ...new Set(students.map(s => s.department))];
const semesters = ['all', '2nd', '4th', '5th', '6th', '8th'];

// Filter students
const filteredStudents = students.filter(student => {
  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
  const studentRollNo = student.rollNo ? student.rollNo.toLowerCase() : '';
  const studentEmail = student?.user?.email ? student?.user?.email.toLowerCase() : '';


  const matchesSearch =
    studentName.includes(searchTerm.toLowerCase()) ||
    studentRollNo.includes(searchTerm.toLowerCase()) ||
    studentEmail.includes(searchTerm.toLowerCase());

  const studentDepartment = student.enrollment?.department || student.department;
  const matchesDepartment = filterDepartment === 'all' || studentDepartment === filterDepartment;

  // const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
  const studentSemester = student.enrollment?.semester || student.semester;
  const matchesSemester = filterSemester === 'all' || studentSemester === filterSemester;

  // const matchesSemester = filterSemester === 'all' || student.semester === filterSemester;
  const studentStatus = student.status || 'Unknown';
  const matchesStatus = filterStatus === 'all' || studentStatus === filterStatus;

  // const matchesStatus = filterStatus === 'all' || student.status === filterStatus;

  return matchesSearch && matchesDepartment && matchesSemester && matchesStatus;
});

// Pagination
const indexOfLastStudent = currentPage * studentsPerPage;
const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

// Select/Deselect student
const toggleSelectStudent = (id) => {
  setSelectedStudents(prev =>
    prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
  );
};

// Select all students
const toggleSelectAll = () => {
  if (selectedStudents.length === currentStudents.length) {
    setSelectedStudents([]);
  } else {
    setSelectedStudents(currentStudents.map(s => s.id));
  }
};

// Export to CSV
const exportToCSV = () => {
  const headers = ['Roll No', 'Name', 'Email', 'Phone', 'Department', 'Semester', 'CGPA', 'Status'];
  const csvData = filteredStudents.map(s => [
    s.rollNo, s.name, s.email, s.phone, s.department, s.semester, s.cgpa, s.status
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'students_list.csv';
  a.click();
};

const getStatusBadge = (status) => {
  const statusConfig = {
    'Active': { class: 'badge-success', icon: 'fa-check-circle' },
    'Suspended': { class: 'badge-warning', icon: 'fa-exclamation-circle' },
    'Graduated': { class: 'badge-info', icon: 'fa-graduation-cap' },
    'Inactive': { class: 'badge-secondary', icon: 'fa-times-circle' }
  };
  const config = statusConfig[status] || statusConfig['Active'];
  return (
    <span className={`status-badge ${config.class}`}>
      <i className={`fas ${config.icon} me-1`}></i>
      {status}
    </span>
  );
};

return (
  <div className="student-list-container">
    <div className="container-fluid">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <i className="fas fa-users me-3"></i>Student Management
          </h1>
          <p className="page-subtitle">
            Manage and view all registered students
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline-light btn-lg me-2" onClick={exportToCSV}>
            <i className="fas fa-download me-2"></i>Export
          </button>
          <Link to="/admin/dashboard/students/assign" className="btn btn-primary btn-lg">
            <i className="fas fa-user-plus me-2"></i>Add Student
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card-small">
            <div className="stat-icon bg-primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>{students.length}</h3>
              <p>Total Students</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card-small">
            <div className="stat-icon bg-success">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-info">
              <h3>{students.filter(s => s.status === 'Active').length}</h3>
              <p>Active Students</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card-small">
            <div className="stat-icon bg-warning">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="stat-info">
              <h3>{students.filter(s => s.status === 'Suspend').length}</h3>
              <p>Suspended</p>
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
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="fas fa-filter me-2"></i>
            Filters
            {showFilters ? <i className="fas fa-chevron-up ms-2"></i> : <i className="fas fa-chevron-down ms-2"></i>}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="filters-panel">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Semester</label>
                <select
                  className="form-select"
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                >
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>
                      {sem === 'all' ? 'All Semesters' : sem + ' Semester'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Approved">Approved</option>
                  <option value="unassigned">Roll Unassign</option>
                  <option value="rejected">Rejected</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selected-count">
              {selectedStudents.length} student(s) selected
            </span>
            <div className="bulk-actions">
              <button className="btn btn-sm btn-success me-2">
                <i className="fas fa-envelope me-1"></i>Send Email
              </button>
              <button className="btn btn-sm btn-warning me-2">
                <i className="fas fa-ban me-1"></i>Suspend
              </button>
              <button className="btn btn-sm btn-danger"
                onClick={handleBulkDelete}
                disabled={loading}

              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-1"></i>Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash me-1"></i>Delete Selected
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="table-responsive">
          <table cellPadding="10" cellSpacing="0" width="100%" className="students-table ">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Department</th>
                <th>Semester</th>
                <th>CGPA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
             <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading students...</p>
                    </td>
                  </tr>
                ) : currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <i className="fas fa-users fa-2x text-muted mb-3"></i>
                      <p>No students found</p>
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student) => {
                    const fullName = `${student.firstName} ${student.lastName}`;
                    const department = student.enrollment?.department || 'N/A';
                    const semester = student.enrollment?.semester || 'N/A';
                    const image = student.profileImage?.url || 'https://via.placeholder.com/100';

                    return (
                      <tr key={student._id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => toggleSelectStudent(student._id)}
                          />
                        </td>
                        <td>
                          <div className="student-info">
                            <img src={image} alt={fullName} className="student-avatar" />
                            <div>
                              <div className="student-name">{fullName}</div>
                              <div className="student-email">{student?.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="roll-number">{student.rollNo || 'N/A'}</span>
                        </td>
                        <td>{department}</td>
                        <td>
                          <span className="semester-badge">{semester}</span>
                        </td>
                        <td>
                          <span className={`cgpa-badge ${student.cgpa >= 3.5 ? 'high' : student.cgpa >= 3.0 ? 'medium' : 'low'}`}>
                            {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
                          </span>
                        </td>
                        <td>{getStatusBadge(student.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action btn-view" 
                              title="View Details"
                              onClick={() => navigate(`/admin/dashboard/students/view/${student._id}`)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn-action btn-edit" 
                              title="Edit"
                              onClick={() => navigate(`/admin/dashboard/students/update/${student._id}`)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn-action btn-delete" 
                              title="Delete"
                              onClick={() => handleDeleteStudent(student._id, fullName)}
                              disabled={deleteLoading === student._id}
                            >
                              {deleteLoading === student._id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-trash"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-section">
            <div className="pagination-info">
              Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`btn btn-sm ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

}
export default StudentList;