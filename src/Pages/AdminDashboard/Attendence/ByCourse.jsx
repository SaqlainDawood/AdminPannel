import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attendanceApi } from '../Attendence/components/services/attendanceApi';
import StatsCard from '../Attendence/components/attendance/StatsCard';
import StatusBadge from '../Attendence/components/attendance/StatsCard';
import LoadingSpinner from '../Attendence/components/attendance/StatsCard';

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

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="p-6 bg-red-50 text-red-700 rounded-lg m-6">
      {error}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{data.class.code} - {data.class.name}</h1>
        <p className="text-gray-600 mt-1">
          {data.class.subject} | Section {data.class.section} | Semester {data.class.semester}
        </p>
        <p className="text-gray-600">
          Teacher: {data.class.teacher} | Department: {data.class.department}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Average Attendance"
          value={`${data.stats.averageAttendance}%`}
          icon="📊"
          color={data.stats.averageAttendance >= 80 ? 'green' : data.stats.averageAttendance >= 70 ? 'yellow' : 'red'}
        />
        <StatsCard
          title="Total Classes"
          value={data.stats.totalClasses}
          icon="📅"
          color="blue"
        />
        <StatsCard
          title="Students Above 90%"
          value={data.stats.studentsAbove90}
          icon="⭐"
          color="green"
        />
        <StatsCard
          title="Students Below 75%"
          value={data.stats.studentsBelow75}
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Schedule */}
      {data.class.schedule && data.class.schedule.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <button
            onClick={() => setScheduleExpanded(!scheduleExpanded)}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
          >
            <h2 className="text-lg font-semibold text-gray-900">Class Schedule</h2>
            <span className="text-gray-500">{scheduleExpanded ? '▼' : '▶'}</span>
          </button>
          {scheduleExpanded && (
            <div className="border-t">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.class.schedule.map((slot, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{slot.day}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{slot.startTime}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{slot.endTime}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{slot.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Class-wise Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Class-wise Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.classWise.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{day.present}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{day.total}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{day.rate}%</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={day.rate >= 75 ? 'Good' : 'Low'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Student Attendance List</h2>
          <p className="text-sm text-gray-500 mt-1">{data.class.totalStudents} students enrolled</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.students.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.present}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.total}</td>
                  {/* className={student.percentage < 75 ? 'text-red-600' : 'text-gray-900'} */}
                  <td className="px-6 py-4 text-sm font-medium" >
                    {student.percentage}%
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={student.status} />
                  </td>
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
    </div>
  );
};

export default ClassAttendance;