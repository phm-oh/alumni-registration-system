import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  Edit, 
  RotateCcw,
  Crown,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard,
  FileImage,
  History,
  X,
  Check,
  AlertTriangle
} from 'lucide-react'
import AdminLayout from '../../components/Layout/AdminLayout'
import { alumniAPI } from '../../services/api'
import { InlineSpinner } from '../../components/LoadingSpinner'

const AlumniDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [alumni, setAlumni] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showPositionModal, setShowPositionModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  const { register: registerStatus, handleSubmit: handleStatusSubmit, reset: resetStatus } = useForm()
  const { register: registerPosition, handleSubmit: handlePositionSubmit, reset: resetPosition } = useForm()

  const statusOptions = [
    { value: 'รอตรวจสอบ', label: 'รอตรวจสอบ', color: 'yellow' },
    { value: 'อนุมัติแล้ว', label: 'อนุมัติแล้ว', color: 'green' },
    { value: 'รอการชำระเงิน', label: 'รอการชำระเงิน', color: 'blue' },
    { value: 'ยกเลิก', label: 'ยกเลิก', color: 'red' }
  ]

  const positionOptions = [
    'สมาชิกสามัญ',
    'ประธานชมรมศิษย์เก่า',
    'รองประธาน',
    'การเงิน',
    'ทะเบียน',
    'ประชาสัมพันธ์'
  ]

  useEffect(() => {
    fetchAlumniDetail()
  }, [id])

  const fetchAlumniDetail = async () => {
    try {
      setLoading(true)
      const response = await alumniAPI.getById(id)
      setAlumni(response.data.data)
    } catch (error) {
      console.error('Failed to fetch alumni detail:', error)
      toast.error('ไม่พบข้อมูลสมาชิก')
      navigate('/admin/alumni')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (data) => {
    try {
      setUpdating(true)
      await alumniAPI.updateStatus(id, data)
      await fetchAlumniDetail()
      setShowStatusModal(false)
      resetStatus()
      toast.success('อัปเดตสถานะสำเร็จ')
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
    } finally {
      setUpdating(false)
    }
  }

  const handlePositionUpdate = async (data) => {
    try {
      setUpdating(true)
      await alumniAPI.updatePosition(id, data)
      await fetchAlumniDetail()
      setShowPositionModal(false)
      resetPosition()
      toast.success('อัปเดตตำแหน่งสำเร็จ')
    } catch (error) {
      console.error('Failed to update position:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดตตำแหน่ง')
    } finally {
      setUpdating(false)
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

  const getPositionBadge = (position) => {
    if (position === 'สมาชิกสามัญ') {
      return 'bg-gray-100 text-gray-800'
    }
    return 'bg-purple-100 text-purple-800'
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

  if (!alumni) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">ไม่พบข้อมูลสมาชิก</p>
          <Link to="/admin/alumni" className="btn-primary mt-4">
            กลับไปรายการสมาชิก
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/alumni"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              กลับไปรายการสมาชิก
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>เปลี่ยนสถานะ</span>
            </button>
            
            <button
              onClick={() => setShowPositionModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span>เปลี่ยนตำแหน่ง</span>
            </button>
          </div>
        </div>

        {/* Alumni Profile Card */}
        <div className="card p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Profile Picture Placeholder */}
            <div className="flex-shrink-0 mb-6 lg:mb-0">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {alumni.firstName.charAt(0)}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {alumni.firstName} {alumni.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={getStatusBadge(alumni.status)}>
                    {alumni.status}
                  </span>
                  <span className={`status-badge ${getPositionBadge(alumni.position)}`}>
                    {alumni.position}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{alumni.idCard}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{alumni.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{alumni.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>จบปี {alumni.graduationYear}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              ข้อมูลส่วนตัว
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ที่อยู่</label>
                <p className="text-gray-800">{alumni.address}</p>
              </div>
              {alumni.currentJob && (
                <div>
                  <label className="text-sm font-medium text-gray-600">อาชีพปัจจุบัน</label>
                  <p className="text-gray-800">{alumni.currentJob}</p>
                </div>
              )}
              {alumni.workplace && (
                <div>
                  <label className="text-sm font-medium text-gray-600">สถานที่ทำงาน</label>
                  <p className="text-gray-800">{alumni.workplace}</p>
                </div>
              )}
              {alumni.facebookId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Facebook</label>
                  <p className="text-gray-800">{alumni.facebookId}</p>
                </div>
              )}
              {alumni.lineId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Line ID</label>
                  <p className="text-gray-800">{alumni.lineId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Education Information */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-green-500" />
              ข้อมูลการศึกษา
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">แผนก/สาขา</label>
                <p className="text-gray-800 font-medium">{alumni.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">ปีที่จบการศึกษา</label>
                <p className="text-gray-800 font-medium">{alumni.graduationYear}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">วันที่ลงทะเบียน</label>
                <p className="text-gray-800">
                  {new Date(alumni.registrationDate).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-purple-500" />
            ข้อมูลการชำระเงิน
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">วิธีการชำระ</label>
                <p className="text-gray-800">{alumni.paymentMethod}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">วิธีการรับสมุด</label>
                <p className="text-gray-800">{alumni.deliveryOption}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ค่าสมาชิก</label>
                <p className="text-gray-800">{alumni.amount} บาท</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">ค่าจัดส่ง</label>
                <p className="text-gray-800">{alumni.shippingFee} บาท</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">รวมทั้งสิ้น</label>
                <p className="text-2xl font-bold text-green-600">{alumni.totalAmount} บาท</p>
              </div>
              {alumni.paymentDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">วันที่ชำระ</label>
                  <p className="text-gray-800">
                    {new Date(alumni.paymentDate).toLocaleDateString('th-TH')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {alumni.paymentDetails && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-600">รายละเอียดการชำระ</label>
              <p className="text-gray-800 mt-1">{alumni.paymentDetails}</p>
            </div>
          )}

          {alumni.paymentProofUrl && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-600 mb-2 block">หลักฐานการชำระเงิน</label>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileImage className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">หลักฐานการชำระเงิน</p>
                    <a 
                      href={alumni.paymentProofUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ดูไฟล์ →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {(alumni.statusHistory?.length > 0 || alumni.positionHistory?.length > 0) && (
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <History className="w-5 h-5 mr-2 text-gray-500" />
              ประวัติการเปลี่ยนแปลง
            </h3>
            
            <div className="space-y-6">
              {alumni.statusHistory?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">ประวัติการเปลี่ยนสถานะ</h4>
                  <div className="space-y-3">
                    {alumni.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={getStatusBadge(history.status)}>
                              {history.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(history.updatedAt).toLocaleDateString('th-TH')}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-600">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alumni.positionHistory?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">ประวัติการเปลี่ยนตำแหน่ง</h4>
                  <div className="space-y-3">
                    {alumni.positionHistory.map((history, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`status-badge ${getPositionBadge(history.position)}`}>
                              {history.position}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(history.updatedAt).toLocaleDateString('th-TH')}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-600">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">เปลี่ยนสถานะ</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleStatusSubmit(handleStatusUpdate)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">สถานะปัจจุบัน</label>
                  <span className={`${getStatusBadge(alumni.status)} ml-2`}>
                    {alumni.status}
                  </span>
                </div>
                
                <div>
                  <label className="form-label">สถานะใหม่ *</label>
                  <select
                    className="input-field"
                    {...registerStatus('status', { required: 'กรุณาเลือกสถานะ' })}
                  >
                    <option value="">เลือกสถานะ</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">หมายเหตุ</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                    {...registerStatus('notes')}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary disabled:opacity-50"
                >
                  {updating ? (
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

      {/* Position Update Modal */}
      {showPositionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">เปลี่ยนตำแหน่ง</h3>
              <button
                onClick={() => setShowPositionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePositionSubmit(handlePositionUpdate)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">ตำแหน่งปัจจุบัน</label>
                  <span className={`status-badge ${getPositionBadge(alumni.position)} ml-2`}>
                    {alumni.position}
                  </span>
                </div>
                
                <div>
                  <label className="form-label">ตำแหน่งใหม่ *</label>
                  <select
                    className="input-field"
                    {...registerPosition('position', { required: 'กรุณาเลือกตำแหน่ง' })}
                  >
                    <option value="">เลือกตำแหน่ง</option>
                    {positionOptions.map(position => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">ข้อจำกัดตำแหน่ง:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>ประธานชมรมศิษย์เก่า: 1 คนเท่านั้น</li>
                        <li>รองประธาน: สูงสุด 4 คน</li>
                        <li>การเงิน, ทะเบียน: 1 คนเท่านั้น</li>
                        <li>ประชาสัมพันธ์: 1 คนเท่านั้น</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">หมายเหตุ</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                    {...registerPosition('notes')}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPositionModal(false)}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary disabled:opacity-50"
                >
                  {updating ? (
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

export default AlumniDetail