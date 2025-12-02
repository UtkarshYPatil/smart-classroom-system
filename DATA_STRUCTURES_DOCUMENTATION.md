# Smart Classroom System - Data Structures Documentation

## Overview
This document explains the data structures used in the Smart Classroom RFID Attendance System, their implementation, and how they work together.

---

## 1. Database Tables (Relational Data Structures)

### 1.1 Students Table
**Purpose**: Stores student information with RFID tag mapping

**Structure**:
```sql
students {
    id: UUID (Primary Key)
    name: TEXT
    uid: TEXT (Unique - RFID tag identifier)
    email: TEXT
    phone: TEXT (Optional)
    dob: DATE (Optional)
    course: TEXT
    created_at: TIMESTAMPTZ
}
```

**Data Structure Type**: **Hash Table** (via B-Tree index on `uid`)
- **Implementation**: PostgreSQL B-Tree index on `uid` column
- **Why**: Provides O(log n) lookup time for finding students by RFID UID
- **Location**: `backend/migrations/001_create_students_table.sql`

**Key Features**:
- Unique constraint on `uid` ensures no duplicate RFID tags
- Index on `uid` for fast O(log n) lookups during attendance scanning
- Foreign key relationship with attendance_logs (one-to-many)

---

### 1.2 Attendance Logs Table
**Purpose**: Stores timestamped attendance records

**Structure**:
```sql
attendance_logs {
    id: SERIAL (Primary Key)
    student_uid: TEXT (Foreign Key -> students.uid)
    timestamp: TIMESTAMPTZ
    status: TEXT (default: 'present')
}
```

**Data Structure Type**: **Ordered List** (via B-Tree index on `timestamp`)
- **Implementation**: PostgreSQL B-Tree index on `timestamp` column
- **Why**: Enables efficient chronological queries and range searches
- **Location**: `backend/migrations/002_create_attendance_logs_table.sql`

**Key Features**:
- Foreign key constraint ensures referential integrity
- Cascade delete: when student is deleted, their attendance logs are also deleted
- Composite index on `(student_uid, timestamp)` for efficient per-student queries
- Supports O(log n) time complexity for timestamp-based queries

---

### 1.3 Rooms Table
**Purpose**: Tracks classroom availability and current usage

**Structure**:
```sql
rooms {
    id: SERIAL (Primary Key)
    room_no: TEXT (Unique)
    is_busy: BOOLEAN
    current_class: TEXT (Optional)
    professor_name: TEXT (Optional)
    updated_at: TIMESTAMPTZ
}
```

**Data Structure Type**: **Hash Table** (via B-Tree index on `room_no`)
- **Implementation**: PostgreSQL B-Tree index on `room_no` and `is_busy`
- **Why**: Fast O(log n) lookups for room availability checks
- **Location**: `backend/migrations/003_create_rooms_table.sql`

**Key Features**:
- Unique constraint on `room_no`
- Index on `is_busy` for quick filtering of available rooms
- Real-time status updates via `updated_at` timestamp

---

### 1.4 Timetable Table
**Purpose**: Stores class schedule with room assignments

**Structure**:
```sql
timetable {
    id: SERIAL (Primary Key)
    course: TEXT
    day_of_week: INTEGER (0-6, where 0=Sunday)
    start_time: TIME
    end_time: TIME
    subject: TEXT
    room_no: TEXT (Foreign Key -> rooms.room_no)
    professor_name: TEXT
}
```

**Data Structure Type**: **Multi-dimensional Index** (Composite B-Tree)
- **Implementation**: Composite B-Tree index on `(course, day_of_week, start_time, end_time)`
- **Why**: Enables efficient queries for "current lecture" based on multiple criteria
- **Location**: `backend/migrations/004_create_timetable_table.sql`

**Key Features**:
- Composite index for O(log n) current lecture lookups
- Foreign key to rooms table for room assignment validation
- CHECK constraint on `day_of_week` (0-6) for data integrity
- Supports range queries on time intervals

---

## 2. In-Memory Data Structures (Frontend)

### 2.1 React State Arrays
**Location**: Frontend components (e.g., `AttendanceView.jsx`, `TimetableView.jsx`)

**Example**:
```javascript
const [attendanceLogs, setAttendanceLogs] = useState([]);
const [timetable, setTimetable] = useState([]);
```

