// Path: src/features/alumni/shipping.routes.js
// ไฟล์: shipping.routes.js - เพิ่ม Routes สำหรับ Reports และ Export

import express from 'express';
import {
  // Label Generation Controllers
  generateSingleLabelController,
  generateBulkLabelsController,
  generateShippingSummaryController,
  generateMinimalLabelController,
  generate4UpLabelsController,
  
  // Utilities
  checkOverdueShipmentsController,
  getShippingReportsController
} from './shipping.controller.js';

// 🚀 Import Export Controllers (ที่ขาดหายไป)
import {
  getDetailedShippingReportController,
  exportShippingToExcelController
} from './shipping.export.controller.js';

import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// 📊 SHIPPING REPORTS ROUTES (🚀 เพิ่มใหม่)
// ============================================

/**
 * รายงานการจัดส่งแบบละเอียด
 * GET /api/shipping/reports/detailed?shippingStatus=รอการจัดส่ง&department=เทคโนโลยีสารสนเทศ
 */
router.get('/reports/detailed', authMiddleware, adminMiddleware, getDetailedShippingReportController);

/**
 * สรุปรายงานการจัดส่ง (ย่อ)
 * GET /api/shipping/reports/summary
 */
router.get('/reports/summary', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { getShippingStatistics } = await import('./shipping.service.js');
    const statistics = await getShippingStatistics();
    
    return res.status(200).json({
      success: true,
      message: 'สรุปรายงานการจัดส่งสำเร็จ',
      data: statistics
    });
  } catch (error) {
    console.error('Error in shipping summary:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสรุปรายงานการจัดส่ง',
      error: error.message
    });
  }
});

// ============================================
// 📤 SHIPPING EXPORT ROUTES (🚀 เพิ่มใหม่)
// ============================================

/**
 * Export รายงานการจัดส่งเป็น Excel
 * GET /api/shipping/export/excel?shippingStatus=รอการจัดส่ง&fileName=shipping-report.xlsx
 */
router.get('/export/excel', authMiddleware, adminMiddleware, exportShippingToExcelController);

/**
 * Export รายชื่อที่ต้องจัดส่ง (เฉพาะคนที่เลือกจัดส่ง)
 * GET /api/shipping/export/shipping-list?fileName=shipping-list.xlsx
 */
router.get('/export/shipping-list', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { fileName } = req.query;
    const { getShippingList } = await import('./shipping.service.js');
    
    // ดึงเฉพาะคนที่ต้องจัดส่ง
    const filters = {
      shippingStatus: 'รอการจัดส่ง' // หรือทุกสถานะการจัดส่ง
    };
    
    const options = {
      page: 1,
      limit: 10000,
      sort: { createdAt: -1 }
    };
    
    const results = await getShippingList(filters, options);
    
    // สร้าง Excel (ใช้โค้ดจาก shipping.export.controller.js)
    const XLSX = (await import('xlsx')).default;
    const workbook = XLSX.utils.book_new();
    
    // Sheet: รายชื่อที่ต้องจัดส่ง
    const data = [
      [
        'ลำดับ', 'ชื่อ-นามสกุล', 'แผนกวิชา', 'ปีที่สำเร็จการศึกษา',
        'เบอร์โทรศัพท์', 'ที่อยู่', 'สถานะการจัดส่ง', 'เลขติดตาม',
        'ค่าสมาชิก', 'ค่าจัดส่ง', 'รวมทั้งหมด', 'วันที่ลงทะเบียน'
      ]
    ];
    
    results.data.forEach((item, index) => {
      data.push([
        index + 1,
        `${item.firstName} ${item.lastName}`,
        item.department,
        item.graduationYear,
        item.phone,
        item.address,
        item.shippingStatus,
        item.trackingNumber || '-',
        item.amount || 200,
        item.shippingFee || 30,
        item.totalAmount || 230,
        new Date(item.createdAt).toLocaleDateString('th-TH')
      ]);
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!cols'] = [
      { width: 8 }, { width: 25 }, { width: 20 }, { width: 12 },
      { width: 15 }, { width: 40 }, { width: 15 }, { width: 15 },
      { width: 10 }, { width: 10 }, { width: 12 }, { width: 15 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อที่ต้องจัดส่ง');
    
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const downloadFileName = fileName || `shipping-list-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    return res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error in export shipping list:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ Export รายชื่อการจัดส่ง',
      error: error.message
    });
  }
});

// ============================================
// 🏷️ MINIMAL LABEL GENERATION ROUTES
// ============================================

/**
 * สร้าง minimal shipping label รายบุคคล
 * GET /api/shipping/labels/minimal/:id?format=html
 */
router.get('/labels/minimal/:id', authMiddleware, adminMiddleware, generateMinimalLabelController);

/**
 * สร้าง 4 minimal labels ใน A4 เดียว
 * POST /api/shipping/labels/4up
 */
router.post('/labels/4up', authMiddleware, adminMiddleware, generate4UpLabelsController);

// ============================================
// 🏷️ ORIGINAL LABEL GENERATION ROUTES 
// ============================================

/**
 * สร้าง shipping label รายบุคคล (เวอร์ชันเต็ม)
 * GET /api/shipping/labels/single/:id?format=html&includeQR=false
 */
router.get('/labels/single/:id', authMiddleware, adminMiddleware, generateSingleLabelController);

/**
 * สร้าง bulk shipping labels (เวอร์ชันเต็ม)
 * POST /api/shipping/labels/bulk
 */
router.post('/labels/bulk', authMiddleware, adminMiddleware, generateBulkLabelsController);

/**
 * สร้าง shipping summary report
 * POST /api/shipping/summary
 */
router.post('/summary', authMiddleware, adminMiddleware, generateShippingSummaryController);

// ============================================
// 🔧 SHIPPING UTILITIES (Admin Only)
// ============================================

/**
 * เช็คและแจ้งเตือนการจัดส่งที่ค้างนาน
 * GET /api/shipping/overdue?days=7
 */
router.get('/overdue', authMiddleware, adminMiddleware, checkOverdueShipmentsController);

/**
 * ดึงรายงานการจัดส่ง (General)
 * GET /api/shipping/reports?period=weekly&startDate=&endDate=
 */
router.get('/reports', authMiddleware, adminMiddleware, getShippingReportsController);

// ============================================
// 🔍 TESTING & INFO ROUTES
// ============================================

/**
 * ทดสอบ API
 * GET /api/shipping/test
 */
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shipping API is working! 🚚',
    timestamp: new Date(),
    availableRoutes: {
      // 🚀 Reports & Export (NEW)
      reportsAndExport: [
        'GET /api/shipping/reports/detailed',     // รายงานการจัดส่งแบบละเอียด
        'GET /api/shipping/reports/summary',      // สรุปรายงานการจัดส่ง
        'GET /api/shipping/export/excel',         // Export รายงานการจัดส่ง
        'GET /api/shipping/export/shipping-list'  // Export รายชื่อที่ต้องจัดส่ง
      ],
      
      // Label Generation
      labelGeneration: [
        'GET /api/shipping/labels/minimal/:id',
        'POST /api/shipping/labels/4up',
        'GET /api/shipping/labels/single/:id',
        'POST /api/shipping/labels/bulk',
        'POST /api/shipping/summary'
      ],
      
      // Utilities
      utilities: [
        'GET /api/shipping/overdue',
        'GET /api/shipping/reports'
      ]
    }
  });
});

/**
 * 🎯 API Usage Examples
 * GET /api/shipping/examples
 */
router.get('/examples', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shipping API Usage Examples 📋',
    
    // 📊 รายงานการจัดส่ง
    shippingReports: {
      title: '📊 รายงานการจัดส่ง',
      examples: [
        {
          description: 'รายชื่อคนที่ต้องจัดส่ง',
          url: '/api/shipping/reports/detailed?shippingStatus=รอการจัดส่ง',
          note: 'เฉพาะคนที่เลือก "จัดส่งทางไปรษณีย์" และยังไม่ได้จัดส่ง'
        },
        {
          description: 'รายชื่อคนที่จัดส่งแล้ว',
          url: '/api/shipping/reports/detailed?shippingStatus=จัดส่งแล้ว',
          note: 'คนที่จัดส่งเรียบร้อยแล้ว'
        },
        {
          description: 'รายงานตามแผนกวิชา',
          url: '/api/shipping/reports/detailed?department=เทคโนโลยีสารสนเทศ',
          note: 'การจัดส่งของแผนกเฉพาะ'
        }
      ]
    },
    
    // 📤 Export Excel
    excelExports: {
      title: '📤 Export เป็น Excel',
      examples: [
        {
          description: 'Export รายชื่อที่ต้องจัดส่ง',
          url: '/api/shipping/export/shipping-list?fileName=ต้องจัดส่ง.xlsx',
          note: 'เฉพาะคนที่ยังรอการจัดส่ง'
        },
        {
          description: 'Export รายงานการจัดส่งทั้งหมด',
          url: '/api/shipping/export/excel?fileName=รายงานการจัดส่ง.xlsx',
          note: '3 Sheets: รายการ + สถิติ + แยกตามแผนก'
        }
      ]
    },
    
    // 🎯 Business Cases
    businessCases: {
      title: '🎯 กรณีการใช้งาน',
      cases: [
        {
          case: 'ต้องการรายชื่อคนที่ต้องจัดส่งพัสดุ',
          solution: 'GET /api/shipping/reports/detailed?shippingStatus=รอการจัดส่ง',
          export: 'GET /api/shipping/export/shipping-list'
        },
        {
          case: 'ต้องการดูสถิติการจัดส่งของแต่ละแผนก',
          solution: 'GET /api/shipping/reports/detailed (ดู departmentShipping)',
          export: 'GET /api/shipping/export/excel'
        },
        {
          case: 'ต้องการรายงานสมาชิกทั้งหมด (ทั้งรับเอง + จัดส่ง)',
          solution: 'GET /api/alumni/reports/all-members',
          export: 'GET /api/alumni/export/all-members-excel'
        }
      ]
    }
  });
});

export default router;