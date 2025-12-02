/**
 * Data Structures Test Suite
 * Demonstrates the usage and performance of custom data structures
 */

const {
  Queue,
  LinkedListQueue,
  Stack,
  CircularBuffer,
  PriorityQueue,
  DoublyLinkedList
} = require('../utils/dataStructures');

console.log('🧪 Testing Custom Data Structures\n');

// ============================================
// 1. TEST: Linked List Queue
// ============================================
console.log('📋 TEST 1: Linked List Queue (FIFO)');
console.log('=====================================');

const scanQueue = new LinkedListQueue();

// Simulate RFID scans
scanQueue.enqueue({ uid: 'ABC123', time: '10:00' });
scanQueue.enqueue({ uid: 'DEF456', time: '10:01' });
scanQueue.enqueue({ uid: 'GHI789', time: '10:02' });

console.log('Queue size:', scanQueue.size());
console.log('Front item:', scanQueue.peek());

console.log('\nProcessing scans in FIFO order:');
while (!scanQueue.isEmpty()) {
  const scan = scanQueue.dequeue();
  console.log(`  Processed: ${scan.uid} at ${scan.time}`);
}

console.log('Queue empty:', scanQueue.isEmpty());
console.log('\n');

// ============================================
// 2. TEST: Circular Buffer
// ============================================
console.log('🔄 TEST 2: Circular Buffer (Fixed Size)');
console.log('=========================================');

const activityLog = new CircularBuffer(5); // Keep only last 5 activities

// Add 7 activities (will overwrite first 2)
for (let i = 1; i <= 7; i++) {
  activityLog.add({ activity: `Action ${i}`, timestamp: `10:0${i}` });
  console.log(`Added Action ${i}, Buffer size: ${activityLog.size()}`);
}

