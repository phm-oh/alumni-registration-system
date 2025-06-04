// Path: src/features/alumni/shipping.export.controller.js
// ไฟล์: shipping.export.controller.js - Export Controllers สำหรับการจัดส่ง

import {
  getShippingList,
  getShippingStatistics,
  trackShipment
} from './shipping.service.js';
import { getAllAlumni } from './alumni.service.js';
import XLSX from 'xlsx';

// ===============================================
// 📊 SHIPPING REPORT CONTROLLERS
// ===============================================

/**
 * ดึงรายงานการจัดส่งแบบละเอียด
 * GET /api/shipping/reports/detailed
 */
export const getDetailedShippingReportController = async (req, res) => {
  try {
    const {
      shippingStatus,
      graduationYear,
      department,
      startDate,
      endDate,
      includeStatistics = 'true'
    } = req.query;

    // ดึงข้อมูลการจัดส่งทั้งหมด
    const shippingFilters = {
      shippingStatus,
      graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      department,
      search: undefined
    };

    const shippingOptions = {
      page: 1,
      limit: 1000, // ดึงทั้งหมด
      sort: { createdAt: -1 }
    };

    const shippingData = await getShippingList(shippingFilters, shippingOptions);

    // กรองตามวันที่ถ้ามี
    let filteredData = shippingData.data;
    if (startDate || endDate) {
      filteredData = shippingData.data.filter(alumni => {
        const createdDate = new Date(alumni.createdAt);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        return createdDate >= start && createdDate <= end;
      });
    }

    // สร้างสถิติ
    let statistics = null;
    if (includeStatistics === 'true') {
      statistics = await generateShippingReportStatistics(filteredData);
    }

    // สร้างรายงานแยกตามแผนก
    const departmentReport = generateDepartmentShippingReport(filteredData);

    // สร้างรายงานแยกตามสถานะ
    const statusReport = generateStatusShippingReport(filteredData);

    return res.status(200).json({
      success: true,
      message: 'ดึงรายงานการจัดส่งสำเร็จ',
      data: {
        // ข้อมูลรายการ
        shipments: filteredData,
        totalShipments: filteredData.length,
        
        // สถิติรวม
        statistics,
        
        // รายงานแยกตามหมวดหมู่
        reports: {
          byDepartment: departmentReport,
          byStatus: statusReport
        },
        
        // ข้อมูลการกรอง
        filters: {
          shippingStatus,
          graduationYear,
          department,
          startDate,
          endDate
        },
        
        // เวลาที่สร้างรายงาน
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in getDetailedShippingReport:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างรายงานการจัดส่ง',
      error: error.message
    });
  }
};

// ===============================================
// 📤 EXPORT EXCEL CONTROLLERS
// ===============================================

/**
 * Export รายงานการจัดส่งเป็น Excel
 * GET /api/shipping/export/excel
 */
export const exportShippingToExcelController = async (req, res) => {
  try {
    const {
      shippingStatus,
      graduationYear,
      department,
      startDate,
      endDate,
      includeStatistics = 'true',
      fileName
    } = req.query;

    // ดึงข้อมูลเช่นเดียวกับ detailed report
    const filters = {
      shippingStatus,
      graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      department
    };

    const options = {
      page: 1,
      limit: 1000,
      sort: { createdAt: -1 }
    };

    const shippingData = await getShippingList(filters, options);

    // กรองตามวันที่
    let filteredData = shippingData.data;
    if (startDate || endDate) {
      filteredData = shippingData.data.filter(alumni => {
        const createdDate = new Date(alumni.createdAt);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        return createdDate >= start && createdDate <= end;
      });
    }

    // สร้าง Excel Workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: รายการการจัดส่งทั้งหมด
    const shippingSheet = createShippingListSheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, shippingSheet, 'รายการการจัดส่ง');

    // Sheet 2: สถิติการจัดส่ง (ถ้าต้องการ)
    if (includeStatistics === 'true') {
      const statisticsSheet = await createShippingStatisticsSheet(filteredData);
      XLSX.utils.book_append_sheet(workbook, statisticsSheet, 'สถิติการจัดส่ง');
    }

    // Sheet 3: รายงานตามแผนก
    const departmentSheet = createDepartmentReportSheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, departmentSheet, 'รายงานตามแผนก');

    // สร้างไฟล์ Excel
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // กำหนดชื่อไฟล์
    const defaultFileName = `shipping-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    const downloadFileName = fileName || defaultFileName;

    // ส่งไฟล์กลับ
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    return res.send(excelBuffer);

  } catch (error) {
    console.error('Error in exportShippingToExcel:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ Export Excel',
      error: error.message
    });
  }
};

/**
 * Export ข้อมูลศิษย์เก่าเป็น Excel
 * GET /api/alumni/export/excel
 */
export const exportAlumniToExcelController = async (req, res) => {
  try {
    const {
      status,
      position,
      graduationYear,
      department,
      search,
      name,
      idCard,
      shippingStatus,
      deliveryOption,
      fileName
    } = req.query;

    // สร้าง filters
    const filters = {};
    if (status) filters.status = status;
    if (position) filters.position = position;
    if (graduationYear) filters.graduationYear = parseInt(graduationYear);
    if (department) filters.department = department;
    if (shippingStatus) filters.shippingStatus = shippingStatus;
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

    // ดึงข้อมูลศิษย์เก่า
    const results = await getAllAlumni(filters, options);

    // สร้าง Excel Workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: รายชื่อศิษย์เก่า
    const alumniSheet = createAlumniListSheet(results.data);
    XLSX.utils.book_append_sheet(workbook, alumniSheet, 'รายชื่อศิษย์เก่า');

    // Sheet 2: สถิติศิษย์เก่า
    const statisticsSheet = createAlumniStatisticsSheet(results.data);
    XLSX.utils.book_append_sheet(workbook, statisticsSheet, 'สถิติศิษย์เก่า');

    // สร้างไฟล์ Excel
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // กำหนดชื่อไฟล์
    const defaultFileName = `alumni-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    const downloadFileName = fileName || defaultFileName;

    // ส่งไฟล์กลับ
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    return res.send(excelBuffer);

  } catch (error) {
    console.error('Error in exportAlumniToExcel:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ Export ข้อมูลศิษย์เก่า',
      error: error.message
    });
  }
};

