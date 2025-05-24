import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Lock, AlertTriangle } from 'lucide-react'

const ProtectedRoute = ({ children, roles = [], requireAuth = true }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">กำลังตรวจสอบสิทธิ์...</p>
          <p className="text-sm text-gray-500 mt-1">กรุณารอสักครู่</p>
        </div>
      </div>
    )
  }

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required roles
  if (roles.length > 0 && (!user || !roles.includes(user.role))) {
    return <AccessDenied userRole={user?.role} requiredRoles={roles} />
  }

  // Render protected content
  return children
}

// Access Denied Component
const AccessDenied = ({ userRole, requiredRoles }) => {
  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: 'ผู้ดูแลระบบ',
      staff: 'เจ้าหน้าที่',
      user: 'ผู้ใช้ทั่วไป'
    }
    return roleLabels[role] || role
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
        <h2 className="text-lg text-gray-600 mb-6">Access Denied</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-800 mb-2">ข้อมูลสิทธิ์การเข้าถึง:</p>
              <div className="text-sm text-red-700 space-y-1">
                <p><strong>สิทธิ์ปัจจุบัน:</strong> {userRole ? getRoleLabel(userRole) : 'ไม่ระบุ'}</p>
                <p><strong>สิทธิ์ที่ต้องการ:</strong> {requiredRoles.map(getRoleLabel).join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-8">
          คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            กลับหน้าก่อนหน้า
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับหน้าแรก
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>ระบบรักษาความปลอดภัยด้วย Role-Based Access Control</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// HOC for protecting components
export const withAuth = (Component, options = {}) => {
  const WrappedComponent = (props) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for checking permissions
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth()
  
  const hasRole = (role) => {
    return isAuthenticated && user && user.role === role
  }
  
  const hasAnyRole = (roles) => {
    return isAuthenticated && user && roles.includes(user.role)
  }
  
  const isAdmin = () => hasRole('admin')
  const isStaff = () => hasRole('staff')
  const canAccessAdmin = () => hasAnyRole(['admin', 'staff'])
  
  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    canAccessAdmin,
    userRole: user?.role,
    isAuthenticated
  }
}

// Component for conditionally rendering content based on permissions
export const PermissionGuard = ({ 
  roles = [], 
  requireAuth = true, 
  fallback = null, 
  children 
}) => {
  const { user, isAuthenticated } = useAuth()
  
  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return fallback
  }
  
  // Check role requirements
  if (roles.length > 0 && (!user || !roles.includes(user.role))) {
    return fallback
  }
  
  return children
}

// Admin only wrapper
export const AdminOnly = ({ children, fallback = null }) => (
  <PermissionGuard roles={['admin']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

// Staff or Admin wrapper
export const StaffOrAdmin = ({ children, fallback = null }) => (
  <PermissionGuard roles={['admin', 'staff']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

export default ProtectedRoute