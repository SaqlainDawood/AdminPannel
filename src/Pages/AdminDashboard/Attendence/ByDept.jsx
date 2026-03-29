import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceApi } from '../Attendence/components/services/attendanceApi';
import './AttendancePages.css'; // Import CSS

// Icons from react-icons
import { FaArrowLeft, FaChartLine, FaExclamationTriangle, FaBook, FaChalkboardTeacher, FaUsers, FaBuilding, FaArrowRight } from 'react-icons/fa';

const DepartmentAttendance = () => {
  const { departmentName } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [departmentName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getDepartmentAttendance(departmentName);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching department data:', err);
      setError('Failed to load department attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Good': return 'good';
      case 'Average': return 'average';
      case 'Alert': return 'alert';
      case 'Critical': return 'critical';
      case 'Warning': return 'warning';
      default: return '';
    }
  };

  const getProgressClass = (percentage) => {
    if (percentage >= 75) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="attendance-page">
      <div className="attendance-page-container">
        {/* Back Button */}
        <button onClick={() => navigate('/admin/dashboard/attendance')} className="back-button">
          <FaArrowLeft /> Back to Overview
        </button>

        {/* Header */}
        <div className="page-header">
          <h1 className='deptname'>{data.department.name} Department</h1>
          <p>
            <FaBuilding /> {data.department.classCount} Courses | 
            <FaUsers /> {data.department.studentCount} Students
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Overall Attendance</span>
              <div className={`stat-card-icon ${data.stats.overallAttendance >= 80 ? 'green' : data.stats.overallAttendance >= 70 ? 'yellow' : 'red'}`}>
                <FaChartLine />
              </div>
            </div>
            <div className={`stat-card-value ${data.stats.overallAttendance >= 80 ? 'green' : data.stats.overallAttendance >= 70 ? 'yellow' : 'red'}`}>
              {data.stats.overallAttendance}%
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${getProgressClass(data.stats.overallAttendance)}`}
                  style={{ width: `${data.stats.overallAttendance}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Students Below 75%</span>
              <div className="stat-card-icon yellow">
                <FaExclamationTriangle />
              </div>
            </div>
            <div className="stat-card-value yellow">{data.stats.studentsBelow75}</div>
            <div className="stat-card-sub">Need attention</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Courses Below 75%</span>
              <div className="stat-card-icon red">
                <FaBook />
              </div>
            </div>
            <div className="stat-card-value red">{data.stats.coursesBelow75}</div>
            <div className="stat-card-sub">Requires review</div>
          </div>
        </div>

        {/* Course-wise Table */}
        <div className="section-card">
          <div className="section-card-header">
            <h2><FaChalkboardTeacher /> Course-wise Attendance</h2>
            <span className="section-badge">{data.courses.length} Courses</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Section</th>
                  <th>Teacher</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.courses.map((course) => (
                  <tr key={course.classId}>
                    <td>
                      <div className="course-info">
                        <span className="course-code">{course.classCode}</span>
                        <span className="course-name">{course.className} - {course.subject}</span>
                      </div>
                    </td>
                    <td>{course.section}</td>
                    <td>{course.teacher}</td>
                    <td>
                      <div className="attendance-display">
                        <span className={`attendance-percentage ${course.attendance >= 75 ? 'high' : course.attendance >= 60 ? 'medium' : 'low'}`}>
                          {course.attendance}%
                        </span>
                        <div className="attendance-bar">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${getProgressClass(course.attendance)}`}
                              style={{ width: `${course.attendance}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(course.status)}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>
                      <a 
                        href={`/admin/dashboard/attendance/class/${course.classId}`}
                        className="action-link"
                        onClick={(e) => { e.preventDefault(); navigate(`/admin/dashboard/attendance/class/${course.classId}`); }}
                      >
                        View Details <FaArrowRight />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* At-risk Students */}
        {data.atRiskStudents.length > 0 && (
          <div className="section-card">
            <div className="section-card-header" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, white 100%)' }}>
              <h2 style={{ color: '#dc2626' }}><FaExclamationTriangle /> Students at Risk (Below 75%)</h2>
              <span className="section-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
                {data.atRiskStudents.length} Students
              </span>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Attendance</th>
                    <th>Weak Courses</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.atRiskStudents.map((student) => (
                    <tr key={student.studentId}>
                      <td>{student.rollNo}</td>
                      <td>{student.name}</td>
                      <td><span className="text-danger font-bold">{student.attendance}%</span></td>
                      <td>{student.weakCourses}</td>
                      <td>
                        <a 
                          href={`/admin/dashboard/attendance/student/${student.studentId}`}
                          className="action-link"
                          onClick={(e) => { e.preventDefault(); navigate(`/admin/dashboard/attendance/student/${student.studentId}`); }}
                        >
                          View <FaArrowRight />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentAttendance;