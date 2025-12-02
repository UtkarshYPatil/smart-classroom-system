-- Migration: Create rooms table
-- Description: Creates the rooms table with unique room_no constraint and is_busy index
-- Requirements: 4.2, 4.3, 4.4

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_no TEXT NOT NULL,
    is_busy BOOLEAN DEFAULT FALSE,
    current_class TEXT,
    professor_name TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on room_no
ALTER TABLE rooms ADD CONSTRAINT rooms_room_no_unique UNIQUE (room_no);

-- Create index on is_busy column for fast availability queries
CREATE INDEX IF NOT EXISTS idx_rooms_is_busy ON rooms(is_busy);

-- Add comments to table
COMMENT ON TABLE rooms IS 'Stores classroom information and availability status';
COMMENT ON COLUMN rooms.room_no IS 'Unique room number identifier';
COMMENT ON COLUMN rooms.is_busy IS 'Current availability status of the room';
COMMENT ON COLUMN rooms.current_class IS 'Subject currently being taught in the room';
COMMENT ON COLUMN rooms.professor_name IS 'Name of professor currently using the room';
