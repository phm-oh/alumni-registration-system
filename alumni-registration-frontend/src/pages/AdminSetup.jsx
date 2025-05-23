import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  UserCog, 
  User,
  Lock,
  Mail,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { authAPI } from '../services/api'
import { InlineSpinner } from '../components/LoadingSpinner'

const AdminSetup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasAdmin, setHasAdmin] = useState(null)
  const [setupComplete, setSetupComplete] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  useEffect(() => {
    checkAdminExists()
  }, [])

  const checkAdminExists = async () => {
    try {
      const response = await authAPI.checkAdmin()
      setHasAdmin(response.data.hasAdmin)
      
      // If admin already exists, redirect to login
      if (response.data.hasAdmin) {
        navigate('/login')
      }
    } catch (error) {
      console.error('Failed to check admin:', error)
      setHasAdmin(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    
    try {
      const setupData = {
        username: data.username,
        email: data.email,
        password: data.password
      }

      await authAPI.setupAdmin(setupData)
      
      setSetupComplete(true)
      toast.success('สร้างบัญชี Admin สำเร็จ!')
      
    } catch (error) {
      const message = error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking admin status
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

  // If setup is complete, show success page
  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ตั้งค่าเสร็จสิ้น!
          </h1>
          
          <p className="text-gray-600 mb-8">
            สร้างบัญชีผู้ดูแลระบบสำเร็จ ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว
          </p>
          
          <div className="space-y-3">
            <Link to="/login" className="btn-primary w-full">
              เข้าสู่ระบบ
            </Link>
            <Link to="/" className="block text-gray-500 hover:text-gray-700">
              กลับหน้าแรก
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8">
        {/* Back Button */}
        <div>
          <Link to="/" className="inline-flex items-center text-white hover:text-purple-200 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับหน้าแรก
          </Link>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCog className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ตั้งค่าระบบ</h1>
            <p className="text-gray-600">สร้างบัญชีผู้ดูแลระบบคนแรก</p>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">ข้อมูลสำคัญ:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>บัญชีนี้จะมีสิทธิ์ผู้ดูแลระบบเต็มรูปแบบ</li>
                  <li>สามารถสร้างและจัดการบัญชีผู้ใช้อื่นได้</li>
                  <li>กรุณาเก็บข้อมูลการเข้าสู่ระบบไว้อย่างปลอดภัย</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Setup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="form-label">ชื่อผู้ใช้ *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="กรอกชื่อผู้ใช้ (ภาษาอังกฤษ)"
                  {...register('username', { 
                    required: 'กรุณากรอกชื่อผู้ใช้',
                    minLength: {
                      value: 3,
                      message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _'
                    }
                  })}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">อีเมล *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="กรอกอีเมลของคุณ"
                  {...register('email', { 
                    required: 'กรุณากรอกอีเมล',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'รูปแบบอีเมลไม่ถูกต้อง'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                  {...register('password', { 
                    required: 'กรุณากรอกรหัสผ่าน',
                    minLength: {
                      value: 8,
                      message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'รหัสผ่านต้องมีตัวอักษรใหญ่ เล็ก และตัวเลข'
                    }
                  })}
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

            <div>
              <label className="form-label">ยืนยันรหัสผ่าน *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  {...register('confirmPassword', { 
                    required: 'กรุณายืนยันรหัสผ่าน',
                    validate: value => value === password || 'รหัสผ่านไม่ตรงกัน'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">ข้อกำหนดรหัสผ่าน:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${password && password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>อย่างน้อย 8 ตัวอักษร</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${password && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>มีตัวอักษรพิมพ์เล็ก</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${password && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>มีตัวอักษรพิมพ์ใหญ่</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${password && /\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>มีตัวเลข</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <InlineSpinner size="small" />
                  <span>กำลังสร้างบัญชี...</span>
                </div>
              ) : (
                'สร้างบัญชีผู้ดูแลระบบ'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              การสร้างบัญชีนี้จะมีผลเพียงครั้งเดียว
            </p>
            <p className="text-xs text-gray-400 mt-2">
              หลังจากสร้างแล้วจะไม่สามารถเข้าหน้านี้ได้อีก
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSetup