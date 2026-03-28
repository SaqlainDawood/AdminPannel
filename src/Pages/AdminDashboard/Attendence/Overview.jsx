import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminAPI from '../../../api';
import { 
  FaChartLine, 
  FaUsers, 
  FaExclamationTriangle, 
  FaBuilding, 
  FaBook, 
  FaArrowRight,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaUniversity,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';

const AttendanceOverview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState('week');

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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchOverview}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUniversity className="text-yellow-500 text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">No attendance records found. Start marking attendance to see statistics.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Good': return 'bg-green-100 text-green-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Alert': return 'bg-red-100 text-red-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
              <p className="text-gray-500 mt-1">Monitor and track attendance across all departments</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <FaFilter className="text-gray-600" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <FaDownload className="text-sm" />
                <span className="text-sm font-medium">Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">University Attendance</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{data.universityStats?.overallAttendance || 0}%</p>
                <p className="text-sm text-gray-500 mt-2">of total classes</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaChartLine className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(data.universityStats?.overallAttendance || 0)}`}
                  style={{ width: `${data.universityStats?.overallAttendance || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Students Below 75%</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{data.universityStats?.studentsBelow75 || 0}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {data.universityStats?.totalStudents 
                    ? ((data.universityStats.studentsBelow75 / data.universityStats.totalStudents) * 100).toFixed(1) 
                    : 0}% of total students
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaUsers className="text-yellow-600 text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${data.universityStats?.totalStudents 
                    ? (data.universityStats.studentsBelow75 / data.universityStats.totalStudents) * 100 
                    : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Students Below 60%</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{data.universityStats?.studentsBelow60 || 0}</p>
                <p className="text-sm text-red-500 mt-2 font-medium">⚠️ Critical - Action Required</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Department-wise Table */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaBuilding className="text-blue-600 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">Department-wise Attendance</h2>
              </div>
              <span className="text-sm text-gray-500">{data.departmentStats?.length || 0} Departments</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.departmentStats && data.departmentStats.length > 0 ? (
                  data.departmentStats.map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaBuilding className="text-blue-600 text-sm" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{dept.departmentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900 min-w-[45px]">{dept.attendance}%</span>
                          <div className="flex-1 max-w-[120px]">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${getProgressColor(parseFloat(dept.attendance))}`}
                                style={{ width: `${dept.attendance}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dept.status)}`}>
                          {dept.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors group-hover:translate-x-1 duration-200"
                          onClick={() => navigate(`/admin/dashboard/attendance/department/${encodeURIComponent(dept.departmentName)}`)}
                        >
                          View Details
                          <FaArrowRight className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No department data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Courses Needing Attention */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-orange-500 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">⚠️ Courses Needing Attention</h2>
              </div>
              <span className="text-sm text-orange-600 font-medium">{data.coursesNeedingAttention?.length || 0} Courses at risk</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.coursesNeedingAttention && data.coursesNeedingAttention.length > 0 ? (
                  data.coursesNeedingAttention.map((course) => (
                    <tr key={course.classId} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{course.classCode}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{course.className} - {course.subject}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-600">{course.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-red-600 min-w-[45px]">{course.attendance}%</span>
                          <div className="flex-1 max-w-[120px]">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-red-500 h-1.5 rounded-full"
                                style={{ width: `${course.attendance}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors group-hover:translate-x-1 duration-200"
                          onClick={() => navigate(`/admin/dashboard/attendance/class/${course.classId}`)}
                        >
                          View Details
                          <FaArrowRight className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
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