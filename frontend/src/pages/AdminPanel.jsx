import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Student Registration',
      description: 'Register new students with RFID cards',
      icon: '👤',
      link: '/admin/registration',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:shadow-blue-200',
    },
    {
      title: 'Attendance Logs',
      description: 'View real-time attendance tracking',
      icon: '📋',
      link: '/admin/attendance',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:shadow-green-200',
    },
    {
      title: 'Room Allocation',
      description: 'Manage classroom assignments',
      icon: '🏫',
      link: '/admin/rooms',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:shadow-purple-200',
    },
    {
      title: 'Timetable',
      description: 'Schedule and manage class timings',
      icon: '📅',
      link: '/admin/timetable',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverColor: 'hover:shadow-orange-200',
    },
    {
      title: 'User Management',
      description: 'Create and manage user accounts',
      icon: '👥',
      link: '/admin/users',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      hoverColor: 'hover:shadow-indigo-200',
    },
  ];

  const stats = [
    { label: 'Total Students', value: '0', icon: '👨‍🎓', color: 'text-blue-600' },
    { label: 'Active Classes', value: '0', icon: '📚', color: 'text-green-600' },
    { label: 'Available Rooms', value: '0', icon: '🚪', color: 'text-purple-600' },
    { label: 'Today\'s Attendance', value: '0%', icon: '✅', color: 'text-orange-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Banner with Animation */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <span className="text-3xl">👋</span>
                </div>
                <h1 className="text-4xl font-bold">
                  Welcome back, Admin!
                </h1>
              </div>
              <p className="text-blue-100 text-lg font-medium mb-2">
                {user?.email}
              </p>
              <p className="text-blue-200 text-base max-w-2xl">
                Manage your smart classroom system with powerful tools and real-time insights
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold">🔥 All Systems Active</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold">⚡ Real-time Updates</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl transform rotate-6"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 transform hover:scale-110 transition-transform duration-300">
                  <div className="text-7xl animate-bounce">🎓</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 hover:border-transparent hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className={`text-4xl font-bold ${stat.color} group-hover:scale-110 transition-transform duration-300 inline-block`}>
                    {stat.value}
                  </p>
                </div>
                <div className="text-5xl opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 group-hover:rotate-12">
                  {stat.icon}
                </div>
              </div>
              
              {/* Animated Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions with Enhanced Design */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text mr-3">⚡</span>
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">Quick Actions</span>
            </h2>
            <div className="hidden md:block text-sm text-gray-500 font-medium">
              Click any card to get started →
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`group relative ${action.bgColor} rounded-2xl border-2 ${action.borderColor} p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Animated Background Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`text-6xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter drop-shadow-lg`}>
                      {action.icon}
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-full p-2 group-hover:bg-white transition-colors duration-300">
                      <svg
                        className="w-5 h-5 text-gray-600 group-hover:text-gray-800 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                    {action.description}
                  </p>
                  
                  {/* Progress Bar Animation */}
                  <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${action.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status with Modern Design */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">🔔</span>
              System Status
            </h3>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              All Systems Go
            </div>
          </div>
          <div className="space-y-3">
            <div className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <div className="relative flex items-center">
                <div className="relative mr-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <span className="text-gray-800 font-bold block">Backend API</span>
                  <span className="text-gray-500 text-xs">Response time: 45ms</span>
                </div>
              </div>
              <span className="relative text-green-600 text-sm font-bold bg-white px-3 py-1 rounded-full">Online</span>
            </div>
            
            <div className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-teal-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <div className="relative flex items-center">
                <div className="relative mr-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div>
                  <span className="text-gray-800 font-bold block">Database</span>
                  <span className="text-gray-500 text-xs">Supabase PostgreSQL</span>
                </div>
              </div>
              <span className="relative text-green-600 text-sm font-bold bg-white px-3 py-1 rounded-full">Connected</span>
            </div>
            
            <div className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <div className="relative flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <span className="text-gray-800 font-bold block">RFID Scanner</span>
                  <span className="text-gray-500 text-xs">ESP32 Module</span>
                </div>
              </div>
              <span className="relative text-blue-600 text-sm font-bold bg-white px-3 py-1 rounded-full">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;
