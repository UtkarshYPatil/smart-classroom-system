/**
 * Custom Data Structures Implementation
 * These structures enhance the Smart Classroom system with efficient data handling
 */

// ============================================
// 1. QUEUE - For Pending RFID Scans
// ============================================
class Queue {
  constructor() {
    this.items = [];
  }

  // Add item to end of queue - O(1)
  enqueue(item) {
    this.items.push(item);
  }

  // Remove and return item from front - O(n) due to shift
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }

  // View front item without removing - O(1)
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }

  // Check if queue is empty - O(1)
  isEmpty() {
    return this.items.length === 0;
  }

  // Get queue size - O(1)
  size() {
    return this.items.length;
  }

  // Clear all items - O(1)
  clear() {
    this.items = [];
  }

  // Get all items - O(1)
  getAll() {
    return [...this.items];
  }
}

// ============================================
// 2. OPTIMIZED QUEUE - Using Linked List
// ============================================
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedListQueue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.length = 0;
  }

  // Add item to end - O(1)
  enqueue(data) {
    const newNode = new Node(data);
    
    if (this.isEmpty()) {
      this.front = newNode;
      this.rear = newNode;
    } else {
      this.rear.next = newNode;
      this.rear = newNode;
    }
    
    this.length++;
  }

  // Remove and return item from front - O(1)
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    
    const data = this.front.data;
    this.front = this.front.next;
    
    if (this.front === null) {
      this.rear = null;
    }
    
    this.length--;
    return data;
  }

  // View front item - O(1)
  peek() {
    return this.isEmpty() ? null : this.front.data;
  }

  // Check if empty - O(1)
  isEmpty() {
    return this.length === 0;
  }

  // Get size - O(1)
  size() {
    return this.length;
  }

  // Convert to array - O(n)
  toArray() {
    const result = [];
    let current = this.front;
    
    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }
    
    return result;
  }
}

// ============================================
// 3. STACK - For Undo/Redo Operations
// ============================================
class Stack {
  constructor() {
    this.items = [];
  }

  // Add item to top - O(1)
  push(item) {
    this.items.push(item);
  }

  // Remove and return top item - O(1)
  pop() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.pop();
  }

  // View top item without removing - O(1)
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.items.length - 1];
  }

  // Check if stack is empty - O(1)
  isEmpty() {
    return this.items.length === 0;
  }

  // Get stack size - O(1)
  size() {
    return this.items.length;
  }

  // Clear all items - O(1)
  clear() {
    this.items = [];
  }
}

// ============================================
// 4. CIRCULAR BUFFER - For Recent Activity Log
// ============================================
class CircularBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  // Add item (overwrites oldest if full) - O(1)
  add(item) {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    
    if (this.count < this.capacity) {
      this.count++;
    } else {
      // Buffer is full, move head forward
      this.head = (this.head + 1) % this.capacity;
    }
  }

  // Get all items in order - O(n)
  getAll() {
    const result = [];
    
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index]);
    }
    
    return result;
  }

  // Get most recent N items - O(n)
  getRecent(n) {
    const all = this.getAll();
    return all.slice(-n);
  }

  // Check if buffer is full - O(1)
  isFull() {
    return this.count === this.capacity;
  }

  // Check if buffer is empty - O(1)
  isEmpty() {
    return this.count === 0;
  }

  // Get current size - O(1)
  size() {
    return this.count;
  }

  // Clear buffer - O(1)
  clear() {
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }
}

// ============================================
// 5. PRIORITY QUEUE - For Notifications
// ============================================
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  // Add item with priority - O(n)
  enqueue(item, priority) {
    const queueElement = { item, priority };
    
    if (this.isEmpty()) {
      this.items.push(queueElement);
      return;
    }
    
    // Insert based on priority (lower number = higher priority)
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.items.push(queueElement);
    }
  }

  // Remove and return highest priority item - O(1)
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift().item;
  }

  // View highest priority item - O(1)
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0].item;
  }

  // Check if empty - O(1)
  isEmpty() {
    return this.items.length === 0;
  }

  // Get size - O(1)
  size() {
    return this.items.length;
  }

  // Get all items - O(1)
  getAll() {
    return this.items.map(el => el.item);
  }
}

// ============================================
// 6. DOUBLY LINKED LIST - For Attendance Navigation
// ============================================
class DoublyNode {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // Add to end - O(1)
  append(data) {
    const newNode = new DoublyNode(data);
    
    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    
    this.length++;
  }

  // Add to beginning - O(1)
  prepend(data) {
    const newNode = new DoublyNode(data);
    
    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    
    this.length++;
  }

  // Remove from end - O(1)
  removeLast() {
    if (this.isEmpty()) {
      return null;
    }
    
    const data = this.tail.data;
    
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = this.tail.prev;
      this.tail.next = null;
    }
    
    this.length--;
    return data;
  }

  // Remove from beginning - O(1)
  removeFirst() {
    if (this.isEmpty()) {
      return null;
    }
    
    const data = this.head.data;
    
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      this.head.prev = null;
    }
    
    this.length--;
    return data;
  }

  // Check if empty - O(1)
  isEmpty() {
    return this.length === 0;
  }

  // Get size - O(1)
  size() {
    return this.length;
  }

  // Convert to array - O(n)
  toArray() {
    const result = [];
    let current = this.head;
    
    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }
    
    return result;
  }

  // Convert to array in reverse - O(n)
  toArrayReverse() {
    const result = [];
    let current = this.tail;
    
    while (current !== null) {
      result.push(current.data);
      current = current.prev;
    }
    
    return result;
  }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  Queue,
  LinkedListQueue,
  Stack,
  CircularBuffer,
  PriorityQueue,
  DoublyLinkedList,
  Node,
  DoublyNode
};
