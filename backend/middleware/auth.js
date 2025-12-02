/**
 * Authentication and Authorization Middleware
 * Handles JWT token verification and role-based access control
 */

/**
 * Authenticate user from JWT token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await req.supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Fetch user role from users table
    const { data: userData, error: userError } = await req.supabase
      .from('users')
      .select('role, student_uid')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return res.status(403).json({ error: 'Forbidden - User not found in system' });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: userData.role,
      studentUid: userData.student_uid
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Require admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  next();
}

/**
 * Require student role or admin
 */
function requireStudent(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - Authentication required' });
  }

  if (req.user.role !== 'student' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Student access required' });
  }

  next();
}

/**
 * Verify student can only access their own data
 */
function requireOwnData(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - Authentication required' });
  }

  // Admin can access any data
  if (req.user.role === 'admin') {
    return next();
  }

  // Student can only access their own data
  const requestedUid = req.params.uid;
  if (req.user.role === 'student' && req.user.studentUid !== requestedUid) {
    return res.status(403).json({ error: 'Forbidden - Can only access own data' });
  }

  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  requireStudent,
  requireOwnData
};
