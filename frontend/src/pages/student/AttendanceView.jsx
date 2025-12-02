import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceAPI } from '../../utils/api';
import { supabase } from '../../lib/supabase';
import StudentLayout from '../../components/StudentLayout';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AttendanceView = () => {
  const { userRole } = useAuth();
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
    console.log('📊 AttendanceView mounted, userRole:', userRole);
    if (userRole?.student_uid) {
      console.log('✅ Student UID found:', userRole.student_uid);
      fetchAttendance();
    } else if (userRole && !userRole.student_uid) {
      console.warn('⚠️ User role exists but no student_uid');
      setError('No student UID found for your account. Please contact your administrator to link your student ID.');
      setLoading(false);
    } else if (userRole === null) {
      console.log('⏳ Waiting for userRole to load...');
      // Keep loading state
    }
  }, [userRole]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching attendance for UID:', userRole.student_uid);
      const data = await attendanceAPI.getByUid(userRole.student_uid);
      console.log('✅ Attendance data received:', data);
      console.log('📊 Data structure:', {
        hasStudent: !!data?.student,
        hasAttendance: !!data?.attendance,
        hasLogs: !!data?.logs,
        logsLength: data?.logs?.length || 0,
        logsData: data?.logs
      });
      
      // Backend returns { student, attendance, logs }
      // Extract logs array from the response
      const logs = data?.logs || [];
      console.log('📝 Setting attendance logs:', logs);
      setAttendanceLogs(logs);
      
      // Use the percentage calculated by backend, or calculate it
      const percentage = data?.attendance?.percentage || (logs.length / 50) * 100;
      console.log('📈 Attendance percentage:', percentage);
      setAttendancePercentage(Math.min(percentage, 100));
    } catch (err) {
      console.error('❌ Error fetching attendance:', err);
      
      // If student record not found, try to create it automatically
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        console.log('🔧 Student record not found, attempting to create...');
        const created = await createStudentRecord();
        if (created) {
          // Retry fetching attendance
          console.log('🔄 Retrying attendance fetch...');
          try {
            const retryData = await attendanceAPI.getByUid(userRole.student_uid);
            const logs = retryData?.logs || [];
            setAttendanceLogs(logs);
            const percentage = retryData?.attendance?.percentage || (logs.length / 50) * 100;
            setAttendancePercentage(Math.min(percentage, 100));
            setError(null);
          } catch (retryErr) {
            setError('Failed to load attendance data after creating student record.');
          }
        } else {
          setError('Student record not found and could not be created automatically. Please contact your administrator.');
        }
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Authentication error. Please try logging out and logging in again.');
      } else {
        setError(err.message || 'Failed to load attendance data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const createStudentRecord = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const user = session.data.session?.user;
      
      if (!token || !user) {
        console.error('❌ No auth token available');
        return false;
      }

      // Use student_uid from userRole, or generate from metadata
      const studentUid = userRole.student_uid || user.user_metadata?.student_uid;
      
      if (!studentUid) {
        console.error('❌ No student UID available');
        return false;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/students/self-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: studentUid,
          name: userRole.email?.split('@')[0] || user.email?.split('@')[0] || 'Student',
          email: userRole.email || user.email || '',
          course: 'General',
          year: 1,
          section: 'A',
        }),
      });

      const result = await response.json();

      if (!response.ok && response.status !== 409) {
        // 409 means already exists, which is fine
        console.error('❌ Failed to create student record:', result);
        return false;
      }

      console.log('✅ Student record created successfully:', result);
      
      // Update user record with student_uid if it was NULL
      if (!userRole.student_uid && studentUid) {
        console.log('🔄 Updating user record with student_uid...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ student_uid: studentUid })
          .eq('id', user.id);
        
        if (updateError) {
          console.warn('⚠️ Failed to update user student_uid:', updateError);
        } else {
          console.log('✅ User record updated with student_uid');
        }
      }
      
      return true;
    } catch (err) {
      console.error('❌ Error creating student record:', err);
      return false;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingSpinner size="lg" message="Loading attendance data..." />
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <ErrorMessage 
          message={error}
          onRetry={userRole?.student_uid ? fetchAttendance : undefined}
        />
      </StudentLayout>
    );
  }

  if (!userRole) {
    return (
      <StudentLayout>
        <LoadingSpinner size="lg" message="Loading user information..." />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Attendance</h1>
          <p className="text-gray-600">
            Track your attendance records and monitor your progress
          </p>
        </div>

        {/* Attendance Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Attendance Summary
              </h2>
              <p className="text-gray-600">
                Total Sessions: {attendanceLogs.length} / 50
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 p-4 rounded-xl">
              <span className="text-4xl">📊</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <ProgressBar percentage={attendancePercentage} />
          </div>

          {/* Status Message */}
          <div className={`mt-4 p-4 rounded-lg ${
            attendancePercentage >= 85
              ? 'bg-green-50 border border-green-200'
              : attendancePercentage >= 75
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              attendancePercentage >= 85
                ? 'text-green-800'
                : attendancePercentage >= 75
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              {attendancePercentage >= 85
                ? '✅ Excellent attendance! Keep up the good work.'
                : attendancePercentage >= 75
                ? '⚠️ Good attendance, but try to improve to reach 85%.'
                : '❌ Low attendance. Please attend more classes to meet the minimum requirement.'}
            </p>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
            <h2 className="text-2xl font-bold text-white">Attendance History</h2>
            <p className="text-green-100">Complete record of your attendance</p>
          </div>

          {attendanceLogs.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Attendance Records
              </h3>
              <p className="text-gray-600">
                Your attendance records will appear here once you start attending classes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceLogs.map((log, index) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {attendanceLogs.length - index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📅</span>
                          <span className="text-sm font-medium text-gray-800">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🕐</span>
                          <span className="text-sm text-gray-600">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <span className="mr-1">✓</span>
                          {log.status || 'Present'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={fetchAttendance}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default AttendanceView;
