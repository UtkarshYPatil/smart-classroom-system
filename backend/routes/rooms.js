const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/rooms
 * List all rooms
 * Requirements: 4.1
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('rooms')
      .select('*')
      .order('room_no', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to fetch rooms' 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/rooms/available
 * Get available rooms (is_busy = false)
 * Requirements: 4.2, 4.3, 10.5
 */
router.get('/available', authenticate, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('rooms')
      .select('*')
      .eq('is_busy', false)
      .order('room_no', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to fetch available rooms' 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/rooms/allocate
 * Allocate a room (Admin only)
 * Requirements: 4.1, 4.2, 4.3, 4.4, 10.5
 */
router.post('/allocate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { room_no, subject, professor_name } = req.body;

    // Validation
    if (!room_no || !subject || !professor_name) {
      return res.status(400).json({ 
        error: 'Bad Request - Required fields: room_no, subject, professor_name' 
      });
    }

    // Check if room exists
    const { data: room, error: roomError } = await req.supabase
      .from('rooms')
      .select('*')
      .eq('room_no', room_no)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ 
        error: 'Not Found - Room does not exist' 
      });
    }

    // Check if room is already busy
    if (room.is_busy) {
      // Get alternative available rooms
      const { data: availableRooms, error: availError } = await req.supabase
        .from('rooms')
        .select('*')
        .eq('is_busy', false)
        .order('room_no', { ascending: true });

      if (availError) {
        console.error('Database error:', availError);
        return res.status(500).json({ 
          error: 'Internal Server Error - Failed to fetch available rooms' 
        });
      }

      return res.status(409).json({ 
        error: 'Conflict - Room is already busy',
        current_allocation: {
          room_no: room.room_no,
          current_class: room.current_class,
          professor_name: room.professor_name
        },
        recommendations: availableRooms
      });
    }

    // Allocate the room
    const { data, error } = await req.supabase
      .from('rooms')
      .update({
        is_busy: true,
        current_class: subject.trim(),
        professor_name: professor_name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('room_no', room_no)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to allocate room' 
      });
    }

    res.status(200).json({
      message: 'Room allocated successfully',
      data: data
    });
  } catch (error) {
    console.error('Error allocating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PUT /api/rooms/:id/release
 * Release a room (Admin only)
 * Requirements: 4.4
 */
router.put('/:id/release', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room exists
    const { data: room, error: roomError } = await req.supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ 
        error: 'Not Found - Room does not exist' 
      });
    }

    // Release the room
    const { data, error } = await req.supabase
      .from('rooms')
      .update({
        is_busy: false,
        current_class: null,
        professor_name: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to release room' 
      });
    }

    res.json({
      message: 'Room released successfully',
      data: data
    });
  } catch (error) {
    console.error('Error releasing room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/rooms
 * Create a new room (Admin only)
 * Helper endpoint for initial setup
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { room_no } = req.body;

    // Validation
    if (!room_no) {
      return res.status(400).json({ 
        error: 'Bad Request - room_no is required' 
      });
    }

    // Check if room already exists
    const { data: existingRoom } = await req.supabase
      .from('rooms')
      .select('room_no')
      .eq('room_no', room_no)
      .single();

    if (existingRoom) {
      return res.status(409).json({ 
        error: 'Conflict - Room already exists' 
      });
    }

    // Create room
    const { data, error } = await req.supabase
      .from('rooms')
      .insert({
        room_no: room_no.trim(),
        is_busy: false,
        current_class: null,
        professor_name: null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'Conflict - Room already exists' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Internal Server Error - Failed to create room' 
      });
    }

    res.status(201).json({
      message: 'Room created successfully',
      data: data
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
