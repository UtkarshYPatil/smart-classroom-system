import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    console.log('🔍 Fetching user role for:', userId);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, student_uid, email')
        .eq('id', userId)
        .maybeSingle();

      console.log('📊 User role query result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        console.error('❌ Error fetching user role:', error);
        throw error;
      }

      // If user record doesn't exist, show helpful error
      if (!data) {
        console.error('❌ User record not found in database for user:', userId);
        setError(
          'Your account is not fully set up. Please run the SQL fix script from the documentation or contact your administrator.'
        );
        setUserRole(null);
      } else {
        console.log('✅ User role found:', data);
        setUserRole(data);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error fetching user role:', err);
      setError(err.message);
      setUserRole(null);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user role after successful login
      if (data.user) {
        await fetchUserRole(data.user.id);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
    // Don't set loading to false here - fetchUserRole will do it
  };

  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserRole(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  const signup = async (email, password, role = 'admin', studentUid = null) => {
    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Starting signup with role:', role, 'studentUid:', studentUid);

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            student_uid: studentUid,
          },
          emailRedirectTo: window.location.origin + '/login',
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // Wait for trigger to create user record
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify user record was created with correct role
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (fetchError || !userData) {
        console.warn('⚠️ User record not found, creating manually...');
        // If trigger didn't work, create manually
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: authData.user.id,
            email: email,
            role: role,
            student_uid: studentUid,
          },
        ]);

        if (insertError && !insertError.message.includes('duplicate')) {
          throw insertError;
        }
      } else {
        console.log('✅ User record found:', userData);
        // If role doesn't match, update it
        if (userData.role !== role || userData.student_uid !== studentUid) {
          console.warn('⚠️ Role mismatch, updating...');
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: role, student_uid: studentUid })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('❌ Failed to update role:', updateError);
          }
        }
      }

      // Note: Student record will be created automatically on first login
      // when they visit the attendance page
      if (role === 'student' && studentUid) {
        console.log('✅ Student account created. Profile will be set up on first login.');
      }

      return { 
        data: authData, 
        error: null,
        needsVerification: authData.user.identities?.length === 0
      };
    } catch (err) {
      console.error('❌ Signup error:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
