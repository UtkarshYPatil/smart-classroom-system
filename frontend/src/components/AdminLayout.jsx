import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  const navigation = [
    { name: 'Dashboard', path: '/admin', icon: '📊', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Student Registration', path: '/admin/registration', icon: '👤', gradient: 'from-green-500 to-green-600' },
    { name: 'Attendance', path: '/admin/attendance', icon: '📋', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Room Allocation', path: '/admin/rooms', icon: '🏫', gradient: 'from-orange-500 to-orange-600' },
    { name: 'Timetable', path: '/admin/timetable', icon: '📅', gradient: 'from-pink-500 to-pink-600' },
    { name: 'User Management', path: '/admin/users', icon: '👥', gradient: 'from-indigo-500 to-indigo-600' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Extract admin name from email (before @)
  useEffect(() => {
    if (user?.email) {
      const name = user.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      const formattedName = name
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setAdminName(formattedName);
    }
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-20 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">
                    Smart Classroom
                  </h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {adminName?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{adminName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm font-medium min-h-touch"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 w-72 bg-white shadow-xl transition-all duration-300 fixed left-0 top-16 bottom-0 border-r border-gray-200 z-20 lg:z-auto`}
        >
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </h2>
            </div>
            <nav className="space-y-2">
              {navigation.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl transform scale-105`
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-lg hover:scale-102'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Animated Background */}
                  {!isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  )}
                  
                  {/* Icon with Animation */}
                  <span className={`relative text-2xl transition-all duration-300 ${
                    isActive(item.path) 
                      ? 'scale-110 animate-bounce' 
                      : 'group-hover:scale-125 group-hover:rotate-12'
                  }`}>
                    {item.icon}
                  </span>
                  
                  {/* Text */}
                  <span className="relative font-semibold text-sm flex-1">{item.name}</span>
                  
                  {/* Active Indicator or Hover Arrow */}
                  {isActive(item.path) ? (
                    <svg
                      className="relative w-5 h-5 ml-auto animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="relative w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                  
                  {/* Active Border */}
                  {isActive(item.path) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">💡</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Need Help?</p>
                <p className="text-xs text-gray-500">Check documentation</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 transition-all duration-300">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
