const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/stats/dashboard
 * Get dashboard statistics (Admin only)
 * Returns: total students, active classes, available rooms, today's attendance
 */
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get total students count
    const { count: totalStudents, error: studentsError } = await req.supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (studentsError) {
      console.error('Error fetching students count:', studentsError);
    }

    // Get active classes count (rooms that are currently busy)
    const { count: activeClasses, error: classesError } = await req.supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('is_busy', true);

    if (classesError) {
      console.error('Error fetching active classes:', classesError);
    }

    // Get available rooms count
    const { count: availableRooms, error: roomsError } = await req.supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('is_busy', false);

    if (roomsError) {
      console.error('Error fetching available rooms:', roomsError);
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Count unique students who attended today
    const { data: todayAttendance, error: attendanceError } = await req.supabase
      .from('attendance_logs')
      .select('student_uid')
      .eq('status', 'present')
      .gte('timestamp', todayISO);

    if (attendanceError) {
      console.error('Error fetching today\'s attendance:', attendanceError);
    }

    // Calculate unique students who attended today
    const uniqueStudentsToday = todayAttendance 
      ? new Set(todayAttendance.map(log => log.student_uid)).size 
      : 0;

    // Calculate attendance percentage
    const attendancePercentage = totalStudents > 0 
      ? Math.round((uniqueStudentsToday / totalStudents) * 100) 
      : 0;

    res.json({
      total_students: totalStudents || 0,
      active_classes: activeClasses || 0,
      available_rooms: availableRooms || 0,
      todays_attendance: {
        count: uniqueStudentsToday,
        percentage: attendancePercentage
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
