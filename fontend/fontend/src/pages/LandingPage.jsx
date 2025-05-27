import React from 'react'
import { Link } from 'react-router-dom'
import { 
  GraduationCap, 
  Users, 
  FileText, 
  CreditCard, 
  Search,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-blue-800">
      {/* Hero Section */}
      <div className="container-custom section-padding">
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-gentle">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-shadow-lg">
            ระบบลงทะเบียนศิษย์เก่า
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-4 font-medium">
            วิทยาลัยอาชีวศึกษาอุดรธานี
          </p>
          
          <p className="text-lg text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            เข้าร่วมชมรมศิษย์เก่า เชื่อมต่อเครือข่าย และร่วมพัฒนาสถาบันของเราไปด้วยกัน
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/register" 
              className="btn-primary btn-lg hover-scale flex items-center space-x-2 shadow-2xl"
            >
              <Users className="w-5 h-5" />
              <span>ลงทะเบียนเป็นสมาชิก</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link 
              to="/check-status" 
              className="btn bg-white bg-opacity-20 backdrop-blur-md text-white border-2 border-white border-opacity-30 hover:bg-opacity-30 btn-lg hover-scale flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>ตรวจสอบสถานะ</span>
            </Link>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">ลงทะเบียนออนไลน์</h3>
            <p className="text-blue-100 leading-relaxed">
              กรอกข้อมูลและลงทะเบียนเป็นสมาชิกชมรมศิษย์เก่าได้ง่ายๆ ผ่านระบบออนไลน์
            </p>
          </div>
          
          <div className="glass rounded-2xl p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">ชำระเงินสะดวก</h3>
            <p className="text-blue-100 leading-relaxed">
              อัปโหลดหลักฐานการชำระเงินและติดตามสถานะการอนุมัติได้แบบเรียลไทม์
            </p>
          </div>
          
          <div className="glass rounded-2xl p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">เครือข่ายศิษย์เก่า</h3>
            <p className="text-blue-100 leading-relaxed">
              เชื่อมต่อกับเครือข่ายศิษย์เก่า แลกเปลี่ยนประสบการณ์ และร่วมพัฒนาสถาบัน
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="glass mx-8 rounded-3xl p-12 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">ความสำเร็จของเรา</h2>
            <p className="text-blue-100 text-lg">ตัวเลขที่สะท้อนความเข้มแข็งของเครือข่ายศิษย์เก่า</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-200">สมาชิกศิษย์เก่า</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-200">สาขาวิชา</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">25+</div>
              <div className="text-blue-200">ปีที่จัดตั้ง</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-200">ความพึงพอใจ</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="container-custom pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">เริ่มต้นใช้งาน</h2>
          <p className="text-blue-100 text-lg">เลือกบริการที่คุณต้องการ</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Link 
            to="/register"
            className="glass rounded-xl p-6 text-center hover-lift transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">ลงทะเบียน</h3>
            <p className="text-blue-200 text-sm">สมัครสมาชิกใหม่</p>
          </Link>
          
          <Link 
            to="/check-status"
            className="glass rounded-xl p-6 text-center hover-lift transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">ตรวจสอบสถานะ</h3>
            <p className="text-blue-200 text-sm">ดูสถานะการสมัคร</p>
          </Link>
          
          <Link 
            to="/upload-payment"
            className="glass rounded-xl p-6 text-center hover-lift transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">อัปโหลดหลักฐาน</h3>
            <p className="text-blue-200 text-sm">ส่งสลิปการโอนเงิน</p>
          </Link>
          
          <Link 
            to="/login"
            className="glass rounded-xl p-6 text-center hover-lift transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">เจ้าหน้าที่</h3>
            <p className="text-blue-200 text-sm">เข้าสู่ระบบจัดการ</p>
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <div className="glass mx-8 rounded-t-3xl p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">วิทยาลัยอาชีวศึกษาอุดรธานี</span>
          </div>
          
          <p className="text-blue-200 mb-6">
            สร้างอนาคตด้วยการศึกษา เชื่อมต่อด้วยเครือข่ายศิษย์เก่า
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
            <a href="#" className="hover:text-white transition-colors">เกี่ยวกับเรา</a>
            <a href="#" className="hover:text-white transition-colors">ติดต่อเรา</a>
            <a href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a>
            <a href="#" className="hover:text-white transition-colors">เงื่อนไขการใช้งาน</a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white border-opacity-20">
            <p className="text-blue-300 text-sm">
              © 2024 วิทยาลัยอาชีวศึกษาอุดรธานี. สงวนลิขสิทธิ์ทุกประการ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage