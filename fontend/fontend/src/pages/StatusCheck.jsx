// ======================
// src/pages/StatusCheck.jsx  
// ======================
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'

const StatusCheck = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          กลับหน้าแรก
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            ตรวจสอบสถานะ
          </h1>
          
          <p className="text-gray-600 mb-8">
            หน้านี้อยู่ระหว่างการพัฒนา
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              🚧 <strong>Coming Soon:</strong> ระบบตรวจสอบสถานะการสมัครสมาชิก
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusCheck