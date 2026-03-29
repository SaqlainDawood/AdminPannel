import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceApi } from '../Attendence/components/services/attendanceApi';
import './AttendancePages.css';
import { 
  FaArrowLeft, FaChartLine, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaBook, FaChalkboardTeacher, FaUserGraduate, FaExclamationTriangle,
  FaChevronDown, FaChevronRight, FaEnvelope, FaPhone, FaCalendarCheck
} from 'react-icons/fa';

const StudentAttendance = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [absenceExpanded, setAbsenceExpanded] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getStudentAttendance(studentId);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load student attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Good': return 'good';
      case 'Average': return 'average';
      case 'Warning': return 'warning';
      default: return '';
    }
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

  const overallColor = data.stats.overallAttendance >= 75 ? 'green' : 
                       data.stats.overallAttendance >= 60 ? 'yellow' : 'red';

  return (
    <div className="attendance-page">
      <div className="attendance-page-container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>

        {/* Header */}
        <div className="page-header">
          <h1><FaUserGraduate /> {data.student.name}</h1>
          <p>
            Roll No: {data.student.rollNo} | {data.student.program} - Semester {data.student.semester}
          </p>
          <p>Department: {data.student.department}</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Overall Attendance</span>
              <div className={`stat-card-icon ${overallColor}`}>
                <FaChartLine />
              </div>
            </div>
            <div className={`stat-card-value ${overallColor}`}>{data.stats.overallAttendance}%</div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${overallColor}`}
                  style={{ width: `${Math.min(100, data.stats.overallAttendance)}%` }}
                ></div>
              </div>
              <div className="progress-label">
                <span>0%</span>
                <span>Required: 75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Total Classes</span>
              <div className="stat-card-icon blue">
                <FaCalendarAlt />
              </div>
            </div>
            <div className="stat-card-value blue">{data.stats.totalClasses}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Present</span>
              <div className="stat-card-icon green">
                <FaCheckCircle />
              </div>
            </div>
            <div className="stat-card-value green">{data.stats.totalPresent}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Absent</span>
              <div className="stat-card-icon red">
                <FaTimesCircle />
              </div>
            </div>
            <div className="stat-card-value red">{data.stats.totalAbsent}</div>
          </div>
        </div>

        {/* Warning Message */}
        {data.stats.overallAttendance < 75 && (
          <div className="section-card" style={{ borderLeft: '4px solid #dc2626', background: '#fef2f2' }}>
            <div className="section-card-header" style={{ background: 'transparent' }}>
              <h2 style={{ color: '#dc2626' }}><FaExclamationTriangle /> Attendance Warning</h2>
            </div>
            <div className="p-6">
              <p style={{ color: '#991b1b' }}>
                This student is below the required 75% attendance threshold. Immediate attention required.
              </p>
            </div>
          </div>
        )}

        {/* Course-wise Attendance */}
        <div className="section-card">
          <div className="section-card-header">
            <h2><FaBook /> Course-wise Attendance</h2>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Teacher</th>
                  <th>Present</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Status</th>
                 </tr>
              </thead>
              <tbody>
                {data.courseWise.map((course) => (
                  <tr key={course.classId}>
                    <td>
                      <div className="course-info">
                        <span className="course-code">{course.classCode}</span>
                        <span className="course-name">{course.className}</span>
                      </div>
                    </td>
                    <td><FaChalkboardTeacher /> {course.teacher}</td>
                    <td>{course.present}</td>
                    <td>{course.total}</td>
                    <td className={course.percentage < 75 ? 'text-danger' : 'text-success'}>
                      {course.percentage}%
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(course.status)}`}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Absence History */}
        {data.absenceHistory.length > 0 && (
          <div className="section-card">
            <button 
              className="collapsible-trigger"
              onClick={() => setAbsenceExpanded(!absenceExpanded)}
            >
              <span><FaCalendarCheck /> Absence History (Last 30 Days)</span>
              {absenceExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            {absenceExpanded && (
              <div className="collapsible-content">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Remarks</th>
                       </tr>
                    </thead>
                    <tbody>
                      {data.absenceHistory.map((absence, idx) => (
                        <tr key={idx}>
                          <td>{new Date(absence.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>
                            <div>
                              <strong>{absence.classCode}</strong>
                              <br />
                              <small className="text-gray">{absence.className}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${absence.status === 'present' ? 'good' : absence.status === 'late' ? 'warning' : 'absent'}`}>
                              {absence.status}
                            </span>
                          </td>
                          <td>{absence.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn btn-primary">
            <FaEnvelope /> Send Warning SMS
          </button>
          <button className="btn btn-warning">
            <FaPhone /> Contact Parents
          </button>
          <button className="btn btn-danger">
            <FaCalendarCheck /> Schedule Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;