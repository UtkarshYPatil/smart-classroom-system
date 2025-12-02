# Implementation Plan

- [x] 1. Set up project structure and initialize repositories





  - Create directory structure: `/esp32`, `/frontend`, `/backend`, `/data-structures`
  - Initialize React project with Vite and Tailwind CSS
  - Set up Arduino project structure for ESP32
  - Create README files with setup instructions
  - _Requirements: 7.1, 7.2_

- [-] 2. Implement custom data structures module








  - [x] 2.1 Create Queue data structure class

    - Implement enqueue, dequeue, peek, isEmpty methods
    - Add size tracking and boundary checks
    - _Requirements: 10.1_

  - [x] 2.2 Create Stack data structure class

    - Implement push, pop, peek, isEmpty methods
    - Add size tracking and boundary checks
    - _Requirements: 10.2_

  - [x] 2.3 Create LinkedList data structure class

    - Implement Node class with data and next pointer
    - Implement insert, delete, search, toArray methods
    - _Requirements: 10.3_


  - [x] 2.4 Create HashMap data structure class







    - Implement hash function with collision handling


    - Implement set, get, delete, has methods
    - _Requirements: 10.4_
  - [ ] 2.5 Write unit tests for all data structures
    - Test Queue operations and edge cases
    - Test Stack operations and edge cases
    - Test LinkedList operations and edge cases
    - Test HashMap operations and collision handling
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 3. Set up Supabase backend and database schema






  - [x] 3.1 Create Supabase project and configure environment

    - Sign up for Supabase account
    - Create new project and note API keys
    - Configure environment variables file
    - _Requirements: 5.4, 5.5_
  - [x] 3.2 Create students table with schema


    - Write SQL migration for students table
    - Add unique constraint on uid field
    - Create index on uid column
    - _Requirements: 2.5, 5.1, 5.4_
  - [x] 3.3 Create attendance_logs table with foreign key


    - Write SQL migration for attendance_logs table
    - Add foreign key reference to students.uid
    - Create indexes on student_uid and timestamp


    - _Requirements: 3.5, 5.2, 5.5_
  - [ ] 3.4 Create rooms table with schema
    - Write SQL migration for rooms table


    - Add unique constraint on room_no
    - Create index on is_busy column
    - _Requirements: 4.2, 4.3, 4.4_


  - [ ] 3.5 Create timetable table with relationships
    - Write SQL migration for timetable table
    - Add foreign key to rooms.room_no
    - Create index on course column
    - _Requirements: 9.3_
  - [ ] 3.6 Create users table for authentication
    - Write SQL migration for users table
    - Add role enum constraint (admin/student)
    - Add foreign key to students.uid for student role
    - _Requirements: 8.1, 9.1_

- [-] 4. Implement backend API endpoints



  - [x] 4.1 Create attendance API endpoints


    - Implement POST /api/attendance for logging attendance
    - Implement GET /api/attendance for fetching all logs
    - Implement GET /api/attendance/:uid for student-specific logs
    - Add validation and error handling
    - _Requirements: 1.4, 3.1, 3.2, 3.5_
  - [x] 4.2 Create student management API endpoints


    - Implement POST /api/students for registration
    - Implement GET /api/students for listing all students
    - Implement GET /api/students/:uid for fetching student details
    - Implement PUT /api/students/:uid for updates
    - Implement DELETE /api/students/:uid for deletion
    - Implement GET /api/students/latest-scan for RFID scan
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.3_
  - [x] 4.3 Create room allocation API endpoints


    - Implement GET /api/rooms for listing all rooms
    - Implement GET /api/rooms/available for available rooms
    - Implement POST /api/rooms/allocate for room allocation
    - Implement PUT /api/rooms/:id/release for releasing rooms
    - Add room availability checking logic
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.5_
  - [x] 4.4 Create timetable API endpoints




    - Implement GET /api/timetable/:course for course timetable
    - Implement POST /api/timetable for creating entries
    - Implement GET /api/timetable/current/:course for current lecture
    - _Requirements: 9.3, 9.4_
  - [x] 4.5 Implement authentication and authorization middleware





    - Set up Supabase Auth integration
    - Create role-based access control middleware
    - Protect admin-only endpoints
    - Protect student-specific endpoints
    - _Requirements: 8.1, 8.2, 9.1, 9.5_

- [x] 5. Develop ESP32 firmware for RFID scanning





  - [x] 5.1 Configure ESP32 pin connections and initialize RFID


    - Define GPIO pin constants for MFRC522
    - Initialize SPI communication
    - Initialize MFRC522 library with pin configuration
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


  - [ ] 5.2 Implement WiFi connection functionality
    - Create connectWiFi function with SSID and password
    - Add retry logic with 3 attempts and 5s delay


    - Add Serial output for connection status
    - _Requirements: 1.1_
  - [ ] 5.3 Implement RFID card polling and UID reading
    - Create pollRFIDCard function with 500ms interval

    - Create readCardUID function to extract UID

    - Add timeout handling (2s per read)
    - Add Serial output for card detection
    - _Requirements: 1.2, 1.3_
  - [x] 5.4 Implement HTTP POST request to backend API


    - Create sendAttendance function with UID parameter
    - Configure HTTP client with backend URL
    - Send POST request with JSON payload
    - Handle response status codes
    - Add Serial output for success/failure
    - _Requirements: 1.4, 1.5_
  - [ ] 5.5 Integrate all components in main loop
    - Initialize WiFi and RFID in setup()
    - Implement main loop with RFID polling
    - Add error handling and recovery logic
    - Add watchdog timer for crash recovery
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Build React frontend authentication system




  - [x] 6.1 Set up Supabase client and auth context


    - Install Supabase JS client library
    - Create AuthContext with login/logout functions
    - Create AuthProvider component
    - _Requirements: 8.1, 9.1_
  - [x] 6.2 Create Login component


    - Build login form with email and password fields
    - Implement login handler with Supabase Auth
    - Add error handling and validation
    - Style with Tailwind CSS
    - _Requirements: 8.1, 9.1, 7.2, 7.3_
  - [x] 6.3 Implement role-based routing


    - Create ProtectedRoute component
    - Check user role from users table
    - Redirect admin users to Admin Panel
    - Redirect student users to Student Panel
    - _Requirements: 8.1, 9.1_

- [x] 7. Develop Admin Panel components





  - [x] 7.1 Create Admin Panel layout and navigation


    - Build navigation component with links
    - Create layout wrapper with sidebar
    - Add logout functionality
    - Style with Tailwind CSS
    - _Requirements: 8.2, 7.2, 7.3, 7.4_
  - [x] 7.2 Build Student Registration page


    - Create registration form component
    - Add form fields: name, email, phone, dob, course, uid
    - Implement "Scan" button to fetch latest UID
    - Implement form submission to POST /api/students
    - Add form validation and error handling
    - Integrate Queue data structure for scan buffering
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.1_
  - [x] 7.3 Build Attendance page with real-time logs


    - Create AttendanceTable component
    - Fetch attendance logs from GET /api/attendance
    - Implement real-time updates with polling (5s interval)
    - Calculate attendance percentage: (count / 50) * 100
    - Create ProgressBar component for percentage display
    - Integrate LinkedList for efficient log management
    - Integrate HashMap for fast student lookup
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.3, 10.4_
  - [x] 7.4 Build Room Allocation page


    - Create AllocationForm component
    - Add form fields: room selection, subject, professor
    - Implement room availability check via GET /api/rooms
    - Display RoomRecommendations when room is busy
    - Implement allocation via POST /api/rooms/allocate
    - Add success/error notifications
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.5_
  - [x] 7.5 Build Timetable Management page


    - Create timetable form for adding entries
    - Display existing timetable entries in table
    - Implement POST /api/timetable for creation
    - Add edit and delete functionality
    - _Requirements: 8.2, 8.5_

