const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, requireOwnData } = require('../middleware/auth');

/**
 * POST /api/students
 * Register new student (Admin only)
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, uid, email, phone, dob, course } = req.body;

    // Validation
    if (!name || !uid || !email || !course) {
      return res.status(400).json({ 
        error: 'Bad Request - Required fields: name, uid, email, course' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({ 
        error: 'Unprocessable Entity - Invalid email format' 
      });
    }

    // Validate UID format (non-empty string)
    if (typeof uid !== 'string' || uid.trim() === '') {
      return res.status(422).json({ 
        error: 'Unprocessable Entity - UID must be a non-empty string' 
      });
    }

    // Check if UID already exists
    const { data: existingStudent } = await req.supabase
      .from('students')
      .select('uid')
      .eq('uid', uid)
      .single();

    if (existingStudent) {
      return res.status(409).json({ 
        error: 'Conflict - Student with this UID already exists' 
      });
    }

    // Create student record
    const { data, error } = await req.supabase
      .from('students')
      .insert({
        name: name.trim(),
        uid: uid.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        dob: dob || null,
        course: course.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'Conflict - Student with this UID or email already exists' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to register student' 
      });
    }

    res.status(201).json({
      message: 'Student registered successfully',
      data: data
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/students/self-register
 * Self-register as student (for authenticated students)
 * Allows students to create their own record automatically
 */
router.post('/self-register', authenticate, async (req, res) => {
  try {
    const { name, uid, email, course } = req.body;

    // Validation
    if (!uid || !email) {
      return res.status(400).json({ 
        error: 'Bad Request - Required fields: uid, email' 
      });
    }

    // Check if student record already exists
    const { data: existingStudent } = await req.supabase
      .from('students')
      .select('uid')
      .eq('uid', uid)
      .maybeSingle();

    if (existingStudent) {
      // Student already exists, return success
      return res.status(200).json({
        message: 'Student record already exists',
        data: existingStudent
      });
    }

    // Create student record with defaults
    const { data, error } = await req.supabase
      .from('students')
      .insert({
        name: name?.trim() || email.split('@')[0],
        uid: uid.trim(),
        email: email.trim().toLowerCase(),
        course: course?.trim() || 'General',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'Conflict - Student with this UID or email already exists' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to create student record' 
      });
    }

    res.status(201).json({
      message: 'Student record created successfully',
      data: data
    });
  } catch (error) {
    console.error('Error in self-registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/students
 * List all students (Admin only)
 * Requirements: 2.1
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to fetch students' 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/students/latest-scan
 * Get most recently scanned RFID UID (Admin only - used during registration)
 * Checks both attendance_logs and pending_scans tables
 * Requirements: 2.2, 5.3
 * NOTE: This route MUST come before /:uid to avoid matching "latest-scan" as a UID
 */
router.get('/latest-scan', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log('📡 Fetching latest scan...');
    
    // Try to get from pending_scans first (most recent unregistered scans)
    const { data: pendingData, error: pendingError } = await req.supabase
      .from('pending_scans')
      .select('uid, scanned_at')
      .eq('status', 'pending')
      .order('scanned_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingError) {
      console.error('Error fetching pending scans:', pendingError);
    }

    // Try to get from attendance_logs as fallback
    const { data: attendanceData, error: attendanceError } = await req.supabase
      .from('attendance_logs')
      .select('student_uid, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attendanceError) {
      console.error('Error fetching attendance logs:', attendanceError);
    }

    // Determine which is more recent
    let latestUid = null;
    let latestTimestamp = null;

    if (pendingData && attendanceData) {
      // Compare timestamps
      const pendingTime = new Date(pendingData.scanned_at);
      const attendanceTime = new Date(attendanceData.timestamp);
      
      if (pendingTime > attendanceTime) {
        latestUid = pendingData.uid;
        latestTimestamp = pendingData.scanned_at;
        console.log('✅ Latest scan from pending_scans:', latestUid);
      } else {
        latestUid = attendanceData.student_uid;
        latestTimestamp = attendanceData.timestamp;
        console.log('✅ Latest scan from attendance_logs:', latestUid);
      }
    } else if (pendingData) {
      latestUid = pendingData.uid;
      latestTimestamp = pendingData.scanned_at;
      console.log('✅ Latest scan from pending_scans:', latestUid);
    } else if (attendanceData) {
      latestUid = attendanceData.student_uid;
      latestTimestamp = attendanceData.timestamp;
      console.log('✅ Latest scan from attendance_logs:', latestUid);
    }

    if (!latestUid) {
      console.log('❌ No recent scans found');
      return res.status(404).json({ 
        error: 'Not Found - No recent scans available. Please scan an RFID card first.' 
      });
    }

    res.json({
      uid: latestUid,
      timestamp: latestTimestamp
    });
  } catch (error) {
    console.error('Error fetching latest scan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/students/pending-scans
 * Get list of unregistered UIDs that have been scanned (Admin only)
 * Used to show admins which cards need to be registered
 * NOTE: This route MUST come before /:uid to avoid matching "pending-scans" as a UID
 */
router.get('/pending-scans', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('pending_scans')
      .select('*')
      .eq('status', 'pending')
      .order('scanned_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to fetch pending scans' 
      });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching pending scans:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/students/:uid
 * Get student details
 * Students can only access their own data, admins can access any
 * Requirements: 2.2, 5.3
 */
router.get('/:uid', authenticate, requireOwnData, async (req, res) => {
  try {
    const { uid } = req.params;

    const { data, error } = await req.supabase
      .from('students')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        error: 'Not Found - Student with this UID does not exist' 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PUT /api/students/:uid
 * Update student information (Admin only)
 * Requirements: 2.3
 */
router.put('/:uid', authenticate, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, email, phone, dob, course } = req.body;

    // Check if student exists
    const { data: existingStudent } = await req.supabase
      .from('students')
      .select('uid')
      .eq('uid', uid)
      .single();

    if (!existingStudent) {
      return res.status(404).json({ 
        error: 'Not Found - Student with this UID does not exist' 
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(422).json({ 
          error: 'Unprocessable Entity - Invalid email format' 
        });
      }
      updateData.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (dob !== undefined) updateData.dob = dob || null;
    if (course) updateData.course = course.trim();

    // Update student record
    const { data, error } = await req.supabase
      .from('students')
      .update(updateData)
      .eq('uid', uid)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to update student' 
      });
    }

    res.json({
      message: 'Student updated successfully',
      data: data
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * DELETE /api/students/:uid
 * Delete student (Admin only)
 * Requirements: 2.4
 */
router.delete('/:uid', authenticate, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;

    // Check if student exists
    const { data: existingStudent } = await req.supabase
      .from('students')
      .select('uid')
      .eq('uid', uid)
      .single();

    if (!existingStudent) {
      return res.status(404).json({ 
        error: 'Not Found - Student with this UID does not exist' 
      });
    }

    // Delete student (cascade will delete related attendance logs)
    const { error } = await req.supabase
      .from('students')
      .delete()
      .eq('uid', uid);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to delete student' 
      });
    }

    res.json({
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PUT /api/students/pending-scans/:uid/mark-registered
 * Mark a pending scan as registered (Admin only)
 */
router.put('/pending-scans/:uid/mark-registered', authenticate, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;

    const { error } = await req.supabase
      .from('pending_scans')
      .update({ status: 'registered' })
      .eq('uid', uid)
      .eq('status', 'pending');

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to update pending scan' 
      });
    }

    res.json({ message: 'Pending scan marked as registered' });
  } catch (error) {
    console.error('Error updating pending scan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
