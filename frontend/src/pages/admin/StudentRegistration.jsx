import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { studentAPI } from '../../utils/api';
import { Queue } from '../../utils/dataStructures';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    course: '',
    uid: '',
  });

  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [scanQueue] = useState(() => new Queue());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScan = async () => {
    setIsScanning(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🔍 Fetching latest scan...');
      const data = await studentAPI.getLatestScan();
      console.log('✅ Latest scan data:', data);
      
      if (data.uid) {
        // Add to scan queue
        scanQueue.enqueue(data.uid);
        
        // Get the latest UID from queue
        const latestUid = scanQueue.peek();
        setFormData((prev) => ({ ...prev, uid: latestUid }));
        setMessage({ type: 'success', text: `UID scanned successfully: ${latestUid}` });
      } else {
        setMessage({ type: 'error', text: 'No recent scan found. Please scan an RFID card first.' });
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      
      // Provide more helpful error messages
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
        setMessage({ 
          type: 'error', 
          text: 'Session expired. Please logout and login again, then try scanning.' 
        });
      } else if (error.message.includes('Not Found') || error.message.includes('No recent scans')) {
        setMessage({ 
          type: 'error', 
          text: 'No recent scans found. Please scan an RFID card with your ESP32 first, then click Scan.' 
        });
      } else {
        setMessage({ type: 'error', text: `Scan failed: ${error.message}` });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.email.includes('@')) errors.push('Valid email is required');
    if (!formData.phone.trim()) errors.push('Phone is required');
    if (!formData.dob) errors.push('Date of birth is required');
    if (!formData.course.trim()) errors.push('Course is required');
    if (!formData.uid.trim()) errors.push('UID is required (please scan RFID card)');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await studentAPI.register(formData);
      setMessage({ type: 'success', text: 'Student registered successfully!' });
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        dob: '',
        course: '',
        uid: '',
      });
      
      // Clear scan queue
      scanQueue.clear();
    } catch (error) {
      setMessage({ type: 'error', text: `Registration failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-hide success messages after 5 seconds
  useEffect(() => {
    if (message.type === 'success') {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Student Registration
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter student name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="student@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Course */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* UID with Scan Button */}
            <div>
              <label htmlFor="uid" className="block text-sm font-medium text-gray-700 mb-2">
                RFID UID *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="uid"
                  name="uid"
                  value={formData.uid}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Scan RFID card"
                  readOnly
                />
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
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
                      Scanning...
                    </span>
                  ) : (
                    'Scan'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  dob: '',
                  course: '',
                  uid: '',
                });
                scanQueue.clear();
                setMessage({ type: '', text: '' });
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default StudentRegistration;
