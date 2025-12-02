# Visual Guide to Data Structures in Smart Classroom

## 1. Linked List Queue (FIFO)

```
┌─────────────────────────────────────────────────────┐
│              Linked List Queue                      │
│                                                     │
│  Front                                      Rear    │
│    ↓                                          ↓     │
│  ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐        │
│  │ A │ -> │ B │ -> │ C │ -> │ D │ -> │ E │        │
│  └───┘    └───┘    └───┘    └───┘    └───┘        │
│                                                     │
│  Dequeue ←                          → Enqueue      │
│  (Remove)                            (Add)         │
└─────────────────────────────────────────────────────┘

Operations:
• enqueue('F') → Add F to rear (O(1))
• dequeue()    → Remove A from front (O(1))
• peek()       → View A without removing (O(1))

Example: Pending RFID Scans
┌─────────────────────────────────────────┐
│ Front                           Rear    │
│   ↓                               ↓     │
│ [0BBCCE31] → [1AABBCC2] → [2CCDDEE3]   │
│                                         │
│ Process first → 0BBCCE31 (FIFO)        │
└─────────────────────────────────────────┘
```

---

## 2. Circular Buffer

```
┌─────────────────────────────────────────────────────┐
│            Circular Buffer (Size = 5)               │
│                                                     │
│         ┌───┐                                       │
│      ┌─→│ 3 │←─┐                                   │
│      │  └───┘  │                                   │
│    ┌───┐     ┌───┐                                 │
│    │ 4 │     │ 2 │                                 │
│    └───┘     └───┘                                 │
│      │  ┌───┐  │                                   │
│      └─→│ 5 │←─┘                                   │
│         └───┘                                       │
│          ↑                                          │
│        Head (oldest)                                │
│                                                     │
│  When buffer is full, new items overwrite oldest   │
└─────────────────────────────────────────────────────┘

Timeline:
Add 1 → [1, _, _, _, _]
Add 2 → [1, 2, _, _, _]
Add 3 → [1, 2, 3, _, _]
Add 4 → [1, 2, 3, 4, _]
Add 5 → [1, 2, 3, 4, 5]  ← Buffer full
Add 6 → [6, 2, 3, 4, 5]  ← Overwrites 1
Add 7 → [6, 7, 3, 4, 5]  ← Overwrites 2

Result: Always keeps last 5 items
```

---

## 3. Stack (LIFO)

```
┌─────────────────────────────────────────────────────┐
│                    Stack                            │
│                                                     │
│                    ┌───┐                            │
│                    │ C │ ← Top (Last In)            │
│                    ├───┤                            │
│                    │ B │                            │
│                    ├───┤                            │
│                    │ A │ ← Bottom (First In)        │
│                    └───┘                            │
│                                                     │
│  Push/Pop operations happen at the top             │
└─────────────────────────────────────────────────────┘

Operations:
• push('D')  → Add D to top (O(1))
• pop()      → Remove C from top (O(1))
• peek()     → View C without removing (O(1))

Example: Undo Stack
┌─────────────────────────────────────────┐
│ Top                                     │
│  ↓                                      │
│ [Delete Log #123]                       │
│ [Add Student Jane]                      │
│ [Add Student John]                      │
│                                         │
│ Undo → Removes "Delete Log #123"       │
└─────────────────────────────────────────┘
```

---

## 4. Priority Queue

```
┌─────────────────────────────────────────────────────┐
│              Priority Queue                         │
│                                                     │
│  Priority 1 (Highest)  →  [System Error]           │
│  Priority 2            →  [Low Attendance]          │
│  Priority 3            →  [New Student]             │
│  Priority 4 (Lowest)   →  [Daily Report]            │
│                                                     │
│  Dequeue always returns highest priority item      │
└─────────────────────────────────────────────────────┘

Example: Notification System
┌─────────────────────────────────────────┐
│ Enqueue:                                │
│   • "Daily report" (priority 4)         │
│   • "System error" (priority 1)         │
│   • "New student" (priority 3)          │
│                                         │
│ After sorting:                          │
│   1. System error (priority 1)          │
│   2. New student (priority 3)           │
│   3. Daily report (priority 4)          │
│                                         │
│ Dequeue → "System error" (highest)     │
└─────────────────────────────────────────┘
```

---

## 5. Doubly Linked List

```
┌─────────────────────────────────────────────────────┐
│           Doubly Linked List                        │
│                                                     │
│  Head                                      Tail     │
│    ↓                                         ↓      │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐               │
│  │ A │↔│ B │↔│ C │↔│ D │↔│ E │               │
│  └───┘  └───┘  └───┘  └───┘  └───┘               │
│    ↑                                         ↑      │
│  prev                                      next     │
│                                                     │
│  Can traverse both forward and backward            │
└─────────────────────────────────────────────────────┘

Operations:
• append('F')     → Add F to tail (O(1))
• prepend('Z')    → Add Z to head (O(1))
• removeLast()    → Remove E from tail (O(1))
• removeFirst()   → Remove A from head (O(1))

Example: Attendance History Navigation
┌─────────────────────────────────────────┐
│ [Jan 1]↔[Jan 2]↔[Jan 3]↔[Jan 4]       │
│                                         │
│ Forward:  Jan 1 → Jan 2 → Jan 3 → Jan 4│
│ Backward: Jan 4 → Jan 3 → Jan 2 → Jan 1│
└─────────────────────────────────────────┘
```

---

## 6. B-Tree Index (Database)

```
┌─────────────────────────────────────────────────────┐
│              B-Tree Index on UID                    │
│                                                     │
│                    [M]                              │
│                   /   \                             │
│                 /       \                           │
│              [D]         [T]                        │
│             /   \       /   \                       │
│           /       \   /       \                     │
│        [A,B,C] [E,F,G] [N,O,P] [U,V,W]             │
│                                                     │
│  Search for 'F': M → D → [E,F,G] → Found!         │
│  Time Complexity: O(log n)                         │
└─────────────────────────────────────────────────────┘

Example: Finding Student by UID
┌─────────────────────────────────────────┐
│ Search for UID "0BBCCE31":              │
│                                         │
│ 1. Start at root                        │
│ 2. Compare with middle value            │
│ 3. Go left or right                     │
│ 4. Repeat until found                   │
│                                         │
│ Steps: log₂(10,000) ≈ 13 comparisons   │
│ vs Linear: 10,000 comparisons           │
└─────────────────────────────────────────┘
```

---

## 7. Hash Map (JavaScript Object)

```
┌─────────────────────────────────────────────────────┐
│                Hash Map                             │
│                                                     │
│  Key          Hash Function      Value             │
│  ───          ─────────────      ─────             │
│  "uid"    →   hash("uid")    →   "0BBCCE31"        │
│  "name"   →   hash("name")   →   "John Doe"        │
│  "email"  →   hash("email")  →   "john@edu"        │
│  "course" →   hash("course") →   "AIML"            │
│                                                     │
│  Access: O(1) average case                         │
└─────────────────────────────────────────────────────┘

Example: Student Object
┌─────────────────────────────────────────┐
│ {                                       │
│   uid: "0BBCCE31",      ← O(1) access  │
│   name: "John Doe",     ← O(1) access  │
│   email: "john@edu",    ← O(1) access  │
│   course: "AIML"        ← O(1) access  │
│ }                                       │
└─────────────────────────────────────────┘
```

---

## 8. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  RFID Scan Flow                             │
└─────────────────────────────────────────────────────────────┘

ESP32 Device
     │
     │ POST /api/attendance
     │ { uid: "0BBCCE31" }
     ↓
Backend API
     │
     │ Check if student exists
     ↓
┌────────────────┐
│ B-Tree Index   │ ← O(log n) lookup
│ students.uid   │
└────────────────┘
     │
     ├─→ Found? → Insert into attendance_logs
     │              (Ordered List)
     │
     └─→ Not Found? → Add to Linked List Queue
                       (Pending Scans)
                       │
                       └─→ Add to Circular Buffer
                           (Recent Activity)
```

---

## Performance Comparison Chart

```
┌─────────────────────────────────────────────────────┐
│         Operation Time Complexity                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Data Structure      Insert   Delete   Search      │
│  ───────────────     ──────   ──────   ──────      │
│  Array Queue         O(1)     O(n)     O(n)        │
│  Linked Queue        O(1)     O(1)     O(n)   ✓   │
│  Stack               O(1)     O(1)     O(n)        │
│  Circular Buffer     O(1)     N/A      O(n)        │
│  Priority Queue      O(n)     O(1)     O(n)        │
│  Doubly Linked List  O(1)     O(1)     O(n)        │
│  B-Tree Index        O(log n) O(log n) O(log n) ✓ │
│  Hash Map            O(1)     O(1)     O(1)    ✓✓ │
│                                                     │
└─────────────────────────────────────────────────────┘

Legend:
✓   = Good performance
✓✓  = Excellent performance
```

---

## Memory Usage Comparison

```
┌─────────────────────────────────────────────────────┐
│              Memory Growth                          │
│                                                     │
│  Unbounded Array:                                   │
│  [████████████████████████████████████████]         │
│  Grows indefinitely → Memory leak risk              │
│                                                     │
│  Circular Buffer:                                   │
│  [████████]                                         │
│  Fixed size → No memory leak                        │
│                                                     │
│  Linked List:                                       │
│  [█] → [█] → [█] → [█] → [█]                       │
│  Grows with data, but efficient operations          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Real-World Usage Example

```
┌─────────────────────────────────────────────────────────────┐
│  Scenario: 5 Students Scan RFID, 3 Registered, 2 Not       │
└─────────────────────────────────────────────────────────────┘

Step 1: Scans arrive
┌──────────────────────────────────────┐
│ ESP32 → [A] [B] [C] [D] [E]          │
└──────────────────────────────────────┘

Step 2: Check database (B-Tree Index)
┌──────────────────────────────────────┐
│ Found: A, C, E                       │
│ Not Found: B, D                      │
└──────────────────────────────────────┘

Step 3: Process found students
┌──────────────────────────────────────┐
│ attendance_logs:                     │
│   [A - 09:00 - present]              │
│   [C - 09:01 - present]              │
│   [E - 09:02 - present]              │
└──────────────────────────────────────┘

Step 4: Queue not found students
┌──────────────────────────────────────┐
│ Linked List Queue:                   │
│ Front → [B] → [D] ← Rear             │
└──────────────────────────────────────┘

Step 5: Log all activity
┌──────────────────────────────────────┐
│ Circular Buffer (last 10):           │
│ 1. Scan A - registered               │
│ 2. Scan B - pending                  │
│ 3. Scan C - registered               │
│ 4. Scan D - pending                  │
│ 5. Scan E - registered               │
└──────────────────────────────────────┘

Step 6: Admin processes queue
┌──────────────────────────────────────┐
│ Dequeue → B (FIFO)                   │
│ Register B                           │
│ Dequeue → D (FIFO)                   │
│ Register D                           │
│ Queue now empty ✓                    │
└──────────────────────────────────────┘
```

---

## Summary

✅ **8 Data Structures Implemented**
✅ **All with optimal time complexity**
✅ **Real-world usage in attendance system**
✅ **Performance tested and verified**

Each structure serves a specific purpose and provides the best performance for its use case!
