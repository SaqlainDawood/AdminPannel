import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attendanceApi } from '../Attendence/components/services/attendanceApi';
import StatsCard from '../Attendence/components/attendance/StatsCard';
import StatusBadge from '../Attendence/components/attendance/StatsCard';
import LoadingSpinner from '../Attendence/components/attendance/StatsCard';
import './AttendancePages.css'
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

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="p-6 bg-red-50 text-red-700 rounded-lg m-6">
      {error}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/attendance')}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Back to Overview
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{data.department.name} Department</h1>
        <p className="text-gray-600 mt-1">
          {data.department.classCount} Courses | {data.department.studentCount} Students
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Overall Attendance"
          value={`${data.stats.overallAttendance}%`}
          icon="📊"
          color={data.stats.overallAttendance >= 80 ? 'green' : data.stats.overallAttendance >= 70 ? 'yellow' : 'red'}
        />
        <StatsCard
          title="Students Below 75%"
          value={data.stats.studentsBelow75}
          icon="⚠️"
          color="yellow"
        />
        <StatsCard
          title="Courses Below 75%"
          value={data.stats.coursesBelow75}
          icon="📚"
          color="red"
        />
      </div>

      {/* Course-wise Table */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Course-wise Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.courses.map((course) => (
                <tr key={course.classId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.classCode}</p>
                      <p className="text-xs text-gray-500">{course.className} - {course.subject}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.section}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.teacher}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.attendance}%</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={course.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/attendance/class/${course.classId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* At-risk Students */}
      {data.atRiskStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b bg-red-50">
            <h2 className="text-lg font-semibold text-red-800">⚠️ Students at Risk (Below 75%)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weak Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.atRiskStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600">{student.attendance}%</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.weakCourses}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/attendance/student/${student.studentId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentAttendance;