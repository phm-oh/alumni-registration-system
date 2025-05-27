import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import LandingPage from './pages/LandingPage'
import AlumniRegistration from './pages/AlumniRegistration'
import StatusCheck from './pages/StatusCheck'
import PaymentUpload from './pages/PaymentUpload'
import LoginPage from './pages/LoginPage'
import AdminSetup from './pages/AdminSetup'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import AlumniManagement from './pages/admin/AlumniManagement'
import AlumniDetail from './pages/admin/AlumniDetail'
import Notifications from './pages/admin/Notifications'
import UserManagement from './pages/admin/UserManagement'

// Loading Component
import LoadingSpinner from './components/LoadingSpinner'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<AlumniRegistration />} />
        <Route path="/check-status" element={<StatusCheck />} />
        <Route path="/upload-payment" element={<PaymentUpload />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup-admin" element={<AdminSetup />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/alumni" element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <AlumniManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/alumni/:id" element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <AlumniDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/notifications" element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <Notifications />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />

        {/* 404 Page */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔍</span>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                ไม่พบหน้าที่ต้องการ
              </h1>
              
              <p className="text-gray-600 mb-8">
                ขออภัย หน้าที่คุณกำลังค้นหาไม่มีอยู่ในระบบ
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
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App