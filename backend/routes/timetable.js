const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/timetable/:course
 * Get timetable for a course
 * Requirements: 9.3
 */
router.get('/:course', authenticate, async (req, res) => {
  try {
    const { course } = req.params;

    const { data, error } = await req.supabase
      .from('timetable')
      .select('*')
      .eq('course', course)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to fetch timetable' 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/timetable
 * Create timetable entry (Admin only)
 * Requirements: 9.3
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { course, day_of_week, start_time, end_time, subject, room_no, professor_name } = req.body;

    // Validation
    if (!course || day_of_week === undefined || !start_time || !end_time || !subject || !room_no || !professor_name) {
      return res.status(400).json({ 
        error: 'Bad Request - Required fields: course, day_of_week, start_time, end_time, subject, room_no, professor_name' 
      });
    }

    // Validate day_of_week (0-6)
    if (typeof day_of_week !== 'number' || day_of_week < 0 || day_of_week > 6) {
      return res.status(422).json({ 
        error: 'Unprocessable Entity - day_of_week must be a number between 0 (Sunday) and 6 (Saturday)' 
      });
    }

    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(422).json({ 
        error: 'Unprocessable Entity - Invalid time format. Use HH:MM or HH:MM:SS' 
      });
    }

    // Verify room exists
    const { data: room, error: roomError } = await req.supabase
      .from('rooms')
      .select('room_no')
      .eq('room_no', room_no)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ 
        error: 'Not Found - Room does not exist' 
      });
    }

    // Create timetable entry
    const { data, error } = await req.supabase
      .from('timetable')
      .insert({
        course: course.trim(),
        day_of_week: day_of_week,
        start_time: start_time,
        end_time: end_time,
        subject: subject.trim(),
        room_no: room_no.trim(),
        professor_name: professor_name.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to create timetable entry' 
      });
    }

    res.status(201).json({
      message: 'Timetable entry created successfully',
      data: data
    });
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/timetable/current/:course
 * Get current lecture information for a course
 * Requirements: 9.4
 */
router.get('/current/:course', authenticate, async (req, res) => {
  try {
    const { course } = req.params;
    
    // Get current day and time
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

    // Find current lecture based on day and time
    const { data: timetableEntries, error: timetableError } = await req.supabase
      .from('timetable')
      .select('*')
      .eq('course', course)
      .eq('day_of_week', currentDay);

    if (timetableError) {
      console.error('Database error:', timetableError);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to fetch timetable' 
      });
    }

    // Filter entries where current time is between start_time and end_time
    const currentLecture = timetableEntries.find(entry => {
      const startTime = entry.start_time.substring(0, 5);
      const endTime = entry.end_time.substring(0, 5);
      return currentTime >= startTime && currentTime <= endTime;
    });

    if (!currentLecture) {
      return res.status(404).json({ 
        error: 'Not Found - No lecture currently scheduled for this course',
        current_time: currentTime,
        current_day: currentDay
      });
    }

    // Get room status
    const { data: roomData, error: roomError } = await req.supabase
      .from('rooms')
      .select('*')
      .eq('room_no', currentLecture.room_no)
      .single();

    if (roomError) {
      console.error('Database error:', roomError);
      // Continue without room data
    }

    res.json({
      lecture: currentLecture,
      room: roomData || null,
      current_time: currentTime,
      current_day: currentDay
    });
  } catch (error) {
    console.error('Error fetching current lecture:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;