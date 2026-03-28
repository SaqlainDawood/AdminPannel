import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await axios.get('/api/admin/attendance/overview');
       console.log('API Response:', response.data);
       if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to load data');
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) 
     return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
    if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }
 if (!data) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg m-6">
        <p className="text-yellow-800">No attendance data available</p>
      </div>
    );
  }

  return (
    <div className="attendance-overview">
      {/* Header */}
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Monitor attendance across the university</p>
      </div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>University Attendance</h3>
          <div className="stat-value">{data.universityStats.overallAttendance}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${data.universityStats.overallAttendance}%` }}
            ></div>
          </div>
        </div>

        <div className="stat-card warning">
          <h3>Students Below 75%</h3>
          <div className="stat-value">{data.universityStats.studentsBelow75}</div>
          <div className="stat-sub">
            {((data.universityStats.studentsBelow75 / data.universityStats.totalStudents) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="stat-card danger">
          <h3>Students Below 60%</h3>
          <div className="stat-value">{data.universityStats.studentsBelow60}</div>
          <div className="stat-sub">Critical - Action Required</div>
        </div>
      </div>

      {/* Department-wise Table */}
      <div className="section">
        <h2>Department-wise Attendance</h2>
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
            {data.departmentStats.map(dept => (
              <tr key={dept.departmentId}>
                <td>{dept.departmentName}</td>
                <td>{dept.attendance}%</td>
                <td>
                  <span className={`status-badge ${dept.status.toLowerCase()}`}>
                    {dept.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-link"
                    onClick={() => window.location.href = `/admin/attendance/department/${encodeURIComponent(dept.departmentName)}`}
                  >
                    View Details →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Courses Needing Attention */}
      <div className="section">
        <h2>⚠️ Courses Needing Attention</h2>
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
            {data.coursesNeedingAttention.map(course => (
              <tr key={course.courseId}>
                <td>{course.courseCode} - {course.courseName}</td>
                <td>{course.departmentName}</td>
                <td>{course.attendance}%</td>
                <td>
                  <span className={`status-badge ${course.status.toLowerCase()}`}>
                    {course.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-link"
                  onClick={() => window.location.href = `/admin/attendance/class/${course.classId}`}
                  >
                    View Details →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceOverview;