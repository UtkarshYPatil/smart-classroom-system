import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { timetableAPI, roomAPI } from '../../utils/api';

const TimetableManagement = () => {
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    course: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    subject: '',
    room_no: '',
    professor_name: '',
  });
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const data = await roomAPI.getAll();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Fetch timetable entries for a course
  const fetchTimetable = async (course) => {
    if (!course) {
      setTimetableEntries([]);
      return;
    }

    try {
      const data = await timetableAPI.getByCourse(course);
      setTimetableEntries(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setMessage({ type: 'error', text: `Failed to fetch timetable: ${error.message}` });
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await fetchRooms();
      setLoading(false);
    };
    loadData();
  }, []);

  // Fetch timetable when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchTimetable(selectedCourse);
    }
  }, [selectedCourse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = [
      'course',
      'day_of_week',
      'start_time',
      'end_time',
      'subject',
      'room_no',
      'professor_name',
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    // Validate time
    if (formData.start_time >= formData.end_time) {
      setMessage({ type: 'error', text: 'End time must be after start time' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await timetableAPI.create({
        ...formData,
        day_of_week: parseInt(formData.day_of_week),
      });

      setMessage({ type: 'success', text: 'Timetable entry created successfully!' });

      // Clear form
      setFormData({
        course: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        subject: '',
        room_no: '',
        professor_name: '',
      });

      // Refresh timetable if viewing the same course
      if (selectedCourse === formData.course) {
        await fetchTimetable(selectedCourse);
      }

      // Update courses list
      if (!courses.includes(formData.course)) {
        setCourses((prev) => [...prev, formData.course]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to create entry: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-hide success messages
  useEffect(() => {
    if (message.type === 'success') {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Group timetable entries by day
  const groupByDay = () => {
    const grouped = {};
    daysOfWeek.forEach((day) => {
      grouped[day.value] = timetableEntries.filter(
        (entry) => entry.day_of_week === day.value
      );
    });
    return grouped;
  };

  const groupedEntries = groupByDay();

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Add Timetable Entry Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Add Timetable Entry
          </h2>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Course */}
              <div>
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course *
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>

              {/* Day of Week */}
              <div>
                <label
                  htmlFor="day_of_week"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Day of Week *
                </label>
                <select
                  id="day_of_week"
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Data Structures"
                />
              </div>

              {/* Start Time */}
              <div>
                <label
                  htmlFor="start_time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Start Time *
                </label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Time */}
              <div>
                <label
                  htmlFor="end_time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  End Time *
                </label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Room */}
              <div>
                <label
                  htmlFor="room_no"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Room *
                </label>
                <select
                  id="room_no"
                  name="room_no"
                  value={formData.room_no}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.room_no}>
                      {room.room_no}
                    </option>
                  ))}
                </select>
              </div>

              {/* Professor Name */}
              <div className="md:col-span-2 lg:col-span-3">
                <label
                  htmlFor="professor_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Professor Name *
                </label>
                <input
                  type="text"
                  id="professor_name"
                  name="professor_name"
                  value={formData.professor_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dr. Smith"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Entry'}
              </button>
            </div>
          </form>
        </div>

        {/* View Timetable */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            View Timetable
          </h3>

          <div className="mb-6">
            <label
              htmlFor="view_course"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Course to View
            </label>
            <input
              type="text"
              id="view_course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course name"
            />
          </div>

          {selectedCourse && timetableEntries.length === 0 && (
            <p className="text-gray-600 text-center py-8">
              No timetable entries found for this course.
            </p>
          )}

          {selectedCourse && timetableEntries.length > 0 && (
            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const dayEntries = groupedEntries[day.value];
                if (dayEntries.length === 0) return null;

                return (
                  <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      {day.label}
                    </h4>
                    <div className="space-y-2">
                      {dayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {entry.subject}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatTime(entry.start_time)} -{' '}
                              {formatTime(entry.end_time)} | Room: {entry.room_no} |{' '}
                              {entry.professor_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TimetableManagement;
