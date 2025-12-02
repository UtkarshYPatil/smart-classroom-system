import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { timetableAPI, studentAPI } from '../../utils/api';
import StudentLayout from '../../components/StudentLayout';

const TimetableView = () => {
  const { userRole } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  useEffect(() => {
    if (userRole?.student_uid) {
      fetchStudentAndTimetable();
    }
  }, [userRole]);

  // Debug: Log timetable data
  useEffect(() => {
    console.log('📅 Timetable length:', timetable.length);
    if (timetable.length > 0) {
      console.log('📅 Timetable data:', timetable);
      console.log('📅 Sample entry:', timetable[0]);
      console.log('📅 Day of week for first entry:', timetable[0].day_of_week);
      console.log('📅 Start time for first entry:', timetable[0].start_time);
    } else {
      console.log('⚠️ No timetable data loaded');
    }
  }, [timetable]);

  const fetchStudentAndTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student data to get course
      const student = await studentAPI.getByUid(userRole.student_uid);
      setStudentData(student);

      if (student.course) {
        // Fetch timetable for the student's course
        const timetableData = await timetableAPI.getByCourse(student.course);
        setTimetable(timetableData);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTimetableForDay = (dayIndex) => {
    return timetable
      .filter((entry) => entry.day_of_week === dayIndex)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const formatTime = (timeString) => {
    // timeString is in format "HH:MM:SS"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isCurrentTime = (startTime, endTime) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:00`;
    return currentTime >= startTime && currentTime <= endTime;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4"
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
            <p className="text-gray-600">Loading timetable...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold text-red-800">Error Loading Timetable</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchStudentAndTimetable}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </StudentLayout>
    );
  }

  // Generate time slots (8 AM to 6 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get next time slot
  const getNextTimeSlot = (currentSlot) => {
    const [hours] = currentSlot.split(':');
    const nextHour = parseInt(hours) + 1;
    return `${String(nextHour).padStart(2, '0')}:00:00`;
  };

  // Get class for specific day and time slot
  const getClassForSlot = (dayIndex, timeSlot) => {
    const found = timetable.find((entry) => {
      // Check if this entry is for the current day and time slot
      const isCorrectDay = entry.day_of_week === dayIndex;
      const startsAtOrBeforeSlot = entry.start_time <= timeSlot;
      const endsAfterSlot = entry.end_time > timeSlot;
      
      return isCorrectDay && startsAtOrBeforeSlot && endsAfterSlot;
    });
    
    return found;
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Timetable</h1>
            <p className="text-gray-600">
              Course: <span className="font-semibold">{studentData?.course || 'N/A'}</span>
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg px-6 py-3 text-white">
            <p className="text-green-100 text-xs mb-1">Today</p>
            <h2 className="text-xl font-bold">{daysOfWeek[currentDay]}</h2>
          </div>
        </div>

        {timetable.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Timetable Available
            </h3>
            <p className="text-gray-600">
              Your class schedule will appear here once it's been set up by the admin.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Timetable Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                {/* Header Row - Days of Week */}
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-teal-600">
                    <th className="border border-gray-300 p-3 text-white font-bold text-sm sticky left-0 bg-gradient-to-r from-green-500 to-teal-600 z-10">
                      Time
                    </th>
                    {daysOfWeek.slice(1, 6).map((day, index) => (
                      <th
                        key={index + 1}
                        className={`border border-gray-300 p-3 text-white font-bold text-sm ${
                          index + 1 === currentDay ? 'bg-green-700' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{day}</span>
                          {index + 1 === currentDay && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1">
                              Today
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, slotIndex) => (
                    <tr key={slotIndex} className="hover:bg-gray-50">
                      {/* Time Column */}
                      <td className="border border-gray-300 p-3 bg-gray-50 font-semibold text-sm text-gray-700 sticky left-0 z-10">
                        {formatTime(timeSlot)}
                      </td>
                      
                      {/* Day Columns (Monday to Friday) */}
                      {daysOfWeek.slice(1, 6).map((day, dayIndex) => {
                        const classEntry = getClassForSlot(dayIndex + 1, timeSlot);
                        const isCurrent =
                          dayIndex + 1 === currentDay &&
                          classEntry &&
                          isCurrentTime(classEntry.start_time, classEntry.end_time);

                        // Check if this is the starting slot for the class
                        const isStartingSlot = classEntry && (
                          classEntry.start_time === timeSlot ||
                          (classEntry.start_time >= timeSlot && 
                           classEntry.start_time < getNextTimeSlot(timeSlot))
                        );

                        return (
                          <td
                            key={dayIndex + 1}
                            className={`border border-gray-300 p-2 text-center align-top ${
                              isCurrent
                                ? 'bg-green-100 border-green-500 border-2'
                                : classEntry
                                ? 'bg-blue-50'
                                : ''
                            } ${dayIndex + 1 === currentDay ? 'bg-green-50/30' : ''}`}
                          >
                            {isStartingSlot && (
                              <div className="relative">
                                <div
                                  className={`rounded-lg p-3 text-left shadow-sm ${
                                    isCurrent
                                      ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white ring-2 ring-green-600'
                                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                  }`}
                                >
                                  {isCurrent && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                      LIVE
                                    </span>
                                  )}
                                  <div className="font-bold text-sm mb-1">
                                    {classEntry.subject}
                                  </div>
                                  <div className="text-xs opacity-90 space-y-1">
                                    <div className="flex items-center space-x-1">
                                      <span>🕐</span>
                                      <span>
                                        {formatTime(classEntry.start_time)} -{' '}
                                        {formatTime(classEntry.end_time)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <span>🏫</span>
                                      <span>Room {classEntry.room_no}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <span>👨‍🏫</span>
                                      <span className="truncate">
                                        {classEntry.professor_name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="bg-gray-50 border-t border-gray-300 p-4">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded"></div>
                  <span className="text-gray-700">Scheduled Class</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-teal-600 rounded ring-2 ring-green-600"></div>
                  <span className="text-gray-700">Current Class</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-50 border border-gray-300 rounded"></div>
                  <span className="text-gray-700">Today</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={fetchStudentAndTimetable}
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
            <span>Refresh Timetable</span>
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default TimetableView;
