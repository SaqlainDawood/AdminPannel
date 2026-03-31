import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUniversity, 
  FaUsers, 
  FaExclamationTriangle, 
  FaChartLine, 
  FaBuilding, 
  FaFilter, 
  FaDownload,
  FaEye,
  FaSpinner,
  FaBuilding as FaDepartment,
  FaBook,
  FaGraduationCap,
  FaArrowRight
} from 'react-icons/fa';
import { MdWarning, MdSchool, MdOutlineDashboard } from 'react-icons/md';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { GiAlarmClock } from 'react-icons/gi';
import AdminAPI from '../../../api';
import './AttendanceOverview.css';

const AttendanceOverview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await AdminAPI.get('/attendance/overview');
      console.log('API Response:', response.data);
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to load data');
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
      setError(error.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>
          <FaSpinner className="spinner" size={40} />
          <p className="loading-text">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">
            <FaExclamationTriangle size={48} />
          </div>
          <h3 className="error-title">Error Loading Data</h3>
          <p className="error-text">{error}</p>
          <button onClick={fetchOverview} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-container">
        <div className="empty-card">
          <div className="empty-icon">
            <FaChartLine size={48} />
          </div>
          <h3 className="empty-title">No Data Available</h3>
          <p className="empty-text">No attendance records found. Start marking attendance to see statistics.</p>
        </div>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch(status) {
      case 'Good': return 'status-good';
      case 'Average': return 'status-average';
      case 'Alert': return 'status-alert';
      case 'Critical': return 'status-critical';
      case 'Warning': return 'status-warning';
      default: return '';
    }
  };

  const getProgressClass = (percentage) => {
    if (percentage >= 75) return 'progress-fill green';
    if (percentage >= 60) return 'progress-fill yellow';
    return 'progress-fill red';
  };

  return (
    <div className="attendance-container">
      {/* Header */}
      <div className="attendance-header">
        <div className="header-content">
          <div className="header-title">
            <div className="header-icon">
              <MdOutlineDashboard size={32} />
            </div>
            <div>
              <h1>Attendance Management</h1>
              <p>Monitor and track attendance across all departments</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-filter">
              <FaFilter size={16} />
              Filter
            </button>
            <button className="btn-export">
              <FaDownload size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="attendance-main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-title">University Attendance</p>
                <p className="stat-value blue">{data.universityStats?.overallAttendance || 0}%</p>
                <p className="stat-sub">of total classes</p>
              </div>
              <div className="stat-icon blue">
                <FaUniversity size={32} />
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className={getProgressClass(data.universityStats?.overallAttendance || 0)}
                style={{ width: `${data.universityStats?.overallAttendance || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-title">Students Below 75%</p>
                <p className="stat-value yellow">{data.universityStats?.studentsBelow75 || 0}</p>
                <p className="stat-sub">
                  {data.universityStats?.totalStudents 
                    ? ((data.universityStats.studentsBelow75 / data.universityStats.totalStudents) * 100).toFixed(1) 
                    : 0}% of total students
                </p>
              </div>
              <div className="stat-icon yellow">
                <FaUsers size={32} />
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill yellow"
                style={{ width: `${data.universityStats?.totalStudents 
                  ? (data.universityStats.studentsBelow75 / data.universityStats.totalStudents) * 100 
                  : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-title">Students Below 60%</p>
                <p className="stat-value red">{data.universityStats?.studentsBelow60 || 0}</p>
                <p className="stat-sub">
                  <FaExclamationTriangle size={12} /> Critical - Action Required
                </p>
              </div>
              <div className="stat-icon red">
                <MdWarning size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Department-wise Table */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-title-icon">
                <FaBuilding size={20} />
              </span>
              Department-wise Attendance
            </h2>
            <span className="section-badge">
              <FaDepartment size={14} />
              {data.departmentStats?.length || 0} Departments
            </span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.departmentStats && data.departmentStats.length > 0 ? (
                  data.departmentStats.map((dept, index) => (
                    <tr key={index}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaGraduationCap size={18} color="#4b5563" />
                          <strong>{dept.departmentName}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ minWidth: '45px' }}>{dept.attendance}%</span>
                          <div className="progress-bar" style={{ flex: 1, maxWidth: '120px' }}>
                            <div 
                              className={getProgressClass(parseFloat(dept.attendance))}
                              style={{ width: `${dept.attendance}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(dept.status)}`}>
                          {dept.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-link"
                          onClick={() => navigate(`/admin/dashboard/attendance/department/${encodeURIComponent(dept.departmentName)}`)}
                        >
                          View Details <FaArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      No department data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Courses Needing Attention */}
        <div className="section">
          <div className="section-header" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, white 100%)' }}>
            <h2 className="section-title">
              <span className="section-title-icon">
                <FaExclamationTriangle size={20} color="#d97706" />
              </span>
              Courses Needing Attention
            </h2>
            <span className="section-badge" style={{ color: '#d97706' }}>
              <GiAlarmClock size={14} />
              {data.coursesNeedingAttention?.length || 0} Courses at risk
            </span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.coursesNeedingAttention && data.coursesNeedingAttention.length > 0 ? (
                  data.coursesNeedingAttention.map((course) => (
                    <tr key={course.classId}>
                      <td>
                        <div>
                          <strong>{course.classCode}</strong>
                          <br />
                          <small style={{ color: '#6b7280' }}>{course.className} - {course.subject}</small>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaBuilding size={14} color="#6b7280" />
                          {course.department}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ minWidth: '45px', color: '#dc2626', fontWeight: 'bold' }}>{course.attendance}%</span>
                          <div className="progress-bar" style={{ flex: 1, maxWidth: '120px' }}>
                            <div 
                              className="progress-fill red"
                              style={{ width: `${course.attendance}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(course.status)}`}>
                          {course.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-link"
                          onClick={() => navigate(`/admin/dashboard/attendance/class/${course.classId}`)}
                        >
                          View Details <FaArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      No courses needing attention
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceOverview;