import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  User,
  Eye,
  EyeOff,
  X,
  Crown,
  Settings,
  RefreshCw
} from 'lucide-react'
import AdminLayout from '../../components/Layout/AdminLayout'
import { authAPI } from '../../services/api'
import { InlineSpinner } from '../../components/LoadingSpinner'

const UserManagement = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [processing, setProcessing] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm()
  const { register: registerEdit, handleSubmit: handleEditSubmit, formState: { errors: editErrors }, reset: resetEdit, setValue } = useForm()

  const password = watch('password')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getUsers()
      setUsers(response.data.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้')
    } finally {
      setLoading(false)
    }
  }

  const onAddUser = async (data) => {
    try {
      setProcessing(true)
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role
      }

      await authAPI.setupAdmin(userData) // Use setupAdmin endpoint for creating users
      await fetchUsers()
      setShowAddModal(false)
      reset()
      toast.success('เพิ่มผู้ใช้สำเร็จ')
    } catch (error) {
      console.error('Failed to add user:', error)
      const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้'
      toast.error(message)
    } finally {
      setProcessing(false)
    }
  }

  const onEditUser = async (data) => {
    try {
      setProcessing(true)
      await authAPI.updateUser(editingUser._id, data)
      await fetchUsers()
      setShowEditModal(false)
      setEditingUser(null)
      resetEdit()
      toast.success('อัปเดตผู้ใช้สำเร็จ')
    } catch (error) {
      console.error('Failed to update user:', error)
      const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้'
      toast.error(message)
    } finally {
      setProcessing(false)
    }
  }

  const deleteUser = async (userId, username) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${username}"?`)) return
    
    try {
      await authAPI.deleteUser(userId)
      await fetchUsers()
      toast.success('ลบผู้ใช้สำเร็จ')
    } catch (error) {
      console.error('Failed to delete user:', error)
      const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้'
      toast.error(message)
    }
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setValue('username', user.username)
    setValue('email', user.email)
    setValue('role', user.role)
    setShowEditModal(true)
  }

  const getRoleIcon = (role) => {
    if (role === 'admin') {
      return <Crown className="w-4 h-4 text-yellow-600" />
    }
    return <User className="w-4 h-4 text-blue-600" />
  }

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-blue-100 text-blue-800'
  }

  const getRoleLabel = (role) => {
    return role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">จัดการผู้ใช้</h1>
            <p className="text-gray-600 mt-2">
              จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึงระบบ
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={fetchUsers}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีเฟรช</span>
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>เพิ่มผู้ใช้</span>
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <InlineSpinner size="medium" />
                <span className="text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  รายการผู้ใช้ ({users.length} คน)
                </h3>
              </div>

              <div className="overflow-x-auto">
                {users.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ผู้ใช้
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          บทบาท
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่สร้าง
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          อัปเดตล่าสุด
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-gray-800">{user.username}</p>
                                  {getRoleIcon(user.role)}
                                </div>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`status-badge ${getRoleBadge(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.updatedAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => openEditModal(user)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                title="แก้ไขผู้ใช้"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteUser(user._id, user.username)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                                title="ลบผู้ใช้"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ไม่มีผู้ใช้ในระบบ</p>
                    <p className="text-gray-400 text-sm mt-2">เพิ่มผู้ใช้คนแรกเพื่อเริ่มต้นใช้งาน</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ผู้ดูแลระบบ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">เจ้าหน้าที่</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role === 'staff').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">เพิ่มผู้ใช้ใหม่</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  reset()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onAddUser)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">ชื่อผู้ใช้ *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="กรอกชื่อผู้ใช้"
                    {...register('username', { 
                      required: 'กรุณากรอกชื่อผู้ใช้',
                      minLength: {
                        value: 3,
                        message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
                      }
                    })}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">อีเมล *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="กรอกอีเมล"
                    {...register('email', { 
                      required: 'กรุณากรอกอีเมล',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'รูปแบบอีเมลไม่ถูกต้อง'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">รหัสผ่าน *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="กรอกรหัสผ่าน"
                      {...register('password', { 
                        required: 'กรุณากรอกรหัสผ่าน',
                        minLength: {
                          value: 8,
                          message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
                        }
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">บทบาท *</label>
                  <select
                    className="input-field"
                    {...register('role', { required: 'กรุณาเลือกบทบาท' })}
                  >
                    <option value="">เลือกบทบาท</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                    <option value="staff">เจ้าหน้าที่</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
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
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    reset()
                  }}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary disabled:opacity-50"
                >
                  {processing ? (
                    <div className="flex items-center space-x-2">
                      <InlineSpinner size="small" />
                      <span>กำลังเพิ่ม...</span>
                    </div>
                  ) : (
                    'เพิ่มผู้ใช้'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">แก้ไขผู้ใช้</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                  resetEdit()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit(onEditUser)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">ชื่อผู้ใช้ *</label>
                  <input
                    type="text"
                    className="input-field"
                    {...registerEdit('username', { 
                      required: 'กรุณากรอกชื่อผู้ใช้',
                      minLength: {
                        value: 3,
                        message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
                      }
                    })}
                  />
                  {editErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">อีเมล *</label>
                  <input
                    type="email"
                    className="input-field"
                    {...registerEdit('email', { 
                      required: 'กรุณากรอกอีเมล',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'รูปแบบอีเมลไม่ถูกต้อง'
                      }
                    })}
                  />
                  {editErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">บทบาท *</label>
                  <select
                    className="input-field"
                    {...registerEdit('role', { required: 'กรุณาเลือกบทบาท' })}
                  >
                    <option value="admin">ผู้ดูแลระบบ</option>
                    <option value="staff">เจ้าหน้าที่</option>
                  </select>
                  {editErrors.role && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.role.message}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>หมายเหตุ:</strong> การแก้ไขจะไม่เปลี่ยนรหัสผ่าน หากต้องการเปลี่ยนรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                    resetEdit()
                  }}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary disabled:opacity-50"
                >
                  {processing ? (
                    <div className="flex items-center space-x-2">
                      <InlineSpinner size="small" />
                      <span>กำลังบันทึก...</span>
                    </div>
                  ) : (
                    'บันทึก'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default UserManagement