- [x] 8. Develop Student Panel components





  - [x] 8.1 Create Student Panel layout and navigation


    - Build navigation component with links
    - Create layout wrapper
    - Add logout functionality
    - Style with Tailwind CSS
    - Integrate Stack data structure for navigation history
    - _Requirements: 9.1, 9.5, 10.2, 7.2, 7.3_
  - [x] 8.2 Build Attendance View for students


    - Fetch student-specific logs from GET /api/attendance/:uid
    - Calculate and display attendance percentage
    - Create ProgressBar component for visualization
    - Display attendance history in table
    - _Requirements: 9.2, 3.3, 3.4_
  - [x] 8.3 Build Timetable View for students


    - Fetch timetable from GET /api/timetable/:course
    - Display schedule in weekly grid format
    - Highlight current day and time
    - Show time, subject, room, professor for each slot
    - _Requirements: 9.3_
  - [x] 8.4 Build Current Lecture Card


    - Fetch current lecture from GET /api/timetable/current/:course
    - Query room status from GET /api/rooms
    - Display current lecture location and details
    - Update in real-time with polling
    - _Requirements: 9.4_

- [x] 9. Implement shared UI components and utilities





  - [x] 9.1 Create ProgressBar component

    - Accept percentage prop
    - Render visual progress bar with Tailwind
    - Add color coding (red < 75%, yellow 75-85%, green > 85%)
    - Display percentage text
    - _Requirements: 3.4, 9.2_
  - [x] 9.2 Create API utility functions

    - Create axios instance with base URL
    - Add request interceptor for auth token
    - Add response interceptor for error handling
    - Create helper functions for each endpoint
    - _Requirements: 7.5_
  - [x] 9.3 Create loading and error components


    - Build LoadingSpinner component
    - Build ErrorMessage component
    - Build Toast notification component
    - _Requirements: 7.5_
  - [x] 9.4 Implement responsive design utilities


    - Add mobile-responsive breakpoints
    - Test on different screen sizes
    - Ensure touch-friendly interactions
    - _Requirements: 7.3_

- [ ] 10. Integration and end-to-end testing
  - [ ] 10.1 Test ESP32 to backend integration
    - Scan RFID card and verify POST request
    - Check attendance log creation in database
    - Verify Serial Monitor output
    - Test error scenarios (network failure, invalid UID)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ] 10.2 Test registration workflow
    - Register new student via Admin Panel
    - Scan RFID card and map to student
    - Verify student record in database
    - Test duplicate UID handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ] 10.3 Test attendance tracking workflow
    - Scan card and verify real-time update in Admin Panel
    - Check attendance percentage calculation
    - Verify student can see their attendance in Student Panel
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.2_
  - [ ] 10.4 Test room allocation workflow
    - Allocate available room via Admin Panel
    - Attempt to allocate busy room and verify recommendations
    - Release room and verify status update
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ] 10.5 Test authentication and authorization
    - Login as admin and verify access to Admin Panel
    - Login as student and verify access to Student Panel
    - Verify students cannot access admin features
    - Test logout functionality
    - _Requirements: 8.1, 8.2, 9.1, 9.5_

- [ ] 11. Documentation and deployment preparation
  - [ ] 11.1 Write ESP32 setup documentation
    - Document hardware connections and pin diagram
    - Provide WiFi configuration instructions
    - Include troubleshooting guide
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ] 11.2 Write backend deployment guide
    - Document Supabase setup steps
    - Provide database migration instructions
    - Include environment variable configuration
    - _Requirements: 5.4, 5.5_
  - [ ] 11.3 Write frontend deployment guide
    - Document build and deployment process
    - Provide environment configuration guide
    - Include hosting platform recommendations
    - _Requirements: 7.1, 7.2_
  - [ ] 11.4 Create user manual
    - Document Admin Panel features and workflows
    - Document Student Panel features
    - Include screenshots and examples
    - _Requirements: 8.2, 9.1_