**Data Structure Type**: **Dynamic Array** (JavaScript Array)
- **Implementation**: JavaScript native arrays
- **Operations**:
  - `filter()`: O(n) - Filter logs by criteria
  - `map()`: O(n) - Transform data for display
  - `sort()`: O(n log n) - Sort by timestamp or time
  - `find()`: O(n) - Find specific entry

**Usage**:
- Storing fetched attendance records
- Caching timetable entries
- Managing UI state

---

### 2.2 Object Maps (Key-Value Pairs)
**Location**: API responses, component state

**Example**:
```javascript
const studentData = {
  uid: "0BBCCE31",
  name: "John Doe",
  email: "john@example.com",
  course: "AIML"
};
```

**Data Structure Type**: **Hash Map** (JavaScript Object)
- **Implementation**: JavaScript native objects
- **Operations**: O(1) average case for property access
- **Usage**:
  - API response data
  - User authentication context
  - Component props

---

## 3. Algorithm Implementations

### 3.1 Current Lecture Finder
**Location**: `backend/routes/timetable.js` - `GET /api/timetable/current/:course`

**Algorithm**:
```javascript
// 1. Get current day and time
const currentDay = now.getDay(); // O(1)
const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // O(1)

// 2. Query timetable with composite index
const timetableEntries = await supabase
  .from('timetable')
  .select('*')
  .eq('course', course)
  .eq('day_of_week', currentDay); // O(log n) due to composite index

// 3. Filter by time range
const currentLecture = timetableEntries.find(entry => {
  return currentTime >= entry.start_time && currentTime <= entry.end_time;
}); // O(k) where k = entries for current day
```

**Time Complexity**: O(log n + k) where n = total entries, k = entries for current day
**Space Complexity**: O(k)

---

### 3.2 Attendance Percentage Calculator
**Location**: `backend/routes/attendance.js` - `GET /api/attendance/:uid`

**Algorithm**:
```javascript
// 1. Fetch all attendance logs for student
const logs = await supabase
  .from('attendance_logs')
  .select('*')
  .eq('student_uid', uid)
  .order('timestamp', { ascending: false }); // O(log n) due to index

// 2. Count present logs
const attendanceCount = logs.filter(log => log.status === 'present').length; // O(m)

// 3. Calculate percentage
const percentage = Math.round((attendanceCount / 50) * 100); // O(1)
```

**Time Complexity**: O(log n + m) where n = total logs, m = student's logs
**Space Complexity**: O(m)

---

### 3.3 Timetable Grid Renderer
**Location**: `frontend/src/pages/student/TimetableView.jsx`

**Algorithm**:
```javascript
// 1. Generate time slots (8 AM - 6 PM)
const timeSlots = [];
for (let hour = 8; hour <= 18; hour++) {
  timeSlots.push(`${String(hour).padStart(2, '0')}:00:00`);
} // O(11) = O(1)

// 2. For each cell in grid, find matching class
const getClassForSlot = (dayIndex, timeSlot) => {
  return timetable.find((entry) => {
    const isCorrectDay = entry.day_of_week === dayIndex;
    const startsAtOrBeforeSlot = entry.start_time <= timeSlot;
    const endsAfterSlot = entry.end_time > timeSlot;
    return isCorrectDay && startsAtOrBeforeSlot && endsAfterSlot;
  }); // O(t) where t = timetable entries
};
```

**Time Complexity**: O(d × s × t) where d = days (5), s = slots (11), t = timetable entries
**Space Complexity**: O(s) for time slots array

---

## 4. Data Flow Architecture

### 4.1 RFID Scan Flow
```
ESP32 Device
    ↓ (HTTP POST)
Backend API (/api/attendance)
    ↓ (Query with index)
Students Table (B-Tree lookup)
    ↓ (If found)
Attendance Logs Table (Insert)
    ↓ (Response)
ESP32 Device (Confirmation)
```

**Data Structures Used**:
1. Hash Table (students.uid index) - O(log n) lookup
2. Ordered List (attendance_logs) - O(1) insert

---

### 4.2 Student Dashboard Flow
```
Frontend (React)
    ↓ (HTTP GET)
Backend API (/api/attendance/:uid)
    ↓ (Query with indexes)
Students Table + Attendance Logs (JOIN)
    ↓ (Aggregate)
Calculate Percentage
    ↓ (Response)
Frontend State (Array)
    ↓ (Render)
UI Components
```

**Data Structures Used**:
1. B-Tree indexes for efficient queries
2. JavaScript arrays for state management
3. Hash maps for student data

---

## 5. Performance Optimizations

### 5.1 Database Indexes
- **B-Tree indexes** on frequently queried columns
- **Composite indexes** for multi-column queries
- **Unique constraints** prevent duplicates and create implicit indexes

### 5.2 Frontend Caching
- React state caches API responses
- Reduces redundant network requests
- 30-second polling interval for current lecture

### 5.3 Query Optimization
- Foreign key constraints enable efficient JOINs
- Indexes reduce query time from O(n) to O(log n)
- Pagination support for large datasets (not yet implemented)

---

## 6. Summary Table

| Data Structure | Implementation | Location | Time Complexity | Use Case |
|---------------|----------------|----------|-----------------|----------|
| B-Tree Index | PostgreSQL | students.uid | O(log n) | RFID lookup |
| B-Tree Index | PostgreSQL | attendance_logs.timestamp | O(log n) | Time-based queries |
| Composite Index | PostgreSQL | timetable(course, day, time) | O(log n) | Current lecture |
| Hash Map | JavaScript Object | Frontend state | O(1) | Student data |
| Dynamic Array | JavaScript Array | Frontend state | O(n) | Logs, timetable |
| Ordered List | PostgreSQL | attendance_logs | O(1) insert | Attendance records |

---

## 7. Custom Data Structures Implementation

### 7.1 Linked List Queue (Pending Scans)
**Location**: `backend/utils/dataStructures.js`, `backend/services/pendingScanService.js`

**Purpose**: Manage unregistered RFID scans in FIFO order

**Structure**:
```javascript
class Node {
  data: Object
  next: Node | null
}

class LinkedListQueue {
  front: Node | null
  rear: Node | null
  length: number
}
```

**Operations**:
- `enqueue(data)`: O(1) - Add to rear
- `dequeue()`: O(1) - Remove from front
- `peek()`: O(1) - View front without removing
- `toArray()`: O(n) - Convert to array

**Advantages over Array-based Queue**:
- O(1) dequeue (vs O(n) with array.shift())
- No memory reallocation needed
- Efficient for large queues

**Usage**:
```javascript
// When unregistered RFID is scanned
pendingScanService.addPendingScan({ uid: '0BBCCE31', scanned_at: new Date() });

// Admin processes next pending scan
const nextScan = pendingScanService.getNextPendingScan();
```

---

### 7.2 Circular Buffer (Activity Log)
**Location**: `backend/utils/dataStructures.js`, `backend/services/pendingScanService.js`

**Purpose**: Keep last N activities in memory without growing indefinitely

**Structure**:
```javascript
class CircularBuffer {
  buffer: Array
  capacity: number
  head: number  // Oldest item index
  tail: number  // Next insertion index
  count: number // Current size
}
```

**Operations**:
- `add(item)`: O(1) - Add item (overwrites oldest if full)
- `getAll()`: O(n) - Get all items in order
- `getRecent(n)`: O(n) - Get last n items

**Advantages**:
- Fixed memory usage (no unbounded growth)
- O(1) insertion
- Automatic oldest-item removal
- Perfect for logs and recent activity

**Usage**:
```javascript
// Log activity (keeps only last 50)
pendingScanService.logActivity('attendance_logged', { uid: '0BBCCE31' });

// Get recent 10 activities
const recent = pendingScanService.getRecentActivity(10);
```

---

### 7.3 Stack (Undo/Redo Operations)
**Location**: `backend/utils/dataStructures.js`

**Purpose**: Track admin actions for undo/redo functionality

**Structure**:
```javascript
class Stack {
  items: Array
}
```

**Operations**:
- `push(item)`: O(1) - Add to top
- `pop()`: O(1) - Remove from top
- `peek()`: O(1) - View top without removing

**Use Cases**:
- Undo student registration
- Redo deleted attendance records
- Track admin action history

---

### 7.4 Priority Queue (Notifications)
**Location**: `backend/utils/dataStructures.js`

**Purpose**: Send notifications based on priority

**Structure**:
```javascript
class PriorityQueue {
  items: Array<{ item, priority }>
}
```

**Operations**:
- `enqueue(item, priority)`: O(n) - Insert based on priority
- `dequeue()`: O(1) - Remove highest priority item

**Priority Levels**:
1. Critical: System errors, security alerts
2. High: Low attendance warnings
3. Medium: New pending scans
4. Low: General notifications

---

### 7.5 Doubly Linked List (Attendance Navigation)
**Location**: `backend/utils/dataStructures.js`

