import axios from 'axios'

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    
    return response
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message)
    }
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      // Forbidden - show access denied
      console.warn('Access denied - insufficient permissions')
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred')
    }
    
    return Promise.reject(error)
  }
)

// ======================
// AUTH API ENDPOINTS
// ======================
export const authAPI = {
  // Check if admin exists
  checkAdmin: () => api.get('/api/auth/check-admin'),
  
  // Setup first admin
  setupAdmin: (data) => api.post('/api/auth/setup-admin', data),
  
  // Login
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  // Get current user info
  me: () => api.get('/api/auth/me'),
  
  // Change password
  changePassword: (data) => api.put('/api/auth/change-password', data),
  
  // Get all users (Admin only)
  getUsers: () => api.get('/api/auth/users'),
  
  // Update user (Admin only)
  updateUser: (id, data) => api.put(`/api/auth/users/${id}`, data),
  
  // Delete user (Admin only)
  deleteUser: (id) => api.delete(`/api/auth/users/${id}`),
}

// ======================
// ALUMNI API ENDPOINTS
// ======================
export const alumniAPI = {
  // Public endpoints
  register: (data) => {
    // Handle FormData for file uploads
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' }
    
    return api.post('/api/alumni/register', data, { headers })
  },
  
  checkStatus: (idCard) => api.post('/api/alumni/check-status', { idCard }),
  
  uploadPayment: (data) => {
    return api.post('/api/alumni/upload-payment', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Admin endpoints
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/api/alumni${queryString ? `?${queryString}` : ''}`)
  },
  
  getById: (id) => api.get(`/api/alumni/${id}`),
  
  getStatistics: () => api.get('/api/alumni/statistics'),
  
  getDepartments: () => api.get('/api/alumni/departments'),
  
  getGraduationYears: () => api.get('/api/alumni/graduation-years'),
  
  updateStatus: (id, data) => api.patch(`/api/alumni/${id}/status`, data),
  
  updatePosition: (id, data) => api.patch(`/api/alumni/${id}/position`, data),
  
  // Bulk operations
  exportData: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/api/alumni/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    })
  },
}

// ======================
// NOTIFICATION API ENDPOINTS  
// ======================
export const notificationAPI = {
  // Get notifications
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/api/notifications${queryString ? `?${queryString}` : ''}`)
  },
  
  // Get unread count
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  
  // Mark as read
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.patch('/api/notifications/mark-all-read'),
  
  // Delete notification
  delete: (id) => api.delete(`/api/notifications/${id}`),
}

// ======================
// STATUS API ENDPOINTS
// ======================
export const statusAPI = {
  // Check status (Public)
  check: (idCard) => api.post('/api/status/check', { idCard }),
  
  // Update status (Admin only)
  update: (id, data) => api.patch(`/api/status/${id}`, data),
  
  // Get statistics (Admin only) 
  getStatistics: () => api.get('/api/status/statistics'),
  
  // Search alumni (Admin only)
  search: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/api/status/search?${queryString}`)
  },
}

// ======================
// UTILITY FUNCTIONS
// ======================

// Handle API errors consistently
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return data.message || 'ข้อมูลที่ส่งไม่ถูกต้อง'
      case 401:
        return 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่'
      case 403:
        return 'ไม่มีสิทธิ์ในการดำเนินการนี้'
      case 404:
        return 'ไม่พบข้อมูลที่ต้องการ'
      case 409:
        return data.message || 'ข้อมูลซ้ำกับที่มีอยู่แล้ว'
      case 422:
        return data.message || 'ข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด'
      case 429:
        return 'มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่อีกครั้ง'
      case 500:
        return 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง'
      default:
        return data.message || `เกิดข้อผิดพลาด (${status})`
    }
  } else if (error.request) {
    // Network error
    return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
  } else {
    // Other errors
    return error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
  }
}

// Upload file with progress
export const uploadWithProgress = (url, data, onProgress) => {
  return api.post(url, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      if (onProgress) {
        onProgress(percentCompleted)
      }
    }
  })
}

// Download file
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
    
    return { success: true }
  } catch (error) {
    console.error('Download error:', error)
    return { success: false, error: handleApiError(error) }
  }
}

// Check API health
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    })
    return response.ok
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}

// Development helper - log all API endpoints
if (import.meta.env.DEV) {
  window.__API_ENDPOINTS__ = {
    authAPI,
    alumniAPI,
    notificationAPI,
    statusAPI,
    baseURL: API_BASE_URL
  }
  
  console.log('🔧 API Services loaded. Access via window.__API_ENDPOINTS__')
}

export default api