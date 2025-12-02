import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import ProgressBar from '../../components/ProgressBar';
import { attendanceAPI, studentAPI } from '../../utils/api';
import { LinkedList, HashMap } from '../../utils/dataStructures';

const Attendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [studentMap] = useState(() => new HashMap());
  const [attendanceList] = useState(() => new LinkedList());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [courses, setCourses] = useState([]);

  // Fetch students and build HashMap for fast lookup
  const fetchStudents = async () => {
    try {
      const data = await studentAPI.getAll();
      
      // Clear and rebuild student map
      studentMap.clear();
      data.forEach((student) => {
        studentMap.set(student.uid, student);
      });

      // Extract unique courses
      const uniqueCourses = [...new Set(data.map((s) => s.course))];
      setCourses(uniqueCourses);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Fetch attendance logs
  const fetchAttendance = async () => {
    try {
      const data = await attendanceAPI.getAll();
      
      // Clear and rebuild LinkedList
      attendanceList.clear();
      data.forEach((log) => {
        attendanceList.insert(log);
      });

      // Convert to array for rendering
      setAttendanceLogs(attendanceList.toArray());
      setError('');
    } catch (err) {
      setError(`Failed to fetch attendance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      await fetchStudents();
      await fetchAttendance();
    };
    loadData();
  }, []);

  // Real-time polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttendance();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate attendance percentage for a student
  const calculateAttendancePercentage = (uid) => {
    const logs = attendanceLogs.filter((log) => log.student_uid === uid);
    return (logs.length / 50) * 100;
  };

  // Get student details from HashMap
  const getStudentDetails = (uid) => {
    return studentMap.get(uid) || { name: 'Unknown', course: 'N/A' };
  };

  // Group logs by student
  const getStudentAttendanceSummary = () => {
    const summary = {};
    
    attendanceLogs.forEach((log) => {
      if (!summary[log.student_uid]) {
        const student = getStudentDetails(log.student_uid);
        summary[log.student_uid] = {
          uid: log.student_uid,
          name: student.name,
          course: student.course,
          count: 0,
          lastScan: log.timestamp,
        };
      }
      summary[log.student_uid].count++;
      
      // Update last scan if this is more recent
      if (new Date(log.timestamp) > new Date(summary[log.student_uid].lastScan)) {
        summary[log.student_uid].lastScan = log.timestamp;
      }
    });

    return Object.values(summary);
  };

  // Apply filters
  const getFilteredSummary = () => {
    let summary = getStudentAttendanceSummary();

    if (filterCourse) {
      summary = summary.filter((s) => s.course === filterCourse);
    }

    if (filterDate) {
      const selectedDate = new Date(filterDate).toDateString();
      summary = summary.filter((s) => {
        const hasLogsOnDate = attendanceLogs.some(
          (log) =>
            log.student_uid === s.uid &&
            new Date(log.timestamp).toDateString() === selectedDate
        );
        return hasLogsOnDate;
      });
    }

    return summary;
  };

  const filteredSummary = getFilteredSummary();

  // Format date and time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Attendance Logs</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Auto-refresh: 5s</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Student Attendance Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Student Attendance Summary
          </h3>

          {filteredSummary.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No attendance records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      UID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Total Scans
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Last Scan
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummary.map((student) => (
                    <tr
                      key={student.uid}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {student.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                        {student.uid}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {student.course}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {student.count}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDateTime(student.lastScan)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-48">
                          <ProgressBar
                            percentage={calculateAttendancePercentage(student.uid)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Attendance Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Attendance Logs
          </h3>

          {attendanceLogs.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No attendance logs available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Timestamp
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      UID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.slice(0, 20).map((log, index) => {
                    const student = getStudentDetails(log.student_uid);
                    return (
                      <tr
                        key={`${log.id}-${index}`}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                          {log.student_uid}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {student.course}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {log.status || 'present'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Attendance;
