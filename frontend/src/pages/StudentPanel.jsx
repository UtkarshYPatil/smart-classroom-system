import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StudentLayout from '../components/StudentLayout';
import CurrentLectureCard from '../components/CurrentLectureCard';

const StudentPanel = () => {
  const { userRole } = useAuth();

  const quickLinks = [
    {
      name: 'My Attendance',
      path: '/student/attendance',
      icon: '📋',
      description: 'View your attendance records and percentage',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      name: 'My Timetable',
      path: '/student/timetable',
      icon: '📅',
      description: 'Check your class schedule',
      gradient: 'from-green-500 to-green-600',
    },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
              <p className="text-green-100 text-lg">
                Student ID: {userRole?.student_uid || 'Not assigned'}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-6xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Lecture Card */}
        {userRole?.student_uid && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Lecture</h2>
            <CurrentLectureCard studentUid={userRole.student_uid} />
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105"
              >
                <div className={`bg-gradient-to-r ${link.gradient} p-6`}>
                  <div className="flex items-center justify-between">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <svg
                      className="w-8 h-8 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300"
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
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {link.name}
                  </h3>
                  <p className="text-gray-600">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-3xl">ℹ️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                About Your Dashboard
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Use this dashboard to track your attendance, view your class schedule, 
                and stay updated with your current lectures. All your academic information 
                is available at your fingertips.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentPanel;
