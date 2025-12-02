import { useState, useEffect } from 'react';
import { timetableAPI, roomAPI, studentAPI } from '../utils/api';

const CurrentLectureCard = ({ studentUid }) => {
  const [currentLecture, setCurrentLecture] = useState(null);
  const [roomStatus, setRoomStatus] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentUid) {
      fetchCurrentLecture();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchCurrentLecture, 30000);
      return () => clearInterval(interval);
    }
  }, [studentUid]);

  const fetchCurrentLecture = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student data to get course
      const student = await studentAPI.getByUid(studentUid);
      setStudentData(student);

      if (student.course) {
        // Fetch current lecture for the student's course
        const lecture = await timetableAPI.getCurrentLecture(student.course);
        setCurrentLecture(lecture);

        if (lecture && lecture.room_no) {
          // Fetch room status
          const rooms = await roomAPI.getAll();
          const room = rooms.find((r) => r.room_no === lecture.room_no);
          setRoomStatus(room);
        }
      }
    } catch (err) {
      console.error('Error fetching current lecture:', err);
      // If it's a 404 (no current lecture), don't show as error
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        setCurrentLecture(null);
        setError(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-green-600 mx-auto mb-2"
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
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-gray-800">Error</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLecture) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🎉</span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Class Right Now</h3>
          <p className="text-gray-600">
            You don't have any lectures scheduled at this time. Enjoy your break!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center space-x-2">
            <span className="text-2xl">📍</span>
            <span>Current Lecture</span>
          </h3>
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
            Live
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 text-white">
        {/* Subject */}
        <div className="mb-6">
          <p className="text-blue-100 text-sm mb-1">Subject</p>
          <h2 className="text-3xl font-bold">{currentLecture.subject}</h2>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Time */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🕐</span>
              <p className="text-blue-100 text-xs">Time</p>
            </div>
            <p className="font-semibold">
              {formatTime(currentLecture.start_time)} - {formatTime(currentLecture.end_time)}
            </p>
          </div>

          {/* Room */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🏫</span>
              <p className="text-blue-100 text-xs">Room</p>
            </div>
            <p className="font-semibold">Room {currentLecture.room_no}</p>
          </div>
        </div>

        {/* Professor */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">👨‍🏫</span>
            <p className="text-blue-100 text-xs">Professor</p>
          </div>
          <p className="font-semibold">{currentLecture.professor_name}</p>
        </div>

        {/* Room Status */}
        {roomStatus && (
          <div
            className={`rounded-lg p-4 ${
              roomStatus.is_busy
                ? 'bg-green-500/20 border border-green-400/30'
                : 'bg-yellow-500/20 border border-yellow-400/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">
                  {roomStatus.is_busy ? '✅' : '⚠️'}
                </span>
                <div>
                  <p className="text-xs text-blue-100">Room Status</p>
                  <p className="font-semibold">
                    {roomStatus.is_busy ? 'In Use' : 'Available'}
                  </p>
                </div>
              </div>
              {roomStatus.is_busy && roomStatus.current_class && (
                <div className="text-right">
                  <p className="text-xs text-blue-100">Current Class</p>
                  <p className="text-sm font-medium">{roomStatus.current_class}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white/5 backdrop-blur-sm p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <p className="text-blue-100">
            Course: <span className="font-semibold text-white">{studentData?.course}</span>
          </p>
          <button
            onClick={fetchCurrentLecture}
            className="text-white hover:text-blue-100 transition-colors flex items-center space-x-1"
          >
            <svg
              className="w-4 h-4"
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
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentLectureCard;
