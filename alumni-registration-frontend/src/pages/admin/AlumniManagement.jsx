import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MoreVertical,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react'
import AdminLayout from '../../components/Layout/AdminLayout'
import { alumniAPI } from '../../services/api'
import { InlineSpinner } from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AlumniManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [alumni, setAlumni] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [departments, setDepartments] = useState([])
  const [graduationYears, setGraduationYears] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    department: searchParams.get('department') || '',
    graduationYear: searchParams.get('graduationYear') || '',
    position: searchParams.get('position') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 10
  })

  const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'รอตรวจสอบ', label: 'รอตรวจสอบ' },
    { value: 'อนุมัติแล้ว', label: 'อนุมัติแล้ว' },
    { value: 'รอการชำระเงิน', label: 'รอการชำระเงิน' },
    { value: 'ยกเลิก', label: 'ยกเลิก' }
  ]

  const positionOptions = [
    { value: '', label: 'ทุกตำแหน่ง' },
    { value: 'สมาชิกสามัญ', label: 'สมาชิกสามัญ' },
    { value: 'ประธานชมรมศิษย์เก่า', label: 'ประธานชมรมศิษย์เก่า' },
    { value: 'รองประธาน', label: 'รองประธาน' },
    { value: 'การเงิน', label: 'การเงิน' },
    { value: 'ทะเบียน', label: 'ทะเบียน' },
    { value: 'ประชาสัมพันธ์', label: 'ประชาสัมพันธ์' }
  ]

  const limitOptions = [
    { value: 10, label: '10 รายการ' },
    { value: 25, label: '25 รายการ' },
    { value: 50, label: '50 รายการ' },
    { value: 100, label: '100 รายการ' }
  ]

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    updateSearchParams()
    fetchAlumni()
  }, [filters])

  const fetchInitialData = async () => {
    try {
      const [deptResponse, yearResponse] = await Promise.all([
        alumniAPI.getDepartments(),
        alumniAPI.getGraduationYears()
      ])
      
      setDepartments(deptResponse.data.data)
      setGraduationYears(yearResponse.data.data)
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.department && { department: filters.department }),
        ...(filters.graduationYear && { graduationYear: filters.graduationYear }),
        ...(filters.position && { position: filters.position })
      }

      const response = await alumniAPI.getAll(params)
      
      setAlumni(response.data.data)
      setTotalPages(response.data.totalPages)
      setTotalCount(response.data.total)
      
    } catch (error) {
      console.error('Failed to fetch alumni:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const updateSearchParams = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'page' && key !== 'limit') {
        params.set(key, value)
      }
    })
    
    if (filters.page > 1) params.set('page', filters.page)
    if (filters.limit !== 10) params.set('limit', filters.limit)
    
    setSearchParams(params)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }))
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      department: '',
      graduationYear: '',
      position: '',
      page: 1,
      limit: 10
    })
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">จัดการศิษย์เก่า</h1>
            <p className="text-gray-600 mt-2">
              รายการสมาชิกทั้งหมด {totalCount > 0 && `(${totalCount} คน)`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={fetchAlumni}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีเฟรช</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>ส่งออก Excel</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรือเลขบัตรประชาชน..."
                  className="input-field pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyPress={handleSearch}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>ตัวกรอง</span>
              </button>
              
              {(filters.status || filters.department || filters.graduationYear || filters.position) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">สถานะ</label>
                  <select
                    className="input-field"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">แผนก/สาขา</label>
                  <select
                    className="input-field"
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  >
                    <option value="">ทุกแผนก</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">ปีที่จบ</label>
                  <select
                    className="input-field"
                    value={filters.graduationYear}
                    onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                  >
                    <option value="">ทุกปี</option>
                    {graduationYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">ตำแหน่ง</label>
                  <select
                    className="input-field"
                    value={filters.position}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                  >
                    {positionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alumni Table */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <InlineSpinner size="medium" />
                <span className="text-gray-600">กำลังโหลดข้อมูล...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    รายการสมาชิก ({totalCount} คน)
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">แสดง</span>
                    <select
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={filters.limit}
                      onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    >
                      {limitOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {alumni.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ข้อมูลส่วนตัว
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การศึกษา
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ตำแหน่ง
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่ลงทะเบียน
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {alumni.map((person) => (
                        <tr key={person._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-600">
                                  {person.firstName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {person.firstName} {person.lastName}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{person.phone}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate max-w-32">{person.email}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-800">{person.department}</p>
                              <p className="text-sm text-gray-500">ปี {person.graduationYear}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`status-badge ${getPositionBadge(person.position)}`}>
                              {person.position}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={getStatusBadge(person.status)}>
                              {person.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(person.registrationDate).toLocaleDateString('th-TH')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <Link
                                to={`/admin/alumni/${person._id}`}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                title="ดูรายละเอียด"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-50"
                                title="ตัวเลือกเพิ่มเติม"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ไม่พบข้อมูลสมาชิก</p>
                    <p className="text-gray-400 text-sm">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      แสดง {((filters.page - 1) * filters.limit) + 1} - {Math.min(filters.page * filters.limit, totalCount)} จาก {totalCount} รายการ
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFilterChange('page', filters.page - 1)}
                        disabled={filters.page <= 1}
                        className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>ก่อนหน้า</span>
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= filters.page - 2 && page <= filters.page + 2)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handleFilterChange('page', page)}
                                className={`px-3 py-1 text-sm rounded-md ${
                                  page === filters.page
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          } else if (
                            page === filters.page - 3 ||
                            page === filters.page + 3
                          ) {
                            return <span key={page} className="px-2 text-gray-400">...</span>
                          }
                          return null
                        })}
                      </div>
                      
                      <button
                        onClick={() => handleFilterChange('page', filters.page + 1)}
                        disabled={filters.page >= totalPages}
                        className="flex items-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>ถัดไป</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AlumniManagement