// ===============================================
// 📊 HELPER FUNCTIONS
// ===============================================

/**
 * สร้างสถิติรายงานการจัดส่ง
 */
const generateShippingReportStatistics = async (shippingData) => {
  const total = shippingData.length;
  
  // นับตามสถานะ
  const statusCounts = shippingData.reduce((acc, item) => {
    acc[item.shippingStatus] = (acc[item.shippingStatus] || 0) + 1;
    return acc;
  }, {});

  // นับตามแผนก
  const departmentCounts = shippingData.reduce((acc, item) => {
    acc[item.department] = (acc[item.department] || 0) + 1;
    return acc;
  }, {});

  // นับตามปี
  const yearCounts = shippingData.reduce((acc, item) => {
    acc[item.graduationYear] = (acc[item.graduationYear] || 0) + 1;
    return acc;
  }, {});

  // คำนวณค่าใช้จ่ายรวม
  const totalAmount = shippingData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const totalShippingFee = shippingData.reduce((sum, item) => sum + (item.shippingFee || 0), 0);

  return {
    total,
    statusBreakdown: statusCounts,
    departmentBreakdown: departmentCounts,
    yearBreakdown: yearCounts,
    financials: {
      totalAmount,
      totalShippingFee,
      averageAmount: total > 0 ? totalAmount / total : 0
    }
  };
};

/**
 * สร้างรายงานแยกตามแผนก
 */
const generateDepartmentShippingReport = (shippingData) => {
  const departments = {};
  
  shippingData.forEach(item => {
    if (!departments[item.department]) {
      departments[item.department] = {
        department: item.department,
        total: 0,
        byStatus: {},
        totalAmount: 0
      };
    }
    
    departments[item.department].total++;
    departments[item.department].byStatus[item.shippingStatus] = 
      (departments[item.department].byStatus[item.shippingStatus] || 0) + 1;
    departments[item.department].totalAmount += (item.totalAmount || 0);
  });
  
  return Object.values(departments);
};

/**
 * สร้างรายงานแยกตามสถานะ
 */
const generateStatusShippingReport = (shippingData) => {
  const statuses = {};
  
  shippingData.forEach(item => {
    if (!statuses[item.shippingStatus]) {
      statuses[item.shippingStatus] = {
        status: item.shippingStatus,
        total: 0,
        departments: {},
        totalAmount: 0
      };
    }
    
    statuses[item.shippingStatus].total++;
    statuses[item.shippingStatus].departments[item.department] = 
      (statuses[item.shippingStatus].departments[item.department] || 0) + 1;
    statuses[item.shippingStatus].totalAmount += (item.totalAmount || 0);
  });
  
  return Object.values(statuses);
};

