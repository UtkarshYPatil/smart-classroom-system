import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Student API endpoints
export const studentAPI = {
  // Register a new student
  register: async (studentData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers,
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Get all students
  getAll: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/students`, { headers });
    return handleResponse(response);
  },

  // Get student by UID
  getByUid: async (uid) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/students/${uid}`, { headers });
    return handleResponse(response);
  },

  // Get latest scanned UID
  getLatestScan: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/students/latest-scan`, { headers });
    return handleResponse(response);
  },

  // Update student
  update: async (uid, studentData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/students/${uid}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Delete student
  delete: async (uid) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/students/${uid}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response);
  },
};

// Attendance API endpoints
export const attendanceAPI = {
  // Get all attendance logs
  getAll: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/attendance`, { headers });
    return handleResponse(response);
  },

  // Get attendance logs for a specific student
  getByUid: async (uid) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/attendance/${uid}`, { headers });
    return handleResponse(response);
  },

  // Log attendance (typically called by ESP32)
  log: async (uid) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ uid }),
    });
    return handleResponse(response);
  },
};

// Room API endpoints
export const roomAPI = {
  // Get all rooms
  getAll: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms`, { headers });
    return handleResponse(response);
  },

  // Get available rooms
  getAvailable: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/available`, { headers });
    return handleResponse(response);
  },

  // Allocate a room
  allocate: async (roomData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/allocate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(roomData),
    });
    return handleResponse(response);
  },

  // Release a room
  release: async (roomId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/release`, {
      method: 'PUT',
      headers,
    });
    return handleResponse(response);
  },
};

// Timetable API endpoints
export const timetableAPI = {
  // Get timetable for a course
  getByCourse: async (course) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/timetable/${course}`, { headers });
    return handleResponse(response);
  },

  // Get current lecture for a course
  getCurrentLecture: async (course) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/timetable/current/${course}`, { headers });
    return handleResponse(response);
  },

  // Create timetable entry
  create: async (timetableData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/timetable`, {
      method: 'POST',
      headers,
      body: JSON.stringify(timetableData),
    });
    return handleResponse(response);
  },
};

// Generic API client for custom requests
const api = {
  get: async (endpoint) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    return handleResponse(response);
  },

  post: async (endpoint, data) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (endpoint, data) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response);
  },
};

export default api;