console.log('\nBuffer contents (oldest to newest):');
activityLog.getAll().forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.activity} at ${item.timestamp}`);
});

console.log('\nLast 3 activities:');
activityLog.getRecent(3).forEach((item) => {
  console.log(`  - ${item.activity}`);
});

console.log('\n');

// ============================================
// 3. TEST: Stack (LIFO)
// ============================================
console.log('📚 TEST 3: Stack (LIFO - Undo/Redo)');
console.log('====================================');

const undoStack = new Stack();

// Simulate admin actions
undoStack.push({ action: 'Added student John', data: { uid: '001' } });
undoStack.push({ action: 'Added student Jane', data: { uid: '002' } });
undoStack.push({ action: 'Deleted attendance log', data: { id: 123 } });

console.log('Stack size:', undoStack.size());
console.log('Top action:', undoStack.peek().action);

console.log('\nUndo operations (LIFO):');
while (!undoStack.isEmpty()) {
  const action = undoStack.pop();
  console.log(`  Undoing: ${action.action}`);
}

console.log('\n');

// ============================================
// 4. TEST: Priority Queue
// ============================================
console.log('⚡ TEST 4: Priority Queue (Notifications)');
console.log('==========================================');

const notificationQueue = new PriorityQueue();

// Add notifications with different priorities (lower = higher priority)
notificationQueue.enqueue('System error detected', 1);
notificationQueue.enqueue('New student registered', 3);
notificationQueue.enqueue('Low attendance warning', 2);
notificationQueue.enqueue('Daily report ready', 4);

console.log('Queue size:', notificationQueue.size());

console.log('\nProcessing notifications by priority:');
while (!notificationQueue.isEmpty()) {
  const notification = notificationQueue.dequeue();
  console.log(`  📢 ${notification}`);
}

console.log('\n');

// ============================================
// 5. TEST: Doubly Linked List
// ============================================
console.log('🔗 TEST 5: Doubly Linked List (Bidirectional)');
console.log('==============================================');

const attendanceList = new DoublyLinkedList();

// Add attendance records
attendanceList.append({ date: '2024-01-01', status: 'present' });
attendanceList.append({ date: '2024-01-02', status: 'present' });
attendanceList.append({ date: '2024-01-03', status: 'absent' });
attendanceList.prepend({ date: '2023-12-31', status: 'present' });

console.log('List size:', attendanceList.size());

console.log('\nForward traversal:');
attendanceList.toArray().forEach((record) => {
  console.log(`  ${record.date}: ${record.status}`);
});

console.log('\nBackward traversal:');
attendanceList.toArrayReverse().forEach((record) => {
  console.log(`  ${record.date}: ${record.status}`);
});

console.log('\nRemoving from both ends:');
console.log('  Removed first:', attendanceList.removeFirst().date);
console.log('  Removed last:', attendanceList.removeLast().date);
console.log('  Remaining size:', attendanceList.size());

console.log('\n');

// ============================================
// 6. PERFORMANCE COMPARISON
// ============================================
console.log('⚡ TEST 6: Performance Comparison');
console.log('==================================');

// Array-based queue vs Linked List queue
const arrayQueue = new Queue();
const linkedQueue = new LinkedListQueue();

const testSize = 10000;

// Test enqueue performance
console.log(`\nEnqueuing ${testSize} items:`);

let start = Date.now();
for (let i = 0; i < testSize; i++) {
  arrayQueue.enqueue({ id: i });
}
let arrayEnqueueTime = Date.now() - start;

start = Date.now();
for (let i = 0; i < testSize; i++) {
  linkedQueue.enqueue({ id: i });
}
let linkedEnqueueTime = Date.now() - start;

console.log(`  Array Queue: ${arrayEnqueueTime}ms`);
console.log(`  Linked Queue: ${linkedEnqueueTime}ms`);

// Test dequeue performance
console.log(`\nDequeuing ${testSize} items:`);

start = Date.now();
while (!arrayQueue.isEmpty()) {
  arrayQueue.dequeue();
}
let arrayDequeueTime = Date.now() - start;

start = Date.now();
while (!linkedQueue.isEmpty()) {
  linkedQueue.dequeue();
}
let linkedDequeueTime = Date.now() - start;

console.log(`  Array Queue: ${arrayDequeueTime}ms`);
console.log(`  Linked Queue: ${linkedDequeueTime}ms`);
console.log(`  Speedup: ${(arrayDequeueTime / linkedDequeueTime).toFixed(2)}x faster`);

console.log('\n');

// ============================================
// 7. REAL-WORLD SCENARIO
// ============================================
console.log('🎯 TEST 7: Real-World Scenario');
console.log('===============================');

console.log('\nScenario: Processing pending RFID scans');

const pendingScans = new LinkedListQueue();
const recentActivity = new CircularBuffer(10);

// Simulate 5 unregistered scans
const scans = [
  { uid: '0BBCCE31', time: '09:00' },
  { uid: '1AABBCC2', time: '09:05' },
  { uid: '2CCDDEE3', time: '09:10' },
  { uid: '3EEFFGG4', time: '09:15' },
  { uid: '4GGHHII5', time: '09:20' }
];

console.log('\nAdding scans to queue:');
scans.forEach((scan) => {
  pendingScans.enqueue(scan);
  recentActivity.add({ type: 'scan', uid: scan.uid, time: scan.time });
  console.log(`  ✓ Queued: ${scan.uid} at ${scan.time}`);
});

console.log(`\nTotal pending: ${pendingScans.size()}`);

console.log('\nAdmin processes scans (FIFO):');
let processed = 0;
while (pendingScans.size() > 0 && processed < 3) {
  const scan = pendingScans.dequeue();
  console.log(`  ✓ Registered: ${scan.uid}`);
  recentActivity.add({ type: 'registered', uid: scan.uid });
  processed++;
}

console.log(`\nRemaining in queue: ${pendingScans.size()}`);

console.log('\nRecent activity log:');
recentActivity.getAll().forEach((activity, index) => {
  console.log(`  ${index + 1}. [${activity.type}] ${activity.uid} ${activity.time || ''}`);
});

console.log('\n✅ All tests completed!\n');
