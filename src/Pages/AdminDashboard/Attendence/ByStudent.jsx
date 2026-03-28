import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceApi } from '../Attendence/components/services/attendanceApi';
import StatsCard from '../Attendence/components/attendance/StatsCard';
import StatusBadge from '../Attendence/components/attendance/StatsCard';
import LoadingSpinner from '../Attendence/components/attendance/StatsCard';

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

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="p-6 bg-red-50 text-red-700 rounded-lg m-6">
      {error}
    </div>
  );

  const overallColor = data.stats.overallAttendance >= 75 ? 'green' : 
                       data.stats.overallAttendance >= 60 ? 'yellow' : 'red';

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
        <h1 className="text-2xl font-bold text-gray-900">{data.student.name}</h1>
        <p className="text-gray-600 mt-1">
          Roll No: {data.student.rollNo} | {data.student.program} - Semester {data.student.semester}
        </p>
        <p className="text-gray-600">Department: {data.student.department}</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Overall Attendance"
          value={`${data.stats.overallAttendance}%`}
          icon="📊"
          color={overallColor}
        />
        <StatsCard
          title="Total Classes"
          value={data.stats.totalClasses}
          icon="📅"
          color="blue"
        />
        <StatsCard
          title="Present"
          value={data.stats.totalPresent}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="Absent"
          value={data.stats.totalAbsent}
          icon="❌"
          color="red"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Attendance Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              data.stats.overallAttendance >= 75 ? 'bg-green-500' :
              data.stats.overallAttendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, data.stats.overallAttendance)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>Required: 75%</span>
          <span>100%</span>
        </div>
        {data.stats.overallAttendance < 75 && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            ⚠️ This student is below the required 75% attendance threshold. Immediate attention required.
          </div>
        )}
      </div>

      {/* Course-wise Attendance */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Course-wise Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.courseWise.map((course) => (
                <tr key={course.classId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.classCode}</p>
                      <p className="text-xs text-gray-500">{course.className}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.teacher}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.present}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.total}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${course.percentage < 75 ? 'text-red-600' : 'text-gray-900'}`}>
                    {course.percentage}%
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={course.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absence History */}
      {data.absenceHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <button
            onClick={() => setAbsenceExpanded(!absenceExpanded)}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 border-b"
          >
            <h2 className="text-lg font-semibold text-gray-900">📅 Absence History (Last 30 Days)</h2>
            <span className="text-gray-500">{absenceExpanded ? '▼' : '▶'}</span>
          </button>
          {absenceExpanded && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.absenceHistory.map((absence, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(absence.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{absence.classCode}</p>
                          <p className="text-xs text-gray-500">{absence.className}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={absence.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{absence.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Send Warning SMS
        </button>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
          Contact Parents
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Schedule Meeting
        </button>
      </div>
    </div>
  );
};

export default StudentAttendance;