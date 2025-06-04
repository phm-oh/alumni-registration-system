// Path: src/features/alumni/members.report.controller.js
// ไฟล์ใหม่: members.report.controller.js - รายงานสมาชิกทั้งหมด

import { getAllAlumni } from './alumni.service.js';
import * as XLSX from 'xlsx';

// ===============================================
// 📊 COMPLETE MEMBERS REPORT CONTROLLERS
// ===============================================

/**
 * ดึงรายงานสมาชิกทั้งหมด (ทั้งรับเองและจัดส่ง)
 * GET /api/alumni/reports/all-members
 */
export const getAllMembersReportController = async (req, res) => {
  try {
    const {
      status = 'อนุมัติ', // Default: เฉพาะคนที่อนุมัติแล้ว
      position,
      graduationYear,
      department,
      search,
      name,
      idCard,
      deliveryOption, // เพิ่มการกรองตามวิธีการรับ
      includeStatistics = 'true'
    } = req.query;

    // สร้าง filters สำหรับสมาชิกทั้งหมด
    const filters = {};
    if (status) filters.status = status;
    if (position) filters.position = position;
    if (graduationYear) filters.graduationYear = parseInt(graduationYear);
    if (department) filters.department = department;
    if (deliveryOption) filters.deliveryOption = deliveryOption;
    
    const searchTerm = search || name;
    if (searchTerm && searchTerm.trim()) {
      filters.name = searchTerm.trim();
    }
    
    if (idCard && idCard.trim()) {
      filters.idCard = idCard.trim();
    }

    const options = {
      page: 1,
      limit: 10000, // ดึงทั้งหมด
      sort: { createdAt: -1 }
    };

    // ดึงข้อมูลสมาชิกทั้งหมด
    const results = await getAllAlumni(filters, options);

    // สร้างสถิติ
    let statistics = null;
    if (includeStatistics === 'true') {
      statistics = await generateAllMembersStatistics(results.data);
    }

    // แยกข้อมูลตามประเภทการรับ
    const membersByDelivery = separateMembersByDelivery(results.data);

    return res.status(200).json({
      success: true,
      message: 'ดึงรายงานสมาชิกทั้งหมดสำเร็จ',
      data: {
        // ข้อมูลรายการทั้งหมด
        allMembers: results.data,
        totalMembers: results.data.length,
        
        // แยกตามวิธีการรับ
        byDeliveryType: membersByDelivery,
        
        // สถิติรวม
        statistics,
        
        // ข้อมูลการกรอง
        filters: {
          status,
          position,
          graduationYear,
          department,
          deliveryOption,
          searchTerm
        },
        
        // เวลาที่สร้างรายงาน
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in getAllMembersReport:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างรายงานสมาชิกทั้งหมด',
      error: error.message
    });
  }
};

/**
 * Export รายงานสมาชิกทั้งหมดเป็น Excel
 * GET /api/alumni/export/all-members-excel
 */
export const exportAllMembersToExcelController = async (req, res) => {
  try {
    const {
      status = 'อนุมัติ',
      position,
      graduationYear,
      department,
      search,
      name,
      idCard,
      deliveryOption,
      fileName
    } = req.query;

    // สร้าง filters เช่นเดียวกับ report
    const filters = {};
    if (status) filters.status = status;
    if (position) filters.position = position;
    if (graduationYear) filters.graduationYear = parseInt(graduationYear);
    if (department) filters.department = department;
    if (deliveryOption) filters.deliveryOption = deliveryOption;
    
    const searchTerm = search || name;
    if (searchTerm && searchTerm.trim()) {
      filters.name = searchTerm.trim();
    }
    
    if (idCard && idCard.trim()) {
      filters.idCard = idCard.trim();
    }

    const options = {
      page: 1,
      limit: 10000,
      sort: { createdAt: -1 }
    };

    // ดึงข้อมูลสมาชิกทั้งหมด
    const results = await getAllAlumni(filters, options);

    // สร้าง Excel Workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: สมาชิกทั้งหมด
    const allMembersSheet = createAllMembersSheet(results.data);
    XLSX.utils.book_append_sheet(workbook, allMembersSheet, 'สมาชิกทั้งหมด');

    // Sheet 2: แยกตามวิธีการรับ
    const deliveryBreakdownSheet = createDeliveryBreakdownSheet(results.data);
    XLSX.utils.book_append_sheet(workbook, deliveryBreakdownSheet, 'แยกตามการรับ');

    // Sheet 3: สถิติสมาชิก
    const membersStatisticsSheet = await createMembersStatisticsSheet(results.data);
    XLSX.utils.book_append_sheet(workbook, membersStatisticsSheet, 'สถิติสมาชิก');

    // Sheet 4: สรุปการเงิน
    const financialSummarySheet = createFinancialSummarySheet(results.data);
    XLSX.utils.book_append_sheet(workbook, financialSummarySheet, 'สรุปการเงิน');

    // สร้างไฟล์ Excel
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // กำหนดชื่อไฟล์
    const defaultFileName = `all-members-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    const downloadFileName = fileName || defaultFileName;

    // ส่งไฟล์กลับ
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    return res.send(excelBuffer);

  } catch (error) {
    console.error('Error in exportAllMembersToExcel:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ Export รายงานสมาชิกทั้งหมด',
      error: error.message
    });
  }
};

// ===============================================
// 🔧 HELPER FUNCTIONS
// ===============================================

/**
 * สร้างสถิติสมาชิกทั้งหมด
 */
const generateAllMembersStatistics = async (membersData) => {
  const total = membersData.length;
  
  // แยกตามวิธีการรับ
  const deliveryStats = membersData.reduce((acc, member) => {
    acc[member.deliveryOption] = (acc[member.deliveryOption] || 0) + 1;
    return acc;
  }, {});

  // แยกตามแผนก
  const departmentStats = membersData.reduce((acc, member) => {
    acc[member.department] = (acc[member.department] || 0) + 1;
    return acc;
  }, {});

  // แยกตามปี
  const yearStats = membersData.reduce((acc, member) => {
    acc[member.graduationYear] = (acc[member.graduationYear] || 0) + 1;
    return acc;
  }, {});

  // แยกตามตำแหน่ง
  const positionStats = membersData.reduce((acc, member) => {
    acc[member.position] = (acc[member.position] || 0) + 1;
    return acc;
  }, {});

  // คำนวณการเงิน
  const financials = {
    totalRevenue: membersData.reduce((sum, m) => sum + (m.totalAmount || 0), 0),
    membershipFees: membersData.reduce((sum, m) => sum + (m.amount || 0), 0),
    shippingFees: membersData.reduce((sum, m) => sum + (m.shippingFee || 0), 0),
    averageAmount: total > 0 ? membersData.reduce((sum, m) => sum + (m.totalAmount || 0), 0) / total : 0
  };

  return {
    total,
    deliveryBreakdown: deliveryStats,
    departmentBreakdown: departmentStats,
    yearBreakdown: yearStats,
    positionBreakdown: positionStats,
    financials
  };
};

/**
 * แยกสมาชิกตามประเภทการรับ
 */
const separateMembersByDelivery = (membersData) => {
  const pickup = membersData.filter(m => m.deliveryOption === 'รับที่วิทยาลัย');
  const shipping = membersData.filter(m => m.deliveryOption === 'จัดส่งทางไปรษณีย์');

  return {
    pickup: {
      members: pickup,
      count: pickup.length,
      totalRevenue: pickup.reduce((sum, m) => sum + (m.totalAmount || 0), 0),
      averageAmount: pickup.length > 0 ? pickup.reduce((sum, m) => sum + (m.totalAmount || 0), 0) / pickup.length : 0
    },
    shipping: {
      members: shipping,
      count: shipping.length,
      totalRevenue: shipping.reduce((sum, m) => sum + (m.totalAmount || 0), 0),
      averageAmount: shipping.length > 0 ? shipping.reduce((sum, m) => sum + (m.totalAmount || 0), 0) / shipping.length : 0,
      
      // แยกตามสถานะการจัดส่ง
      byShippingStatus: shipping.reduce((acc, m) => {
        acc[m.shippingStatus] = (acc[m.shippingStatus] || 0) + 1;
        return acc;
      }, {})
    }
  };
};

// ===============================================
// 📋 EXCEL SHEET CREATORS
// ===============================================

/**
 * สร้าง Sheet สมาชิกทั้งหมด
 */
const createAllMembersSheet = (membersData) => {
  const data = [
    // Headers
    [
      'ลำดับ', 'ชื่อ', 'นามสกุล', 'แผนกวิชา', 'ปีที่สำเร็จการศึกษา',
      'ตำแหน่ง', 'เบอร์โทรศัพท์', 'อีเมล', 'ที่อยู่',
      'วิธีการรับ', 'สถานะการจัดส่ง', 'ค่าสมาชิก', 'ค่าจัดส่ง', 'รวมทั้งหมด',
      'วันที่ลงทะเบียน', 'วันที่ชำระเงิน', 'เลขติดตาม'
    ]
  ];

  // Data rows
  membersData.forEach((member, index) => {
    data.push([
      index + 1,
      member.firstName,
      member.lastName,
      member.department,
      member.graduationYear,
      member.position,
      member.phone,
      member.email,
      member.address,
      member.deliveryOption,
      member.shippingStatus || 'ไม่ต้องจัดส่ง',
      member.amount || 0,
      member.shippingFee || 0,
      member.totalAmount || 0,
      new Date(member.createdAt).toLocaleDateString('th-TH'),
      member.paymentDate ? new Date(member.paymentDate).toLocaleDateString('th-TH') : '-',
      member.trackingNumber || '-'
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // ปรับความกว้างคอลัมน์
  worksheet['!cols'] = [
    { width: 8 },   // ลำดับ
    { width: 15 },  // ชื่อ
    { width: 20 },  // นามสกุล
    { width: 25 },  // แผนกวิชา
    { width: 12 },  // ปี
    { width: 15 },  // ตำแหน่ง
    { width: 15 },  // เบอร์โทร
    { width: 25 },  // อีเมล
    { width: 40 },  // ที่อยู่
    { width: 20 },  // วิธีการรับ
    { width: 15 },  // สถานะการจัดส่ง
    { width: 10 },  // ค่าสมาชิก
    { width: 10 },  // ค่าจัดส่ง
    { width: 12 },  // รวมทั้งหมด
    { width: 15 },  // วันที่ลงทะเบียน
    { width: 15 },  // วันที่ชำระเงิน
    { width: 15 }   // เลขติดตาม
  ];

  return worksheet;
};

/**
 * สร้าง Sheet แยกตามวิธีการรับ
 */
const createDeliveryBreakdownSheet = (membersData) => {
  const breakdown = separateMembersByDelivery(membersData);
  
  const data = [
    ['รายงานแยกตามวิธีการรับบัตรสมาชิก'],
    [''],
    ['ภาพรวม'],
    ['ประเภท', 'จำนวนคน', 'รายได้รวม', 'ค่าเฉลี่ยต่อคน'],
    [
      'รับที่วิทยาลัย', 
      breakdown.pickup.count, 
      breakdown.pickup.totalRevenue, 
      Math.round(breakdown.pickup.averageAmount)
    ],
    [
      'จัดส่งทางไปรษณีย์', 
      breakdown.shipping.count, 
      breakdown.shipping.totalRevenue, 
      Math.round(breakdown.shipping.averageAmount)
    ],
    [''],
    ['รายละเอียดการจัดส่ง'],
    ['สถานะ', 'จำนวน', 'เปอร์เซ็นต์']
  ];

  // เพิ่มข้อมูลสถานะการจัดส่ง
  if (breakdown.shipping.count > 0) {
    Object.entries(breakdown.shipping.byShippingStatus).forEach(([status, count]) => {
      const percentage = ((count / breakdown.shipping.count) * 100).toFixed(1);
      data.push([status, count, `${percentage}%`]);
    });
  } else {
    data.push(['ไม่มีการจัดส่ง', 0, '0%']);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // ปรับความกว้างคอลัมน์
  worksheet['!cols'] = [
    { width: 25 },
    { width: 15 },
    { width: 15 },
    { width: 15 }
  ];

  return worksheet;
};

/**
 * สร้าง Sheet สถิติสมาชิก
 */
const createMembersStatisticsSheet = async (membersData) => {
  const stats = await generateAllMembersStatistics(membersData);
  
  const data = [
    ['สถิติสมาชิกศิษย์เก่าทั้งหมด'],
    [''],
    ['ข้อมูลรวม'],
    ['จำนวนสมาชิกทั้งหมด', stats.total],
    ['รายได้รวม', stats.financials.totalRevenue],
    ['ค่าสมาชิกรวม', stats.financials.membershipFees],
    ['ค่าจัดส่งรวม', stats.financials.shippingFees],
    ['ค่าเฉลี่ยต่อคน', Math.round(stats.financials.averageAmount)],
    [''],
    ['แยกตามวิธีการรับ'],
    ['วิธีการรับ', 'จำนวน', 'เปอร์เซ็นต์']
  ];

  // เพิ่มข้อมูลวิธีการรับ
  Object.entries(stats.deliveryBreakdown).forEach(([delivery, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    data.push([delivery, count, `${percentage}%`]);
  });

  data.push(['']);
  data.push(['แยกตามแผนกวิชา']);
  data.push(['แผนกวิชา', 'จำนวน', 'เปอร์เซ็นต์']);

  // เพิ่มข้อมูลแผนก
  Object.entries(stats.departmentBreakdown).forEach(([dept, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    data.push([dept, count, `${percentage}%`]);
  });

  data.push(['']);
  data.push(['แยกตามตำแหน่ง']);
  data.push(['ตำแหน่ง', 'จำนวน', 'เปอร์เซ็นต์']);

  // เพิ่มข้อมูลตำแหน่ง
  Object.entries(stats.positionBreakdown).forEach(([position, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    data.push([position, count, `${percentage}%`]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // ปรับความกว้างคอลัมน์
  worksheet['!cols'] = [
    { width: 25 },
    { width: 15 },
    { width: 15 }
  ];

  return worksheet;
};

/**
 * สร้าง Sheet สรุปการเงิน
 */
const createFinancialSummarySheet = (membersData) => {
  const pickup = membersData.filter(m => m.deliveryOption === 'รับที่วิทยาลัย');
  const shipping = membersData.filter(m => m.deliveryOption === 'จัดส่งทางไปรษณีย์');

  const data = [
    ['สรุปการเงินสมาคมศิษย์เก่า'],
    [''],
    ['รายได้จากค่าสมาชิก'],
    ['ประเภท', 'จำนวนคน', 'ค่าสมาชิก/คน', 'ค่าจัดส่ง/คน', 'รวมรายได้'],
    [
      'รับที่วิทยาลัย',
      pickup.length,
      200,
      0,
      pickup.reduce((sum, m) => sum + (m.totalAmount || 0), 0)
    ],
    [
      'จัดส่งทางไปรษณีย์',
      shipping.length,
      200,
      30,
      shipping.reduce((sum, m) => sum + (m.totalAmount || 0), 0)
    ],
    [''],
    ['สรุปรวม'],
    [
      'รวมทั้งหมด',
      membersData.length,
      '-',
      '-',
      membersData.reduce((sum, m) => sum + (m.totalAmount || 0), 0)
    ]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // ปรับความกว้างคอลัมน์
  worksheet['!cols'] = [
    { width: 20 },
    { width: 12 },
    { width: 15 },
    { width: 15 },
    { width: 15 }
  ];

  return worksheet;
};

export default {
  getAllMembersReportController,
  exportAllMembersToExcelController
};