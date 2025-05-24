import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bell, 
  Users, 
  CreditCard, 
  UserCheck, 
  AlertCircle,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Filter
} from 'lucide-react'
import AdminLayout from '../../components/Layout/AdminLayout'
import { notificationAPI } from '../../services/api'
import { InlineSpinner } from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Notifications = () => {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)

  const filterOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'unread', label: 'ยังไม่อ่าน' },
    { value: 'new_registration', label: 'ลงทะเบียนใหม่' },
    { value: 'payment_uploaded', label: 'อัปโหลดการชำระ' },
    { value: 'status_updated', label: 'อัปเดตสถานะ' },
    { value: 'system', label: 'ระบบ' }
  ]

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationAPI.getAll()
      setNotifications(response.data.data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      setUnreadCount(response.data.count)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id)
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      )
      await fetchUnreadCount()
      toast.success('ทำเครื่องหมายอ่านแล้ว')
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      setUnreadCount(0)
      toast.success('ทำเครื่องหมายอ่านทั้งหมดแล้ว')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const deleteNotification = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบการแจ้งเตือนนี้?')) return
    
    try {
      await notificationAPI.delete(id)
      setNotifications(prev => prev.filter(notif => notif._id !== id))
      toast.success('ลบการแจ้งเตือนสำเร็จ')
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const getNotificationIcon = (type) => {
    const iconClass = "w-8 h-8 p-1.5 rounded-full"
    switch (type) {
      case 'new_registration':
        return (
          <div className={`${iconClass} bg-blue-100`}>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        )
      case 'payment_uploaded':
        return (
          <div className={`${iconClass} bg-green-100`}>
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
        )
      case 'status_updated':
        return (
          <div className={`${iconClass} bg-purple-100`}>
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
        )
      case 'system':
        return (
          <div className={`${iconClass} bg-orange-100`}>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
        )
      default:
        return (
          <div className={`${iconClass} bg-gray-100`}>
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
        )
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50'
      case 'high':
        return 'border-l-orange-500 bg-orange-50'
      case 'normal':
        return 'border-l-blue-500 bg-blue-50'
      case 'low':
        return 'border-l-gray-500 bg-gray-50'
      default:
        return 'border-l-gray-300 bg-white'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    return notification.type === filter
  })

  const getTypeLabel = (type) => {
    const option = filterOptions.find(opt => opt.value === type)
    return option ? option.label : type
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">การแจ้งเตือน</h1>
            <p className="text-gray-600 mt-2">
              จัดการการแจ้งเตือนของระบบ
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                  {unreadCount} ยังไม่อ่าน
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={fetchNotifications}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีเฟรช</span>
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>อ่านทั้งหมด</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="card p-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  {option.value === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <InlineSpinner size="medium" />
                <span className="text-gray-600">กำลังโหลดการแจ้งเตือน...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  รายการแจ้งเตือน ({filteredNotifications.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${
                        !notification.isRead ? 'bg-blue-50/50' : 'bg-white'
                      } ${getPriorityColor(notification.priority)}`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              
                              <p className={`text-sm mb-2 ${
                                !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                              }`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded-full">
                                  {getTypeLabel(notification.type)}
                                </span>
                                <span>
                                  {new Date(notification.createdAt).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {notification.priority !== 'normal' && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {notification.priority === 'urgent' ? 'ด่วนมาก' :
                                     notification.priority === 'high' ? 'ด่วน' :
                                     notification.priority === 'low' ? 'ไม่ด่วน' : 'ปกติ'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                  title="ทำเครื่องหมายอ่านแล้ว"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                                title="ลบการแจ้งเตือน"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Link to related content */}
                              {notification.relatedId && notification.type === 'new_registration' && (
                                <Link
                                  to={`/admin/alumni/${notification.relatedId}`}
                                  className="text-purple-600 hover:text-purple-800 text-xs bg-purple-50 px-2 py-1 rounded-full"
                                >
                                  ดูรายละเอียด
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {filter === 'all' ? 'ไม่มีการแจ้งเตือน' : `ไม่มีการแจ้งเตือน${getTypeLabel(filter)}`}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      การแจ้งเตือนจะปรากฏที่นี่เมื่อมีกิจกรรมในระบบ
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Statistics Cards */}
        {notifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ยังไม่อ่าน</p>
                  <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ลงทะเบียนใหม่</p>
                  <p className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => n.type === 'new_registration').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">การชำระเงิน</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {notifications.filter(n => n.type === 'payment_uploaded').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default Notifications