import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { attendanceApi } from '../Attendence/components/services/attendanceApi';
import './AttendancePages.css';
import { 
  FaArrowLeft, FaChartLine, FaCalendarAlt, FaStar, FaExclamationTriangle, 
  FaChalkboardTeacher, FaBook, FaUserGraduate, FaClock, FaDoorOpen, FaBuilding,
  FaChevronDown, FaChevronRight, FaArrowRight
} from 'react-icons/fa';

const ClassAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getClassAttendance(classId);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching class data:', err);
      setError('Failed to load class attendance data');
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
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>

        {/* Header */}
        <div className="page-header">
          <h1 className='cls-code-name'>{data.class.code} - {data.class.name}</h1>
          <p className='cls-sub-sec-semester'>
            <FaBook /> {data.class.subject} | 
            <FaUserGraduate /> Section {data.class.section} | 
            <FaCalendarAlt /> Semester {data.class.semester}
          </p>
          <p className='cls-techer-dept'>
            <FaChalkboardTeacher /> Teacher: {data.class.teacher} | 
            <FaBuilding /> Department: {data.class.department}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Average Attendance</span>
              <div className={`stat-card-icon ${data.stats.averageAttendance >= 80 ? 'green' : data.stats.averageAttendance >= 70 ? 'yellow' : 'red'}`}>
                <FaChartLine />
              </div>
            </div>
            <div className={`stat-card-value ${data.stats.averageAttendance >= 80 ? 'green' : data.stats.averageAttendance >= 70 ? 'yellow' : 'red'}`}>
              {data.stats.averageAttendance}%
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${getProgressClass(data.stats.averageAttendance)}`}
                  style={{ width: `${data.stats.averageAttendance}%` }}
                ></div>
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
              <span className="stat-card-title">Students Above 90%</span>
              <div className="stat-card-icon green">
                <FaStar />
              </div>
            </div>
            <div className="stat-card-value green">{data.stats.studentsAbove90}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Students Below 75%</span>
              <div className="stat-card-icon red">
                <FaExclamationTriangle />
              </div>
            </div>
            <div className="stat-card-value red">{data.stats.studentsBelow75}</div>
          </div>
        </div>

        {/* Schedule Section */}
        {data.class.schedule && data.class.schedule.length > 0 && (
          <div className="section-card">
            <button 
              className="collapsible-trigger"
              onClick={() => setScheduleExpanded(!scheduleExpanded)}
            >
              <span><FaClock /> Class Schedule</span>
              {scheduleExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            {scheduleExpanded && (
              <div className="collapsible-content">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.class.schedule.map((slot, idx) => (
                        <tr key={idx}>
                          <td>{slot.day}</td>
                          <td>{slot.startTime}</td>
                          <td>{slot.endTime}</td>
                          <td><FaDoorOpen /> {slot.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Class-wise Breakdown */}
        <div className="section-card">
          <div className="section-card-header">
            <h2><FaCalendarAlt /> Class-wise Attendance</h2>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Present</th>
                  <th>Total</th>
                  <th>Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.classWise.map((day) => (
                  <tr key={day.date}>
                    <td>{new Date(day.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{day.present}</td>
                    <td>{day.total}</td>
                    <td className={day.rate >= 75 ? 'text-success' : day.rate >= 60 ? 'text-warning' : 'text-danger'}>
                      {day.rate}%
                    </td>
                    <td>
                      <span className={`status-badge ${day.rate >= 75 ? 'good' : 'warning'}`}>
                        {day.rate >= 75 ? 'Good' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student List */}
        <div className="section-card">
          <div className="section-card-header">
            <h2><FaUserGraduate /> Student Attendance List</h2>
            <span className="section-badge">{data.class.totalStudents} Students Enrolled</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Present</th>
                  <th>Total Classes</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Action</th>
                 </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.studentId}>
                    <td>{student.rollNo}</td>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.present}</td>
                    <td>{student.total}</td>
                    <td className={student.percentage < 75 ? 'text-danger' : 'text-success'}>
                      {student.percentage}%
                    </td>
                    <td>
                      <span className={`status-badge ${student.percentage >= 75 ? 'good' : 'warning'}`}>
                        {student.status}
                      </span>
                    </td>
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
      </div>
    </div>
  );
};

export default ClassAttendance;