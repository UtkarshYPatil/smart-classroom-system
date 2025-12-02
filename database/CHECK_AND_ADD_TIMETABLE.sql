-- Step 1: Create rooms first (if they don't exist)
-- Rooms table only has: room_no (primary key) and is_busy (boolean)
INSERT INTO rooms (room_no, is_busy)
VALUES 
  ('102', false),
  ('103', false),
  ('104', false),
  ('105', false),
  ('201', false),
  ('202', false)
ON CONFLICT (room_no) DO NOTHING;

-- Step 2: Now add timetable entries for AIML course
-- Monday (day_of_week = 1)
INSERT INTO timetable (course, day_of_week, start_time, end_time, subject, room_no, professor_name)
VALUES 
  ('AIML', 1, '10:30:00', '11:30:00', 'PHYSICS', '102', 'sanjay sharma'),
  ('AIML', 1, '14:00:00', '15:00:00', 'MATHEMATICS', '105', 'Dr. Kumar'),
  
-- Tuesday (day_of_week = 2)
  ('AIML', 2, '09:00:00', '10:00:00', 'CHEMISTRY', '103', 'Prof. Singh'),
  ('AIML', 2, '11:00:00', '12:00:00', 'COMPUTER SCIENCE', '201', 'Dr. Patel'),
  
-- Wednesday (day_of_week = 3)
  ('AIML', 3, '10:00:00', '11:00:00', 'PHYSICS LAB', '102', 'sanjay sharma'),
  ('AIML', 3, '15:00:00', '16:00:00', 'ENGLISH', '104', 'Ms. Sharma'),
  
-- Thursday (day_of_week = 4)
  ('AIML', 4, '09:30:00', '10:30:00', 'MATHEMATICS', '105', 'Dr. Kumar'),
  ('AIML', 4, '13:00:00', '14:00:00', 'DATA STRUCTURES', '201', 'Dr. Patel'),
  
-- Friday (day_of_week = 5)
  ('AIML', 5, '10:00:00', '11:00:00', 'PHYSICS', '102', 'sanjay sharma'),
  ('AIML', 5, '14:30:00', '15:30:00', 'PROGRAMMING', '202', 'Prof. Verma');

-- Verify the data was inserted
SELECT 
  course,
  CASE day_of_week
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
  END as day,
  start_time,
  end_time,
  subject,
  room_no,
  professor_name
FROM timetable 
WHERE course = 'AIML'
ORDER BY day_of_week, start_time;
