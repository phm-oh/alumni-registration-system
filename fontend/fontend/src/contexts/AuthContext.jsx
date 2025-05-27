import React, { createContext, useContext, useEffect, useState } from 'react'

// Create Auth Context
const AuthContext = createContext({})

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setLoading(false)
        return
      }

      // Verify token with backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5500'}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
        setIsAuthenticated(true)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5500'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { token, user: userData } = data.data
        
        // Store token
        localStorage.setItem('token', token)
        
        // Update state
        setUser(userData)
        setIsAuthenticated(true)
        
        return { success: true, data: userData }
      } else {
        return { 
          success: false, 
          message: data.message || 'เข้าสู่ระบบไม่สำเร็จ' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' 
      }
    }
  }

  const logout = async () => {
    try {
      // Clear token from storage
      localStorage.removeItem('token')
      
      // Reset state
      setUser(null)
      setIsAuthenticated(false)
      
      // Redirect to home page
      window.location.href = '/'
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, still clear local state
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
      window.location.href = '/'
      
      return { success: false, message: 'เกิดข้อผิดพลาดในการออกจากระบบ' }
    }
  }

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }))
  }

  const refreshAuth = async () => {
    await checkAuthStatus()
  }

  // Get authorization header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return isAuthenticated && user && user.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return isAuthenticated && user && roles.includes(user.role)
  }

  // Helper methods for common role checks
  const isAdmin = () => hasRole('admin')
  const isStaff = () => hasRole('staff')
  const canAccessAdmin = () => hasAnyRole(['admin', 'staff'])

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Methods
    login,
    logout,
    updateUser,
    refreshAuth,
    getAuthHeader,
    
    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    canAccessAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Higher-order component for components that need auth
export const withAuth = (Component) => {
  const WrappedComponent = (props) => {
    const auth = useAuth()
    return <Component {...props} auth={auth} />
  }
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for API requests with authentication
export const useAuthenticatedFetch = () => {
  const { getAuthHeader } = useAuth()
  
  const authenticatedFetch = async (url, options = {}) => {
    const authHeaders = getAuthHeader()
    
    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    }
    
    try {
      const response = await fetch(url, requestOptions)
      
      // Handle unauthorized responses
      if (response.status === 401) {
        // Token might be expired, try to refresh or logout
        localStorage.removeItem('token')
        window.location.href = '/login'
        return null
      }
      
      return response
    } catch (error) {
      console.error('Authenticated fetch error:', error)
      throw error
    }
  }
  
  return authenticatedFetch
}

// Auth status component for debugging (development only)
export const AuthDebugInfo = () => {
  const { user, isAuthenticated, loading } = useAuth()
  
  if (import.meta.env.PROD) return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-50">
      <div className="font-mono">
        <div><strong>Auth Status:</strong> {loading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
        {user && (
          <>
            <div><strong>User:</strong> {user.username}</div>
            <div><strong>Role:</strong> {user.role}</div>
            <div><strong>Email:</strong> {user.email}</div>
          </>
        )}
        <div><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
      </div>
    </div>
  )
}

export default AuthContext