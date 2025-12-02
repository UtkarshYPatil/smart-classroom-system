import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
    studentUid: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: `Failed to fetch users: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.email.trim()) errors.push('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Valid email is required');
    }
    if (!formData.password) errors.push('Password is required');
    if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (formData.role === 'student' && !formData.studentUid.trim()) {
      errors.push('Student UID is required for student accounts');
    }

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
      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: formData.role,
            student_uid: formData.role === 'student' ? formData.studentUid : null,
          },
          emailRedirectTo: window.location.origin + '/login',
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Wait a moment for the auth user to be fully created
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create user record in users table
      const { error: userError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email: formData.email,
          role: formData.role,
          student_uid: formData.role === 'student' ? formData.studentUid : null,
        },
      ]);

      if (userError) {
        console.error('User table insert error:', userError);
        // If the error is about duplicate key, it might already exist (from a trigger)
        if (!userError.message.includes('duplicate') && !userError.message.includes('already exists')) {
          throw userError;
        }
      }

      setMessage({
        type: 'success',
        text: `${formData.role === 'admin' ? 'Admin' : 'Student'} account created successfully!`,
      });

      // Clear form
      setFormData({
        email: '',
        password: '',
        role: 'admin',
        studentUid: '',
      });

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: `Account creation failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      return;
    }

    try {
      // Delete from users table
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'User deleted successfully!' });
      await fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to delete user: ${error.message}` });
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
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
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Create User Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Create New User Account
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
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min. 6 characters"
                />
              </div>

              {/* Role */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>
              </div>

              {/* Student UID (conditional) */}
              {formData.role === 'student' && (
                <div>
                  <label
                    htmlFor="studentUid"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Student UID *
                  </label>
                  <input
                    type="text"
                    id="studentUid"
                    name="studentUid"
                    value={formData.studentUid}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="RFID UID"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Existing Users ({users.length})
          </h3>

          {users.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Student UID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Created At
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                        {user.student_uid || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