// ===============================================
// 📋 EXCEL SHEET CREATORS
// ===============================================

/**
 * สร้าง Sheet รายการการจัดส่ง
 */
const createShippingListSheet = (shippingData) => {
  const data = [
    // Headers
    [
      'ลำดับ', 'ชื่อ-นามสกุล', 'แผนกวิชา', 'ปีที่สำเร็จการศึกษา',
      'เบอร์โทรศัพท์', 'ที่อยู่', 'สถานะการจัดส่ง', 'เลขติดตาม',
      'วันที่จัดส่ง', 'ค่าสมาชิก', 'ค่าจัดส่ง', 'รวมทั้งหมด',
      'วันที่ลงทะเบียน', 'หมายเหตุ'
    ]
  ];

  // Data rows
  shippingData.forEach((item, index) => {
    data.push([
      index + 1,
      `${item.firstName} ${item.lastName}`,
      item.department,
      item.graduationYear,
      item.phone,
      item.address,
      item.shippingStatus,
      item.trackingNumber || '-',
      item.shippedDate ? new Date(item.shippedDate).toLocaleDateString('th-TH') : '-',
      item.amount || 0,
      item.shippingFee || 0,
      item.totalAmount || 0,
      new Date(item.createdAt).toLocaleDateString('th-TH'),
      item.deliveryNotes || '-'
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // ปรับความกว้างคอลัมน์
  worksheet['!cols'] = [
    { width: 8 },   // ลำดับ
    { width: 25 },  // ชื่อ-นามสกุล
    { width: 20 },  // แผนกวิชา
    { width: 12 },  // ปี
    { width: 15 },  // เบอร์โทร
    { width: 40 },  // ที่อยู่
    { width: 15 },  // สถานะการจัดส่ง
    { width: 15 },  // เลขติดตาม
    { width: 12 },  // วันที่จัดส่ง
    { width: 10 },  // ค่าสมาชิก
    { width: 10 },  // ค่าจัดส่ง
    { width: 12 },  // รวมทั้งหมด
    { width: 15 },  // วันที่ลงทะเบียน
    { width: 20 }   // หมายเหตุ
  ];

  return worksheet;
};

/**
 * สร้าง Sheet สถิติการจัดส่ง
 */
const createShippingStatisticsSheet = async (shippingData) => {
  const stats = await generateShippingReportStatistics(shippingData);
  
  const data = [
    ['สถิติการจัดส่งบัตรสมาชิกศิษย์เก่า'],
    [''],
    ['ข้อมูลรวม'],
    ['จำนวนทั้งหมด', stats.total],
    ['มูลค่ารวม', stats.financials.totalAmount],
    ['ค่าจัดส่งรวม', stats.financials.totalShippingFee],
    ['ค่าเฉลี่ยต่อคน', Math.round(stats.financials.averageAmount)],
    [''],
    ['แยกตามสถานะการจัดส่ง'],
    ['สถานะ', 'จำนวน', 'เปอร์เซ็นต์']
  ];

  // เพิ่มข้อมูลสถานะ
  Object.entries(stats.statusBreakdown).forEach(([status, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    data.push([status, count, `${percentage}%`]);
  });

  data.push(['']);
  data.push(['แยกตามแผนกวิชา']);
  data.push(['แผนกวิชา', 'จำนวน', 'เปอร์เซ็นต์']);

  // เพิ่มข้อมูลแผนก
  Object.entries(stats.departmentBreakdown).forEach(([dept, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    data.push([dept, count, `${percentage}%`]);
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
 * สร้าง Sheet รายงานตามแผนก
 */
const createDepartmentReportSheet = (shippingData) => {
  const departmentReport = generateDepartmentShippingReport(shippingData);
  
  const data = [
    ['รายงานการจัดส่งแยกตามแผนกวิชา'],
    [''],
    [
      'แผนกวิชา', 'จำนวนทั้งหมด', 'รอการจัดส่ง', 'กำลังจัดส่ง', 
      'จัดส่งแล้ว', 'ไม่ต้องจัดส่ง', 'มูลค่ารวม'
    ]
  ];

  departmentReport.forEach(dept => {
    data.push([
      dept.department,
      dept.total,
      dept.byStatus['รอการจัดส่ง'] || 0,
      dept.byStatus['กำลังจัดส่ง'] || 0,
      dept.byStatus['จัดส่งแล้ว'] || 0,
      dept.byStatus['ไม่ต้องจัดส่ง'] || 0,
      dept.totalAmount
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // ปรับความกว้างคอลัมน์
  worksheet['!cols'] = [
    { width: 25 }, // แผนกวิชา
    { width: 12 }, // จำนวนทั้งหมด
    { width: 12 }, // รอการจัดส่ง
    { width: 12 }, // กำลังจัดส่ง
    { width: 12 }, // จัดส่งแล้ว
    { width: 12 }, // ไม่ต้องจัดส่ง
    { width: 12 }  // มูลค่ารวม
  ];

  return worksheet;
};

/**
 * สร้าง Sheet รายชื่อศิษย์เก่า
 */
const createAlumniListSheet = (alumniData) => {
  const data = [
    // Headers
    [
      'ลำดับ', 'ชื่อ', 'นามสกุล', 'เลขบัตรประชาชน', 'แผนกวิชา',
      'ปีที่สำเร็จการศึกษา', 'เบอร์โทรศัพท์', 'อีเมล', 'ที่อยู่',
      'ตำแหน่ง', 'สถานะ', 'สถานะการจัดส่ง', 'วิธีการรับ',
      'ค่าสมาชิก', 'ค่าจัดส่ง', 'รวมทั้งหมด', 'วันที่ลงทะเบียน',
      'วันที่ชำระเงิน', 'เลขติดตาม'
    ]
  ];

  // Data rows
  alumniData.forEach((item, index) => {
    data.push([
      index + 1,
      item.firstName,
      item.lastName,
      item.idCard,
      item.department,
      item.graduationYear,
      item.phone,
      item.email,
      item.address,
      item.position,
      item.status,
      item.shippingStatus,
      item.deliveryOption,
      item.amount || 0,
      item.shippingFee || 0,
      item.totalAmount || 0,
      new Date(item.createdAt).toLocaleDateString('th-TH'),
      item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('th-TH') : '-',
      item.trackingNumber || '-'
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // ปรับความกว้างคอลัมน์
  worksheet['!cols'] = [
    { width: 8 },   // ลำดับ
    { width: 15 },  // ชื่อ
    { width: 20 },  // นามสกุล
    { width: 18 },  // เลขบัตรประชาชน
    { width: 20 },  // แผนกวิชา
    { width: 12 },  // ปี
    { width: 15 },  // เบอร์โทร
    { width: 25 },  // อีเมล
    { width: 40 },  // ที่อยู่
    { width: 15 },  // ตำแหน่ง
    { width: 12 },  // สถานะ
    { width: 15 },  // สถานะการจัดส่ง
    { width: 15 },  // วิธีการรับ
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
 * สร้าง Sheet สถิติศิษย์เก่า
 */
const createAlumniStatisticsSheet = (alumniData) => {
  const total = alumniData.length;
  
  // นับตามสถานะ
  const statusCounts = alumniData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  // นับตามแผนก
  const departmentCounts = alumniData.reduce((acc, item) => {
    acc[item.department] = (acc[item.department] || 0) + 1;
    return acc;
  }, {});

  // นับตามปี
  const yearCounts = alumniData.reduce((acc, item) => {
    acc[item.graduationYear] = (acc[item.graduationYear] || 0) + 1;
    return acc;
  }, {});

  const data = [
    ['สถิติศิษย์เก่า'],
    [''],
    ['ข้อมูลรวม'],
    ['จำนวนสมาชิกทั้งหมด', total],
    [''],
    ['แยกตามสถานะ'],
    ['สถานะ', 'จำนวน', 'เปอร์เซ็นต์']
  ];

  // เพิ่มข้อมูลสถานะ
  Object.entries(statusCounts).forEach(([status, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    data.push([status, count, `${percentage}%`]);
  });

  data.push(['']);
  data.push(['แยกตามแผนกวิชา']);
  data.push(['แผนกวิชา', 'จำนวน', 'เปอร์เซ็นต์']);

  // เพิ่มข้อมูลแผนก
  Object.entries(departmentCounts).forEach(([dept, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    data.push([dept, count, `${percentage}%`]);
  });

  data.push(['']);
  data.push(['แยกตามปีที่สำเร็จการศึกษา']);
  data.push(['ปี', 'จำนวน', 'เปอร์เซ็นต์']);

  // เพิ่มข้อมูลปี
  Object.entries(yearCounts)
    .sort(([a], [b]) => b - a) // เรียงปีจากใหม่ไปเก่า
    .forEach(([year, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      data.push([year, count, `${percentage}%`]);
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

export default {
  getDetailedShippingReportController,
  exportShippingToExcelController,
  exportAlumniToExcelController
};