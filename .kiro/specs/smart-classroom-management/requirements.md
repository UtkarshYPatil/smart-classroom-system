# Requirements Document

## Introduction

The Smart Classroom Management System is an IoT-based solution that integrates ESP32 microcontroller hardware with RFID technology, a cloud backend (Supabase), and a React web dashboard. The system enables automated student attendance tracking, student registration via RFID tags, and intelligent room allocation management for educational institutions.

## Glossary

- **ESP32_Device**: The ESP32 microcontroller unit equipped with WiFi capability that interfaces with the RFID reader
- **RFID_Reader**: The MFRC522 RFID reader module that scans student identification tags
- **Backend_API**: The Supabase PostgreSQL database and REST API endpoints
- **Web_Dashboard**: The React-based single-page application for system management and monitoring
- **Student_UID**: The unique identifier read from an RFID tag associated with a student
- **Attendance_Log**: A timestamped record of a student's presence
- **Room_Status**: The current availability state of a classroom (busy or free)
- **Admin_Panel**: The administrative interface with full system management capabilities
- **Student_Panel**: The student-facing interface with read-only access to personal data
- **Timetable**: The schedule of classes including time, subject, room, and professor information
- **Data_Structure_Module**: Custom implementations of fundamental data structures for efficient data management and algorithmic operations

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want the ESP32 device to automatically connect to WiFi and continuously scan for RFID tags, so that student attendance can be captured without manual intervention.

#### Acceptance Criteria

1. WHEN the ESP32_Device powers on, THE ESP32_Device SHALL establish a connection to the configured WiFi network within 30 seconds
2. WHILE the ESP32_Device is powered and connected to WiFi, THE ESP32_Device SHALL poll the RFID_Reader for tag presence every 500 milliseconds
3. WHEN the RFID_Reader detects a tag, THE ESP32_Device SHALL read the Student_UID from the tag within 2 seconds
4. WHEN the ESP32_Device successfully reads a Student_UID, THE ESP32_Device SHALL transmit the Student_UID to the Backend_API via HTTP POST request
5. WHEN the HTTP POST request completes, THE ESP32_Device SHALL output the success or failure status to the Serial Monitor

### Requirement 2

**User Story:** As a system administrator, I want to register new students by capturing their personal information and associating it with their RFID tag, so that the system can identify students during attendance scanning.

#### Acceptance Criteria

1. WHEN a user accesses the registration page, THE Web_Dashboard SHALL display a form with fields for name, email, phone, date of birth, and course
2. WHEN a user clicks the "Scan" button on the registration form, THE Web_Dashboard SHALL fetch the most recently scanned Student_UID from the Backend_API within 3 seconds
3. WHEN the Web_Dashboard receives a Student_UID, THE Web_Dashboard SHALL populate the UID field in the registration form
4. WHEN a user submits the registration form with all required fields, THE Web_Dashboard SHALL send the student data to the Backend_API
5. WHEN the Backend_API receives valid registration data, THE Backend_API SHALL store the student record in the students table with a unique Student_UID constraint

### Requirement 3

**User Story:** As a faculty member, I want to view real-time attendance logs with student attendance percentages, so that I can monitor student participation and identify attendance patterns.

#### Acceptance Criteria

1. WHEN a user accesses the attendance page, THE Web_Dashboard SHALL display all attendance logs from the Backend_API in descending chronological order
2. WHEN a new attendance log is created in the Backend_API, THE Web_Dashboard SHALL update the attendance display within 5 seconds
3. WHEN displaying student attendance records, THE Web_Dashboard SHALL calculate the attendance percentage as (total attendance logs divided by 50 sessions) multiplied by 100
4. WHEN displaying attendance percentage, THE Web_Dashboard SHALL render a visual progress bar representing the percentage value
5. WHEN the Backend_API receives a Student_UID via POST request, THE Backend_API SHALL create an attendance log entry with the Student_UID, current timestamp, and status set to "present"

### Requirement 4

**User Story:** As a faculty member, I want to allocate classrooms for my sessions with automatic conflict detection, so that I can avoid double-booking rooms and receive alternative room suggestions when needed.

#### Acceptance Criteria

1. WHEN a user accesses the room allocation page, THE Web_Dashboard SHALL display a form with fields for room selection, subject, and professor name
2. WHEN a user submits a room allocation request, THE Web_Dashboard SHALL query the Backend_API to check if the selected room's is_busy status is TRUE
3. IF the selected room's is_busy status is TRUE, THEN THE Web_Dashboard SHALL retrieve and display a list of alternative rooms where is_busy is FALSE
4. IF the selected room's is_busy status is FALSE, THEN THE Backend_API SHALL update the room record setting is_busy to TRUE, current_class to the subject, and professor_name to the provided professor
5. WHEN a room allocation is successful, THE Web_Dashboard SHALL display a confirmation message with the allocated room details

