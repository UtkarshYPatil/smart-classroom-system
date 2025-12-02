import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { roomAPI } from '../../utils/api';

const RoomAllocation = () => {
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    room_no: '',
    subject: '',
    professor_name: '',
  });
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const data = await roomAPI.getAll();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setMessage({ type: 'error', text: `Failed to fetch rooms: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available rooms
  const fetchAvailableRooms = async () => {
    try {
      const data = await roomAPI.getAvailable();
      setAvailableRooms(data);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchAvailableRooms();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRooms();
      fetchAvailableRooms();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Check if selected room is busy
    if (name === 'room_no' && value) {
      const selectedRoom = rooms.find((r) => r.room_no === value);
      setShowRecommendations(selectedRoom?.is_busy || false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.room_no || !formData.subject || !formData.professor_name) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    // Check if room is busy
    const selectedRoom = rooms.find((r) => r.room_no === formData.room_no);
    if (selectedRoom?.is_busy) {
      setMessage({
        type: 'error',
        text: 'Selected room is currently busy. Please choose an available room.',
      });
      setShowRecommendations(true);
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await roomAPI.allocate(formData);
      setMessage({
        type: 'success',
        text: `Room ${formData.room_no} allocated successfully!`,
      });

      // Clear form
      setFormData({
        room_no: '',
        subject: '',
        professor_name: '',
      });
      setShowRecommendations(false);

      // Refresh room data
      await fetchRooms();
      await fetchAvailableRooms();
    } catch (error) {
      setMessage({ type: 'error', text: `Allocation failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelease = async (roomId) => {
    if (!confirm('Are you sure you want to release this room?')) {
      return;
    }

    try {
      await roomAPI.release(roomId);
      setMessage({ type: 'success', text: 'Room released successfully!' });
      await fetchRooms();
      await fetchAvailableRooms();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to release room: ${error.message}` });
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
            <p className="text-gray-600">Loading room data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Allocation Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Room Allocation
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Room Selection */}
              <div>
                <label
                  htmlFor="room_no"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Room *
                </label>
                <select
                  id="room_no"
                  name="room_no"
                  value={formData.room_no}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.room_no}>
                      {room.room_no} {room.is_busy ? '(Busy)' : '(Available)'}
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

              {/* Professor Name */}
              <div>
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
                {isSubmitting ? 'Allocating...' : 'Allocate Room'}
              </button>
            </div>
          </form>

          {/* Room Recommendations */}
          {showRecommendations && availableRooms.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                ⚠️ Selected room is busy. Available alternatives:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, room_no: room.room_no }));
                      setShowRecommendations(false);
                    }}
                    className="px-4 py-2 bg-white border border-yellow-300 text-yellow-800 rounded-lg hover:bg-yellow-100 transition"
                  >
                    {room.room_no}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Room Status Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Room Status</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Auto-refresh: 10s</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 rounded-lg border-2 ${
                  room.is_busy
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-gray-800">
                    {room.room_no}
                  </h4>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      room.is_busy
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {room.is_busy ? 'Busy' : 'Available'}
                  </span>
                </div>

                {room.is_busy && (
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Class:</span>{' '}
                      {room.current_class}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Professor:</span>{' '}
                      {room.professor_name}
                    </p>
                  </div>
                )}

                {room.is_busy && (
                  <button
                    onClick={() => handleRelease(room.id)}
                    className="w-full px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm"
                  >
                    Release Room
                  </button>
                )}
              </div>
            ))}
          </div>

          {rooms.length === 0 && (
            <p className="text-gray-600 text-center py-8">
              No rooms available in the system.
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoomAllocation;
