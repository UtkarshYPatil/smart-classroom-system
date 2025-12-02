import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const DebugLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  const addLog = (message, data = null, type = 'info') => {
    const log = {
      time: new Date().toLocaleTimeString(),
      message,
      data,
      type
    };
    setLogs(prev => [...prev, log]);
    console.log(`[${type.toUpperCase()}]`, message, data);
  };

  const handleLogin = async () => {
    setLogs([]);
    addLog('🚀 Starting login process...');

    try {
      // Step 1: Auth login
      addLog('Step 1: Authenticating with Supabase...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        addLog('❌ Auth failed', authError, 'error');
        return;
      }

      addLog('✅ Auth successful', {
        user_id: authData.user.id,
        email: authData.user.email
      }, 'success');

      // Step 2: Fetch user role
      addLog('Step 2: Fetching user role from database...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, student_uid')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (userError) {
        addLog('❌ User fetch failed', userError, 'error');
        return;
      }

      if (!userData) {
        addLog('❌ User record not found in database', {
          user_id: authData.user.id,
          message: 'Auth user exists but no record in users table'
        }, 'error');
        return;
      }

      addLog('✅ User role found', userData, 'success');

      // Step 3: Navigate
      addLog('Step 3: Navigating to dashboard...');
      if (userData.role === 'admin') {
        addLog('✅ Redirecting to /admin', null, 'success');
        setTimeout(() => navigate('/admin'), 1000);
      } else if (userData.role === 'student') {
        addLog('✅ Redirecting to /student', null, 'success');
        setTimeout(() => navigate('/student'), 1000);
      }

    } catch (error) {
      addLog('❌ Unexpected error', error, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Login</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Login Form</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Debug Login
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Debug Logs</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click "Debug Login" to start.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    log.type === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : log.type === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="text-xs text-gray-500 mr-3">{log.time}</span>
                    <div className="flex-1">
                      <p className="font-medium">{log.message}</p>
                      {log.data && (
                        <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugLogin;