### Requirement 5

**User Story:** As a system administrator, I want the database to maintain referential integrity and enforce unique constraints, so that data consistency is preserved across all operations.

#### Acceptance Criteria

1. WHEN a student record is created, THE Backend_API SHALL enforce that the Student_UID value is unique across all records in the students table
2. WHEN an attendance log is created, THE Backend_API SHALL verify that the student_uid references a valid Student_UID in the students table
3. WHEN a student record is queried by Student_UID, THE Backend_API SHALL return the complete student record within 2 seconds
4. THE Backend_API SHALL store student records with fields: id (UUID), name (text), uid (text), email (text), phone (text), dob (date), course (text)
5. THE Backend_API SHALL store attendance log records with fields: id (auto-increment), student_uid (text), timestamp (timestamptz), status (text)

### Requirement 6

**User Story:** As a system administrator, I want the ESP32 device to use specific GPIO pins for RFID communication, so that the hardware connections are standardized and reliable.

#### Acceptance Criteria

1. THE ESP32_Device SHALL configure GPIO 21 as the SDA (SS) pin for RFID_Reader communication
2. THE ESP32_Device SHALL configure GPIO 18 as the SCK pin for RFID_Reader communication
3. THE ESP32_Device SHALL configure GPIO 23 as the MOSI pin for RFID_Reader communication
4. THE ESP32_Device SHALL configure GPIO 19 as the MISO pin for RFID_Reader communication
5. THE ESP32_Device SHALL configure GPIO 22 as the RST pin for RFID_Reader communication

### Requirement 7

**User Story:** As a user of the web dashboard, I want a modern and responsive interface styled with Tailwind CSS, so that I can efficiently manage the system from any device.

#### Acceptance Criteria

1. THE Web_Dashboard SHALL implement all user interface components using React framework
2. THE Web_Dashboard SHALL apply Tailwind CSS utility classes for all styling and layout
3. WHEN the Web_Dashboard is accessed from any device, THE Web_Dashboard SHALL render a responsive layout that adapts to the viewport width
4. THE Web_Dashboard SHALL provide navigation between registration, attendance, and room allocation pages
5. THE Web_Dashboard SHALL display loading states during asynchronous operations with visual feedback

### Requirement 8

**User Story:** As a system administrator, I want a dedicated admin panel with full management capabilities, so that I can control all aspects of the classroom management system.

#### Acceptance Criteria

1. WHEN a user logs in with admin credentials, THE Web_Dashboard SHALL display the Admin_Panel interface
2. WHEN the Admin_Panel is active, THE Web_Dashboard SHALL provide access to student registration, attendance logs, room allocation, and timetable management features
3. WHEN an admin user accesses the Admin_Panel, THE Web_Dashboard SHALL allow create, read, update, and delete operations on student records
4. WHEN an admin user accesses the Admin_Panel, THE Web_Dashboard SHALL allow viewing and exporting of all attendance logs
5. WHEN an admin user accesses the Admin_Panel, THE Web_Dashboard SHALL allow management of room allocations and timetable entries

### Requirement 9

**User Story:** As a student, I want a dedicated student panel where I can view my personal attendance and class information, so that I can track my academic progress without accessing administrative functions.

#### Acceptance Criteria

1. WHEN a student logs in with their credentials, THE Web_Dashboard SHALL display the Student_Panel interface
2. WHEN the Student_Panel is active, THE Web_Dashboard SHALL display the student's attendance percentage calculated from their attendance logs
3. WHEN a student accesses the Student_Panel, THE Web_Dashboard SHALL display the student's personal Timetable showing scheduled classes with time, subject, room number, and professor name
4. WHEN a student accesses the Student_Panel, THE Web_Dashboard SHALL display the current lecture location by querying rooms where is_busy is TRUE and current_class matches the student's course
5. WHEN the Student_Panel is active, THE Web_Dashboard SHALL restrict access to administrative functions including student registration, room allocation, and other students' data

### Requirement 10

**User Story:** As a developer, I want custom data structure implementations integrated into the system, so that the project demonstrates fundamental computer science concepts and optimizes data operations.

#### Acceptance Criteria

1. THE Data_Structure_Module SHALL implement a Queue data structure for managing RFID scan requests in first-in-first-out order
2. THE Data_Structure_Module SHALL implement a Stack data structure for managing navigation history in the Web_Dashboard
3. THE Data_Structure_Module SHALL implement a Linked List data structure for efficient insertion and deletion of attendance records
4. THE Data_Structure_Module SHALL implement a Hash Map data structure for fast lookup of student records by Student_UID
5. WHEN the Backend_API processes room allocation requests, THE Backend_API SHALL utilize the Data_Structure_Module for efficient room availability searching and recommendation algorithms
