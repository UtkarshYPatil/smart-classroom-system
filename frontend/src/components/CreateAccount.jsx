import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    studentUid: '',
  });
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signup, error: authError, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setValidationError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    if (formData.role === 'student' && !formData.studentUid.trim()) {
      setValidationError('Student UID is required for student accounts');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await signup(
      formData.email,
      formData.password,
      formData.role,
      formData.role === 'student' ? formData.studentUid : null
    );

    if (result.error) {
      setValidationError(result.error.message);
    } else {
      // Check if email verification is needed
      if (result.needsVerification) {
        setSuccessMessage(
          'Account created successfully! Please check your email to verify your account before logging in.'
        );
      } else {
        const studentNote = formData.role === 'student' 
          ? ' Your student profile will be set up automatically when you first login.'
          : '';
        setSuccessMessage(
          `Account created successfully! You can now log in with your credentials.${studentNote}`
        );
      }
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
        studentUid: '',
      });

      // Redirect to login after 4 seconds
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg mb-4">
            <span className="text-5xl">✨</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>
          <p className="text-gray-500">Join Smart Classroom Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Type *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            >
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* Student UID (only for student role) */}
          {formData.role === 'student' && (
            <div>
              <label
                htmlFor="studentUid"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Student UID *
              </label>
              <input
                id="studentUid"
                type="text"
                name="studentUid"
                value={formData.studentUid}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your student UID"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your RFID card UID from registration
              </p>
            </div>
          )}

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password *
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Messages */}
          {(validationError || authError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {validationError || authError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
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
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Link to Login */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            © 2024 Smart Classroom Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
