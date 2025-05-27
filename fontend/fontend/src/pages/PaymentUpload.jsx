import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  FileText, 
  CheckCircle,
  AlertCircle,
  CreditCard,
  Info
} from 'lucide-react'
import { alumniAPI } from '../services/api'
import { InlineSpinner } from '../components/LoadingSpinner'

const PaymentUpload = () => {
  const [loading, setLoading] = useState(false)
  const [paymentFile, setPaymentFile] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)')
        return
      }
      setPaymentFile(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const removeFile = () => {
    setPaymentFile(null)
  }

  const onSubmit = async (data) => {
    if (!paymentFile) {
      toast.error('กรุณาเลือกไฟล์หลักฐานการชำระเงิน')
      return
    }

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('idCard', data.idCard)
      formData.append('paymentDetails', data.paymentDetails || '')
      formData.append('paymentProof', paymentFile)

      const response = await alumniAPI.uploadPayment(formData)
      
      setUploadResult(response.data.data)
      setShowSuccess(true)
      toast.success('อัปโหลดหลักฐานการชำระเงินสำเร็จ!')
      
      // Reset form
      reset()
      setPaymentFile(null)
      
    } catch (error) {
      const message = error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess && uploadResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            อัปโหลดสำเร็จ!
          </h1>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">สถานะการอัปโหลด:</p>
            <p><strong>ชื่อ-นามสกุล:</strong> {uploadResult.firstName} {uploadResult.lastName}</p>
            <p><strong>สถานะใหม่:</strong> <span className="status-badge status-pending">รอตรวจสอบ</span></p>
            <p><strong>วันที่อัปโหลด:</strong> {new Date().toLocaleDateString('th-TH')}</p>
          </div>
          
          <div className="space-y-3">
            <Link to="/check-status" className="btn-primary w-full">
              ตรวจสอบสถานะ
            </Link>
            <button 
              onClick={() => setShowSuccess(false)}
              className="btn-secondary w-full"
            >
              อัปโหลดไฟล์อื่น
            </button>
            <Link to="/" className="block text-gray-500 hover:text-gray-700">
              กลับหน้าแรก
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับหน้าแรก
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              อัปโหลดหลักฐานการชำระเงิน
            </h1>
            <p className="text-gray-600">
              อัปโหลดสลิปการโอนเงินหรือหลักฐานการชำระเงิน
            </p>
          </div>
        </div>

        {/* Bank Information */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Info className="w-6 h-6 mr-2 text-blue-500" />
            ข้อมูลการโอนเงิน
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">ธนาคารกรุงไทย</h3>
              <div className="space-y-1 text-sm">
                <p><strong>เลขบัญชี:</strong> 123-4-56789-0</p>
                <p><strong>ชื่อบัญชี:</strong> ชมรมศิษย์เก่าวิทยาลัยเทคนิคอุดรธานี</p>
                <p><strong>ประเภทบัญชี:</strong> ออมทรัพย์</p>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">จำนวนเงิน</h3>
              <div className="space-y-1 text-sm">
                <p>ค่าสมาชิก: <strong>200 บาท</strong></p>
                <p>ค่าจัดส่ง: <strong>50 บาท</strong> (ถ้าเลือกจัดส่ง)</p>
                <p className="text-lg font-bold text-green-600 pt-2 border-t">
                  รวม: 200-250 บาท
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">หมายเหตุสำคัญ:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>กรุณาโอนตามจำนวนที่ระบุในการลงทะเบียน</li>
                  <li>เก็บหลักฐานการโอนเงินไว้เป็นหลักฐาน</li>
                  <li>หากโอนผิดจำนวน กรุณาติดต่อเจ้าหน้าที่</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ID Card Input */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">ข้อมูลผู้อัปโหลด</h2>
            
            <div>
              <label className="form-label">เลขบัตรประชาชน (13 หลัก) *</label>
              <input
                type="text"
                className="input-field"
                maxLength="13"
                placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                {...register('idCard', { 
                  required: 'กรุณากรอกเลขบัตรประชาชน',
                  pattern: {
                    value: /^\d{13}$/,
                    message: 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก'
                  }
                })}
              />
              {errors.idCard && (
                <p className="text-red-500 text-sm mt-1">{errors.idCard.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                ใช้เลขบัตรประชาชนเดียวกับที่ลงทะเบียน
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">รายละเอียดการชำระเงิน</h2>
            
            <div>
              <label className="form-label">รายละเอียดเพิ่มเติม</label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="เช่น วันที่โอน, เวลาที่โอน, จำนวนเงิน หรือข้อมูลเพิ่มเติม"
                {...register('paymentDetails')}
              />
              <p className="text-sm text-gray-500 mt-1">
                ระบุข้อมูลเพิ่มเติมเพื่อให้เจ้าหน้าที่ตรวจสอบได้ง่ายขึ้น (ไม่บังคับ)
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">อัปโหลดหลักฐานการชำระเงิน</h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive 
                  ? 'วางไฟล์ที่นี่...' 
                  : 'คลิกหรือลากไฟล์มาที่นี่'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                รองรับไฟล์ JPG, PNG, PDF (ไม่เกิน 5MB)
              </p>
              <div className="btn-secondary inline-flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                เลือกไฟล์
              </div>
            </div>
            
            {paymentFile && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{paymentFile.name}</p>
                      <p className="text-sm text-green-600">
                        {(paymentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">สลิปโอนเงิน</p>
                <p>หน้าจอธนาคาร</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">ใบเสร็จ</p>
                <p>จากธนาคาร</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">หลักฐานอื่นๆ</p>
                <p>ที่แสดงการชำระ</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading || !paymentFile}
              className="btn-primary text-lg px-12 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <InlineSpinner size="small" />
                  <span>กำลังอัปโหลด...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>อัปโหลดหลักฐาน</span>
                </div>
              )}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              เมื่ออัปโหลดแล้ว เจ้าหน้าที่จะตรวจสอบและอัปเดตสถานะภายใน 1-2 วันทำการ
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentUpload