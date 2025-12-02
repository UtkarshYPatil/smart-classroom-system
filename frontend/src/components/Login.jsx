import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, error: authError, loading, userRole } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setValidationError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
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

    console.log('🔐 Login form submitted');
    const result = await login(email, password);
    
    console.log('📊 Login result:', result);
    
    if (result.error) {
      console.error('❌ Login failed:', result.error);
      setValidationError(result.error.message);
      return;
    }

    // Wait a moment for userRole to be set
    console.log('⏳ Waiting for user role...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Navigate based on role
    if (result.data?.user) {
      console.log('✅ Login successful, checking role...');
      // The userRole should be set by now from AuthContext
      // But we'll check it from the context
      const checkRole = () => {
        if (userRole?.role === 'admin') {
          console.log('🎯 Navigating to /admin');
          navigate('/admin');
        } else if (userRole?.role === 'student') {
          console.log('🎯 Navigating to /student');
          navigate('/student');
        } else {
          console.log('⏳ Role not loaded yet, waiting...');
          setTimeout(checkRole, 100);
        }
      };
      checkRole();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg mb-4">
            <span className="text-5xl">🎓</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500">Sign in to Smart Classroom Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

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
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Link to Create Account */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/create-account"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Create one here
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

export default Login;