**Purpose**: Efficient bidirectional navigation through attendance records

**Structure**:
```javascript
class DoublyNode {
  data: Object
  prev: DoublyNode | null
  next: DoublyNode | null
}

class DoublyLinkedList {
  head: DoublyNode | null
  tail: DoublyNode | null
  length: number
}
```

**Operations**:
- `append(data)`: O(1) - Add to end
- `prepend(data)`: O(1) - Add to beginning
- `removeLast()`: O(1) - Remove from end
- `removeFirst()`: O(1) - Remove from beginning

**Advantages**:
- O(1) insertion/deletion at both ends
- Bidirectional traversal
- Memory efficient for large lists

---

## 8. API Endpoints Using Custom Data Structures

### 8.1 Queue Endpoints

**GET /api/attendance/queue/pending**
- Returns all pending scans from Linked List Queue
- Response includes queue size and data structure type
- Admin only

**GET /api/attendance/queue/next**
- Dequeues and returns next pending scan (FIFO)
- Returns remaining queue size
- Admin only

**GET /api/attendance/activity/recent**
- Returns recent activities from Circular Buffer
- Query param: `count` (default: 10)
- Admin only

---

## 9. Performance Comparison

| Operation | Array Queue | Linked List Queue | Improvement |
|-----------|-------------|-------------------|-------------|
| Enqueue | O(1) | O(1) | Same |
| Dequeue | O(n) | O(1) | **n times faster** |
| Peek | O(1) | O(1) | Same |
| Memory | Contiguous | Scattered | Trade-off |

| Operation | Unbounded Array | Circular Buffer | Improvement |
|-----------|-----------------|-----------------|-------------|
| Add | O(1) amortized | O(1) | Same |
| Memory Growth | Unlimited | Fixed | **Bounded** |
| Old Data Removal | Manual | Automatic | **Automatic** |

---

## 10. Updated Summary Table

| Data Structure | Implementation | Location | Time Complexity | Use Case |
|---------------|----------------|----------|-----------------|----------|
| B-Tree Index | PostgreSQL | students.uid | O(log n) | RFID lookup |
| B-Tree Index | PostgreSQL | attendance_logs.timestamp | O(log n) | Time-based queries |
| Composite Index | PostgreSQL | timetable(course, day, time) | O(log n) | Current lecture |
| **Linked List Queue** | **Custom JS** | **pendingScanService** | **O(1) dequeue** | **Pending scans** |
| **Circular Buffer** | **Custom JS** | **pendingScanService** | **O(1) add** | **Activity log** |
| **Stack** | **Custom JS** | **dataStructures.js** | **O(1) push/pop** | **Undo/Redo** |
| **Priority Queue** | **Custom JS** | **dataStructures.js** | **O(n) enqueue** | **Notifications** |
| **Doubly Linked List** | **Custom JS** | **dataStructures.js** | **O(1) both ends** | **Navigation** |
| Hash Map | JavaScript Object | Frontend state | O(1) | Student data |
| Dynamic Array | JavaScript Array | Frontend state | O(n) | Logs, timetable |

---

## 11. Future Improvements

### Potential Data Structure Enhancements:
1. **Heap-based Priority Queue**: O(log n) enqueue instead of O(n)
2. **Bloom Filter**: Quick check if student exists before DB query
3. **Trie**: For autocomplete in student search
4. **Graph Database**: For analyzing attendance patterns and relationships
5. **LRU Cache**: For frequently accessed student data
6. **Skip List**: For sorted attendance records with O(log n) search

---

## 12. Conclusion

The Smart Classroom system now uses a comprehensive set of data structures:

**Database Level**:
- **B-Tree indexes** for O(log n) queries
- **Composite indexes** for multi-dimensional queries
- **Foreign keys** for referential integrity

**Application Level**:
- **Linked List Queue** for efficient FIFO pending scan processing
- **Circular Buffer** for bounded activity logging
- **Stack** for undo/redo operations
- **Priority Queue** for notification management
- **Doubly Linked List** for bidirectional navigation

**Frontend Level**:
- **JavaScript arrays** for state management
- **Hash maps** for O(1) data access

This multi-layered architecture provides:
- **Performance**: O(1) and O(log n) operations where it matters
- **Memory efficiency**: Bounded structures prevent memory leaks
- **Scalability**: Efficient algorithms for growing data
- **Maintainability**: Clear separation of concerns
