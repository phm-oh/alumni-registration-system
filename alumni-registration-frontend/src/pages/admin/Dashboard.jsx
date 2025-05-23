import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  UserCheck, 
  Clock, 
  CreditCard, 
  TrendingUp,
  Bell,
  Eye,
  Calendar,
  DollarSign,
  Award,
  AlertCircle
} from 'lucide-react'
import AdminLayout from '../../components/Layout/AdminLayout'
import { alumniAPI, notificationAPI } from '../../services/api'
import { InlineSpinner } from '../../components/LoadingSpinner'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [recentNotifications, setRecentNotifications] = useState([])
  const [recentAlumni, setRecentAlumni] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch statistics
      const [statsResponse, notificationsResponse, alumniResponse] = await Promise.all([
        alumniAPI.getStatistics(),
        notificationAPI.getAll(),
        alumniAPI.getAll({ limit: 5, sort: '-registrationDate' })
      ])

      setStats(statsResponse.data.data)
      setRecentNotifications(notificationsResponse.data.data.slice(0, 5))
      setRecentAlumni(alumniResponse.data.data)
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const baseClass = "status-badge"
    switch (status) {
      case 'อนุมัติแล้ว':
        return `${baseClass} status-approved`
      case 'รอตรวจสอบ':
        return `${baseClass} status-pending`
      case 'รอการชำระเงิน':
        return `${baseClass} status-waiting`
      case 'ยกเลิก':
        return `${baseClass} status-cancelled`
      default:
        return `${baseClass} status-pending`
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_registration':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'payment_uploaded':
        return <CreditCard className="w-4 h-4 text-green-500" />
      case 'status_updated':
        return <UserCheck className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <InlineSpinner size="medium" />
            <span className="text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">แดশบอร์ด</h1>
          <p className="text-gray-600 mt-2">ภาพรวมระบบลงทะเบียนศิษย์เก่า</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">สมาชิกทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalAlumni || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+{stats.newThisMonth || 0}</span>
              <span className="text-gray-500 ml-1">เดือนนี้</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">อนุมัติแล้ว</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">
                {stats.totalAlumni > 0 ? Math.round((stats.approvedCount / stats.totalAlumni) * 100) : 0}% ของทั้งหมด
              </span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">รอตรวจสอบ</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              {stats.pendingCount > 0 && (
                <Link to="/admin/alumni?status=รอตรวจสอบ" className="text-sm text-yellow-600 hover:text-yellow-800">
                  ดูรายการ →
                </Link>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">รายได้รวม</p>
                <p className="text-3xl font-bold text-purple-600">₿{stats.totalRevenue || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">
                เฉลี่ย {stats.totalAlumni > 0 ? Math.round(stats.totalRevenue / stats.totalAlumni) : 0} บาท/คน
              </span>
            </div>
          </div>
        </div>

        {/* Charts and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">สถิติตามสถานะ</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">อนุมัติแล้ว</span>
                </div>
                <span className="font-semibold text-green-600">{stats.approvedCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">รอตรวจสอบ</span>
                </div>
                <span className="font-semibold text-yellow-600">{stats.pendingCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">รอการชำระเงิน</span>
                </div>
                <span className="font-semibold text-blue-600">{stats.waitingPaymentCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">ยกเลิก</span>
                </div>
                <span className="font-semibold text-red-600">{stats.cancelledCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Top Departments */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">สถิติตามแผนก</h3>
            <div className="space-y-4">
              {stats.departmentStats?.slice(0, 5).map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-600 truncate">{dept.department}</span>
                  </div>
                  <span className="font-semibold text-blue-600">{dept.count}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">ไม่มีข้อมูล</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">การแจ้งเตือนล่าสุด</h3>
              <Link to="/admin/notifications" className="text-blue-600 hover:text-blue-800 text-sm">
                ดูทั้งหมด →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notification) => (
                  <div key={notification._id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">ไม่มีการแจ้งเตือน</p>
              )}
            </div>
          </div>

          {/* Recent Alumni */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">สมาชิกล่าสุด</h3>
              <Link to="/admin/alumni" className="text-blue-600 hover:text-blue-800 text-sm">
                ดูทั้งหมด →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentAlumni.length > 0 ? (
                recentAlumni.map((alumni) => (
                  <div key={alumni._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {alumni.firstName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {alumni.firstName} {alumni.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{alumni.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={getStatusBadge(alumni.status)}>
                        {alumni.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alumni.registrationDate).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">ไม่มีข้อมูลสมาชิก</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">การดำเนินการด่วน</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/alumni?status=รอตรวจสอบ" className="flex items-center space-x-3 p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-800">ตรวจสอบใบสมัคร</p>
                <p className="text-sm text-gray-500">{stats.pendingCount || 0} รายการรอตรวจสอบ</p>
              </div>
            </Link>
            
            <Link to="/admin/alumni" className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">จัดการสมาชิก</p>
                <p className="text-sm text-gray-500">ดู แก้ไข จัดการข้อมูล</p>
              </div>
            </Link>
            
            <Link to="/admin/notifications" className="flex items-center space-x-3 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
              <Bell className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-800">การแจ้งเตือน</p>
                <p className="text-sm text-gray-500">ดูการแจ้งเตือนทั้งหมด</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard