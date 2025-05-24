import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
    
    // TODO: Log error to monitoring service in production
    // logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              เกิดข้อผิดพลาด
            </h1>
            
            <p className="text-gray-600 mb-6">
              ขออภัยในความไม่สะดวก ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  รายละเอียดข้อผิดพลาด (เฉพาะ Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-red-600 font-mono overflow-auto max-h-32">
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </div>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                รีเฟรชหน้าเว็บ
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                กลับหน้าแรก
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              หากปัญหายังคงเกิดขึ้น กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Toast Configuration
const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#fff',
    color: '#374151',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    borderRadius: '0.75rem',
    padding: '12px 16px',
    fontFamily: 'Sarabun, Inter, system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
    style: {
      borderLeft: '4px solid #10b981',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
    style: {
      borderLeft: '4px solid #ef4444',
    },
  },
  loading: {
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#fff',
    },
    style: {
      borderLeft: '4px solid #3b82f6',
    },
  },
}

// Main App Render
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster
          toastOptions={toastOptions}
          containerStyle={{
            zIndex: 9999,
          }}
          containerClassName="toast-container"
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

// Hot Module Replacement (HMR) for development
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept()
}

// Service Worker Registration (Production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Performance Monitoring (Development)
if (import.meta.env.DEV) {
  // Log performance metrics
  window.addEventListener('load', () => {
  setTimeout(() => {
    const [navTiming] = performance.getEntriesByType('navigation')

    if (navTiming) {
      const networkLatency = navTiming.responseEnd - navTiming.fetchStart
      const pageLoadTime = navTiming.loadEventEnd - navTiming.startTime
      const domRenderTime = navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart

      console.group('🚀 Performance Metrics (from Navigation Timing API)')
      console.log(`📡 Network Latency: ${networkLatency.toFixed(2)}ms`)
      console.log(`⏱️ Page Load Time: ${pageLoadTime.toFixed(2)}ms`)
      console.log(`🏗️ DOM Render Time: ${domRenderTime.toFixed(2)}ms`)
      console.groupEnd()
    } else {
      console.warn('⛔ Navigation Timing API not supported or data unavailable')
    }
  }, 0)
})

}

// Global Error Handler
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error)
  
  // TODO: Send to error tracking service in production
  // if (import.meta.env.PROD) {
  //   sendErrorToService(event.error)
  // }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason)
  
  // TODO: Send to error tracking service in production
  // if (import.meta.env.PROD) {
  //   sendErrorToService(event.reason)
  // }
})

// Expose useful development tools
if (import.meta.env.DEV) {
  window.__DEV__ = {
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE,
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5500',
    buildDate: new Date().toISOString(),
  }
  
  console.log('🎓 Alumni Registration System - Development Mode')
  console.log('📋 Dev Tools:', window.__DEV__)
}