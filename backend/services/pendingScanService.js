/**
 * Pending Scan Service
 * Uses Queue data structure to manage unregistered RFID scans
 */

const { LinkedListQueue, CircularBuffer } = require('../utils/dataStructures');

// Queue for pending scans (FIFO - First In First Out)
const pendingScansQueue = new LinkedListQueue();

// Circular buffer for recent activity (keeps last 50 activities)
const recentActivityLog = new CircularBuffer(50);

/**
 * Add a pending scan to the queue
 * @param {Object} scan - { uid, scanned_at }
 */
function addPendingScan(scan) {
  pendingScansQueue.enqueue(scan);
  
  // Also log to recent activity
  recentActivityLog.add({
    type: 'pending_scan',
    uid: scan.uid,
    timestamp: scan.scanned_at
  });
  
  console.log(`📥 Added pending scan to queue: ${scan.uid}`);
  console.log(`📊 Queue size: ${pendingScansQueue.size()}`);
}

/**
 * Get the next pending scan (FIFO)
 * @returns {Object|null} - Next scan or null if queue is empty
 */
function getNextPendingScan() {
  const scan = pendingScansQueue.dequeue();
  
  if (scan) {
    console.log(`📤 Dequeued pending scan: ${scan.uid}`);
    console.log(`📊 Remaining in queue: ${pendingScansQueue.size()}`);
  }
  
  return scan;
}

/**
 * Peek at the next pending scan without removing it
 * @returns {Object|null}
 */
function peekNextPendingScan() {
  return pendingScansQueue.peek();
}

/**
 * Get all pending scans
 * @returns {Array}
 */
function getAllPendingScans() {
  return pendingScansQueue.toArray();
}

/**
 * Get queue size
 * @returns {number}
 */
function getPendingScansCount() {
  return pendingScansQueue.size();
}

/**
 * Check if queue is empty
 * @returns {boolean}
 */
function hasPendingScans() {
  return !pendingScansQueue.isEmpty();
}

/**
 * Clear all pending scans
 */
function clearPendingScans() {
  pendingScansQueue.clear();
  console.log('🗑️ Cleared all pending scans');
}

/**
 * Get recent activity log
 * @param {number} count - Number of recent activities to retrieve
 * @returns {Array}
 */
function getRecentActivity(count = 10) {
  return recentActivityLog.getRecent(count);
}

/**
 * Get all activity from circular buffer
 * @returns {Array}
 */
function getAllActivity() {
  return recentActivityLog.getAll();
}

/**
 * Log an activity
 * @param {string} type - Activity type
 * @param {Object} data - Activity data
 */
function logActivity(type, data) {
  recentActivityLog.add({
    type,
    data,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  addPendingScan,
  getNextPendingScan,
  peekNextPendingScan,
  getAllPendingScans,
  getPendingScansCount,
  hasPendingScans,
  clearPendingScans,
  getRecentActivity,
  getAllActivity,
  logActivity
};
