import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Shield, 
  User,
  Lock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'
import { InlineSpinner } from '../components/LoadingSpinner'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasAdmin, setHasAdmin] = useState(null)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin')
    }
    checkAdminExists()
  }, [isAuthenticated, navigate])

  const checkAdminExists = async () => {
    try {
      const response = await authAPI.checkAdmin()
      setHasAdmin(response.data.hasAdmin)
    } catch (error) {
      console.error('Failed to check admin:', error)
      setHasAdmin(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    
    try {
      const result = await login(data)
      if (result.success) {
        toast.success('เข้าสู่ระบบสำเร็จ!')
        navigate('/admin')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  // Redirect to setup if no admin exists
  if (hasAdmin === false) {
    navigate('/setup-admin')
    return null
  }

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <InlineSpinner size="medium" />
          <span className="text-gray-600">กำลังตรวจสอบระบบ...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div>
          <Link to="/" className="inline-flex items-center text-white hover:text-blue-200 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับหน้าแรก
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">เข้าสู่ระบบ</h1>
            <p className="text-gray-600">สำหรับผู้ดูแลระบบและเจ้าหน้าที่</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="form-label">ชื่อผู้ใช้ *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="กรอกชื่อผู้ใช้"
                  {...register('username', { required: 'กรุณากรอกชื่อผู้ใช้' })}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">รหัสผ่าน *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="กรอกรหัสผ่าน"
                  {...register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <InlineSpinner size="small" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </div>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              สำหรับผู้ดูแลระบบและเจ้าหน้าที่เท่านั้น
            </p>
            <p className="text-xs text-gray-400 mt-2">
              หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-medium">ความปลอดภัย</span>
          </div>
          <p className="text-sm text-blue-100">
            การเข้าสู่ระบบนี้มีการเข้ารหัสและป้องกันอย่างเข้มงวด
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage