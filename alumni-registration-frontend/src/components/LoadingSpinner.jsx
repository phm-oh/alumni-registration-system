import React from 'react'
import { Loader2 } from 'lucide-react'

// Main Loading Spinner
const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
          <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        </div>
        <p className="text-gray-600 font-medium">กำลังโหลดหน้าเว็บ...</p>
        <p className="text-sm text-gray-500 mt-1">กรุณารอสักครู่</p>
      </div>
    </div>
  )
}

// Inline Spinner (for buttons, etc.)
export const InlineSpinner = ({ size = 'medium', color = 'current', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  const colorClasses = {
    current: 'text-current',
    white: 'text-white',
    blue: 'text-blue-600',
    gray: 'text-gray-500'
  }

  return (
    <Loader2 
      className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin ${className}`} 
    />
  )
}

// Page Loading Overlay
export const PageLoadingOverlay = ({ message = 'กำลังโหลด...', show = true }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <InlineSpinner size="large" color="blue" />
        </div>
        <p className="text-gray-700 font-medium text-lg">{message}</p>
        <p className="text-sm text-gray-500 mt-2">กรุณารอสักครู่</p>
      </div>
    </div>
  )
}

// Skeleton Loading Components
export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Form Loading
export const FormLoadingOverlay = ({ show = true, message = 'กำลังบันทึกข้อมูล...' }) => {
  if (!show) return null

  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
      <div className="text-center">
        <InlineSpinner size="large" color="blue" className="mb-3" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Button Loading State
export const LoadingButton = ({ 
  loading = false, 
  children, 
  loadingText = 'กำลังโหลด...', 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`${className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <InlineSpinner size="small" color="current" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// Spinner with Custom Message
export const CustomSpinner = ({ 
  message = 'กำลังโหลด...', 
  submessage = '', 
  size = 'medium',
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        <InlineSpinner size={size} color="blue" />
        {size === 'large' && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-100 animate-ping"></div>
        )}
      </div>
      
      {message && (
        <div className="text-center">
          <p className="text-gray-700 font-medium">{message}</p>
          {submessage && (
            <p className="text-sm text-gray-500 mt-1">{submessage}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Data Loading States
export const DataLoadingState = ({ type = 'card' }) => {
  switch (type) {
    case 'table':
      return <SkeletonTable />
    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
    case 'list':
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>   
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    default:
      return <CustomSpinner />
  }
}

export default LoadingSpinner