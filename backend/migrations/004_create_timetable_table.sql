-- Migration: Create timetable table
-- Description: Creates the timetable table with foreign key to rooms and course index
-- Requirements: 9.3

-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    course TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject TEXT NOT NULL,
    room_no TEXT,
    professor_name TEXT NOT NULL
);

-- Add foreign key to rooms.room_no
ALTER TABLE timetable 
ADD CONSTRAINT fk_timetable_room 
FOREIGN KEY (room_no) 
REFERENCES rooms(room_no) 
ON DELETE SET NULL;

-- Create index on course column for fast course-based queries
CREATE INDEX IF NOT EXISTS idx_timetable_course ON timetable(course);

-- Create composite index for efficient current lecture queries
CREATE INDEX IF NOT EXISTS idx_timetable_course_day_time ON timetable(course, day_of_week, start_time, end_time);

-- Add comments to table
COMMENT ON TABLE timetable IS 'Stores class schedule information with room assignments';
COMMENT ON COLUMN timetable.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN timetable.room_no IS 'References room_no from rooms table';
