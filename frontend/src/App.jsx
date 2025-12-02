import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import DebugLogin from './pages/DebugLogin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './pages/AdminPanel';
import StudentPanel from './pages/StudentPanel';
import AttendanceView from './pages/student/AttendanceView';
import TimetableView from './pages/student/TimetableView';
import StudentRegistration from './pages/admin/StudentRegistration';
import Attendance from './pages/admin/Attendance';
import RoomAllocation from './pages/admin/RoomAllocation';
import TimetableManagement from './pages/admin/TimetableManagement';
import UserManagement from './pages/admin/UserManagement';

// Component to handle root redirect based on authentication
const RootRedirect = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but has no role, show setup error
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl border border-red-200">
          <div className="text-center mb-6">
            <div className="inline-block bg-red-100 p-4 rounded-full mb-4">
              <span className="text-5xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Account Setup Required
            </h2>
            <p className="text-gray-600">
              Your account exists but needs to be set up in the database.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Quick Fix:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Open your Supabase Dashboard</li>
              <li>Go to SQL Editor</li>
              <li>Run the script from <code className="bg-gray-100 px-2 py-1 rounded">database/FINAL_DEFINITIVE_FIX.sql</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Refresh Page
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Email: {user?.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect based on user role
  if (userRole?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (userRole?.role === 'student') {
    return <Navigate to="/student" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/debug-login" element={<DebugLogin />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/registration"
            element={
              <ProtectedRoute requiredRole="admin">
                <StudentRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute requiredRole="admin">
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute requiredRole="admin">
                <RoomAllocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/timetable"
            element={
              <ProtectedRoute requiredRole="admin">
                <TimetableManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute requiredRole="student">
                <AttendanceView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute requiredRole="student">
                <TimetableView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
