const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, requireOwnData } = require('../middleware/auth');
const pendingScanService = require('../services/pendingScanService');

/**
 * POST /api/attendance
 * Log attendance from ESP32 device
 * If student is registered: logs attendance
 * If student is NOT registered: stores UID in pending_scans for admin to register
 * Requirements: 1.4, 3.5
 */
router.post('/', async (req, res) => {
  try {
    const { uid } = req.body;

    // Validation
    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
      return res.status(400).json({ 
        error: 'Bad Request - UID is required and must be a non-empty string' 
      });
    }

    // Check if student exists
    const { data: student, error: studentError } = await req.supabase
      .from('students')
      .select('uid, name')
      .eq('uid', uid)
      .maybeSingle();

    // If student is registered, log attendance
    if (student) {
      const { data, error } = await req.supabase
        .from('attendance_logs')
        .insert({
          student_uid: uid,
          timestamp: new Date().toISOString(),
          status: 'present'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
          error: 'Internal Server Error - Failed to log attendance' 
        });
      }

      return res.status(201).json({
        message: 'Attendance logged successfully',
        registered: true,
        student_name: student.name,
        data: data
      });
    }

    // Student NOT registered - store in pending_scans table AND queue
    console.log(`⚠️ Unregistered UID scanned: ${uid}`);
    
    const scanData = {
      uid: uid,
      scanned_at: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add to in-memory queue (using Linked List Queue data structure)
    pendingScanService.addPendingScan(scanData);
    
    // Also store in database for persistence
    const { data: pendingScan, error: pendingError } = await req.supabase
      .from('pending_scans')
      .insert(scanData)
      .select()
      .single();

    if (pendingError) {
      // If table doesn't exist or insert fails, still return success
      // but log the error
      console.error('Failed to store pending scan:', pendingError);
      
      // Fallback: store in attendance_logs anyway for tracking
      await req.supabase
        .from('attendance_logs')
        .insert({
          student_uid: uid,
          timestamp: new Date().toISOString(),
          status: 'unregistered'
        });
    }

    // Log activity
    pendingScanService.logActivity('unregistered_scan', { uid });

    return res.status(202).json({
      message: 'UID not registered - stored for admin registration',
      registered: false,
      uid: uid,
      queue_position: pendingScanService.getPendingScansCount(),
      action: 'Please register this student in the admin panel'
    });

  } catch (error) {
    console.error('Error processing attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/attendance
 * Get all attendance logs (Admin only)
 * Requirements: 3.1, 3.2
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    // Fetch all attendance logs with student information
    const { data, error } = await req.supabase
      .from('attendance_logs')
      .select(`
        id,
        student_uid,
        timestamp,
        status,
        students (
          name,
          email,
          course
        )
      `)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to fetch attendance logs' 
      });
    }

    // Format response to flatten student data
    const formattedData = data.map(log => ({
      id: log.id,
      student_uid: log.student_uid,
      timestamp: log.timestamp,
      status: log.status,
      student_name: log.students?.name || 'Unknown',
      student_email: log.students?.email || '',
      student_course: log.students?.course || ''
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/attendance/:uid
 * Get attendance logs for specific student
 * Requirements: 3.2
 */
router.get('/:uid', authenticate, requireOwnData, async (req, res) => {
  try {
    const { uid } = req.params;

    // Verify student exists
    const { data: student, error: studentError } = await req.supabase
      .from('students')
      .select('uid, name, email, course')
      .eq('uid', uid)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ 
        error: 'Not Found - Student with this UID does not exist' 
      });
    }

    // Fetch attendance logs for this student
    const { data, error } = await req.supabase
      .from('attendance_logs')
      .select('id, student_uid, timestamp, status')
      .eq('student_uid', uid)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to fetch attendance logs' 
      });
    }

    // Calculate attendance percentage (total logs / 50 sessions * 100)
    const attendanceCount = data.filter(log => log.status === 'present').length;
    const attendancePercentage = Math.round((attendanceCount / 50) * 100);

    res.json({
      student: {
        uid: student.uid,
        name: student.name,
        email: student.email,
        course: student.course
      },
      attendance: {
        total_sessions: 50,
        attended: attendanceCount,
        percentage: attendancePercentage
      },
      logs: data
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/attendance/queue/pending
 * Get all pending scans from in-memory queue (Admin only)
 * Uses Linked List Queue data structure
 */
router.get('/queue/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const pendingScans = pendingScanService.getAllPendingScans();
    const queueSize = pendingScanService.getPendingScansCount();
    
    res.json({
      queue_size: queueSize,
      scans: pendingScans,
      data_structure: 'Linked List Queue (FIFO)'
    });
  } catch (error) {
    console.error('Error fetching pending scans queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/attendance/queue/next
 * Get next pending scan from queue (Admin only)
 * Dequeues the oldest scan (FIFO)
 */
router.get('/queue/next', authenticate, requireAdmin, async (req, res) => {
  try {
    const nextScan = pendingScanService.getNextPendingScan();
    
    if (!nextScan) {
      return res.status(404).json({
        error: 'No pending scans in queue'
      });
    }
    
    res.json({
      scan: nextScan,
      remaining_in_queue: pendingScanService.getPendingScansCount()
    });
  } catch (error) {
    console.error('Error getting next pending scan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/attendance/activity/recent
 * Get recent activity from circular buffer (Admin only)
 * Uses Circular Buffer data structure
 */
router.get('/activity/recent', authenticate, requireAdmin, async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const recentActivity = pendingScanService.getRecentActivity(count);
    
    res.json({
      count: recentActivity.length,
      activities: recentActivity,
      data_structure: 'Circular Buffer'
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
