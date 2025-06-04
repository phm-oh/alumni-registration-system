// Path: src/features/alumni/alumni.routes.js
// ไฟล์: alumni.routes.js - เพิ่ม Routes สำหรับรายงานสมาชิกทั้งหมด (Final Version)

import express from 'express';
import {
  registerAlumni,
  checkRegistrationStatusController,
  uploadPaymentProofController,
  getAllAlumniController,
  getAlumniByIdController,
  updateAlumniStatusController,
  updateAlumniPositionController,
  getStatisticsController,
  getDepartmentsController,
  getGraduationYearsController,
  // 🚀 เพิ่ม shipping controllers
  getShippingListController,
  updateShippingStatusController,
  bulkUpdateShippingController,
  getShippingStatisticsController,
  trackShipmentController
} from './alumni.controller.js';

// 🚀 Import Export Controllers
import {
  exportAlumniToExcelController
} from './shipping.export.controller.js';

// 🚀 Import Complete Members Report Controllers
import {
  getAllMembersReportController,
  exportAllMembersToExcelController
} from './members.report.controller.js';

import { upload } from '../../utils/upload.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// 📋 Routes สำหรับผู้ใช้ทั่วไป (Public)
// ============================================

// ลงทะเบียนศิษย์เก่า (รองรับการอัปโหลดหลายไฟล์)
router.post('/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 }
]), registerAlumni);

// ตรวจสอบสถานะการลงทะเบียน (รวมข้อมูลการจัดส่ง)
router.post('/check-status', checkRegistrationStatusController);

// อัปโหลดหลักฐานการชำระเงิน
router.post('/upload-payment', upload.single('paymentProof'), uploadPaymentProofController);

// ค้นหาการจัดส่งด้วยเลขติดตาม (Public API) - ไว้ก่อน /:id
router.get('/track/:trackingNumber', trackShipmentController);

// ============================================
// 🔒 Routes สำหรับ Admin (ต้องยืนยันตัวตน)
// ============================================

// 🚀 === SPECIFIC ROUTES FIRST (ไว้ก่อน /:id) === 🚀

// === ข้อมูลพื้นฐาน ===
router.get('/statistics', authMiddleware, adminMiddleware, getStatisticsController);
router.get('/departments', authMiddleware, adminMiddleware, getDepartmentsController);
router.get('/graduation-years', authMiddleware, adminMiddleware, getGraduationYearsController);

// === การจัดการการจัดส่ง ===
router.get('/shipping-list', authMiddleware, adminMiddleware, getShippingListController);
router.get('/shipping-statistics', authMiddleware, adminMiddleware, getShippingStatisticsController);
router.post('/bulk-shipping', authMiddleware, adminMiddleware, bulkUpdateShippingController);

// 🚀 === REPORTS & EXPORT ROUTES === 🚀

/**
 * รายงานสมาชิกทั้งหมด (ทั้งรับเองและจัดส่ง)
 * GET /api/alumni/reports/all-members?status=อนุมัติ&deliveryOption=จัดส่งทางไปรษณีย์
 */
router.get('/reports/all-members', authMiddleware, adminMiddleware, getAllMembersReportController);

/**
 * Export รายงานสมาชิกทั้งหมดเป็น Excel (หลาย Sheet)
 * GET /api/alumni/export/all-members-excel?status=อนุมัติ&fileName=all-members-2025.xlsx
 */
router.get('/export/all-members-excel', authMiddleware, adminMiddleware, exportAllMembersToExcelController);

/**
 * Export ข้อมูลศิษย์เก่าเป็น Excel (เดิม - สำหรับการจัดการทั่วไป)
 * GET /api/alumni/export/excel?status=อนุมัติ&department=เทคโนโลยีสารสนเทศ
 */
router.get('/export/excel', authMiddleware, adminMiddleware, exportAlumniToExcelController);

// 🚀 === PARAMETERIZED ROUTES LAST (หลังสุด) === 🚀

// === ข้อมูลศิษย์เก่าทั่วไป ===
router.get('/', authMiddleware, adminMiddleware, getAllAlumniController);
router.get('/:id', authMiddleware, adminMiddleware, getAlumniByIdController);

// === จัดการสถานะและตำแหน่ง ===
router.patch('/:id/status', authMiddleware, adminMiddleware, updateAlumniStatusController);
router.patch('/:id/position', authMiddleware, adminMiddleware, updateAlumniPositionController);

// === จัดการการจัดส่งรายบุคคล ===
router.patch('/:id/shipping', authMiddleware, adminMiddleware, updateShippingStatusController);

// ============================================
// 🔍 Testing & Info Routes
// ============================================

/**
 * ทดสอบ Alumni API
 * GET /api/alumni/test-api
 */
router.get('/test-api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Alumni API is working! 🎓',
    availableRoutes: {
      // Public Routes
      public: [
        'POST /api/alumni/register',
        'POST /api/alumni/check-status',
        'POST /api/alumni/upload-payment',
        'GET /api/alumni/track/:trackingNumber'
      ],
      
      // Admin Routes - Data Management
      dataManagement: [
        'GET /api/alumni/',
        'GET /api/alumni/:id',
        'PATCH /api/alumni/:id/status',
        'PATCH /api/alumni/:id/position',
        'PATCH /api/alumni/:id/shipping'
      ],
      
      // Admin Routes - Statistics & Info
      statistics: [
        'GET /api/alumni/statistics',
        'GET /api/alumni/departments',
        'GET /api/alumni/graduation-years'
      ],
      
      // Admin Routes - Shipping Management
      shipping: [
        'GET /api/alumni/shipping-list',
        'GET /api/alumni/shipping-statistics', 
        'POST /api/alumni/bulk-shipping'
      ],
      
      // 🚀 Admin Routes - Reports & Export
      reports: [
        'GET /api/alumni/reports/all-members',        // รายงานสมาชิกทั้งหมด
        'GET /api/alumni/export/all-members-excel',   // Export สมาชิกทั้งหมด
        'GET /api/alumni/export/excel'                // Export ทั่วไป
      ]
    },
    timestamp: new Date(),
    
    // 🎯 Feature Summary
    features: {
      '📊 รายงานสมาชิกทั้งหมด': {
        description: 'รายงานครบถ้วนทั้งคนรับเองและจัดส่ง',
        endpoint: '/api/alumni/reports/all-members',
        filters: ['status', 'deliveryOption', 'department', 'graduationYear']
      },
      '📤 Export Excel สมาชิกทั้งหมด': {
        description: 'Export หลาย Sheet: ข้อมูล + สถิติ + การเงิน',
        endpoint: '/api/alumni/export/all-members-excel',
        sheets: ['สมาชิกทั้งหมด', 'แยกตามการรับ', 'สถิติสมาชิก', 'สรุปการเงิน']
      },
      '🚚 รายงานการจัดส่ง': {
        description: 'เฉพาะคนที่เลือกจัดส่งทางไปรษณีย์',
        endpoint: '/api/shipping/reports/detailed',
        note: 'ดูใน shipping.routes.js'
      }
    }
  });
});

/**
 * API Information
 * GET /api/alumni/info
 */
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Alumni Management System API Information',
    system: {
      name: 'Alumni Registration & Management System',
      version: '2.1.0',
      description: 'ระบบจัดการสมาชิกศิษย์เก่า พร้อมระบบจัดส่งและรายงาน'
    },
    dataTypes: {
      'สมาชิกทั้งหมด': {
        description: 'สมาชิกที่อนุมัติแล้วทั้งหมด (ทั้งรับเองและจัดส่ง)',
        count: 'ใช้ /api/alumni/reports/all-members',
        export: 'ใช้ /api/alumni/export/all-members-excel'
      },
      'คนที่ต้องจัดส่ง': {
        description: 'เฉพาะคนที่เลือก "จัดส่งทางไปรษณีย์" (จ่าย 230 บาท)',
        count: 'ใช้ /api/shipping/reports/detailed',
        export: 'ใช้ /api/shipping/export/excel'
      }
    },
    businessLogic: {
      'จ่าย 200 บาท': 'รับที่วิทยาลัย → ไม่ต้องจัดส่ง',
      'จ่าย 230 บาท': 'จัดส่งทางไปรษณีย์ → ต้องจัดส่ง'
    }
  });
});

// ============================================
// 📋 Route Order Documentation
// ============================================
/*
⚠️ IMPORTANT: Route Order Matters!

CORRECT ORDER:
1. Static routes (exact match)
   - /statistics
   - /departments 
   - /graduation-years
   - /shipping-list
   - /shipping-statistics
   - /reports/all-members (🚀 NEW)
   - /export/all-members-excel (🚀 NEW)
   - /export/excel

2. POST routes
   - /register
   - /check-status
   - /bulk-shipping

3. Parameterized routes (LAST!)
   - /:id
   - /:id/status
   - /:id/shipping
   - /track/:trackingNumber

🎯 URL EXAMPLES:
- /api/alumni/reports/all-members      → getAllMembersReportController
- /api/alumni/export/all-members-excel → exportAllMembersToExcelController
- /api/alumni/export/excel             → exportAlumniToExcelController
- /api/alumni/shipping-list            → getShippingListController
- /api/alumni/statistics               → getStatisticsController  
- /api/alumni/60f7b123.../shipping     → updateShippingStatusController
- /api/alumni/60f7b123...              → getAlumniByIdController

📊 REPORT TYPES:
1. 📋 รายงานสมาชิกทั้งหมด:     /api/alumni/reports/all-members
2. 🚚 รายงานการจัดส่ง:         /api/shipping/reports/detailed

📤 EXPORT TYPES:
1. 📊 สมาชิกทั้งหมด (4 Sheets): /api/alumni/export/all-members-excel
2. 🚚 การจัดส่ง (3 Sheets):    /api/shipping/export/excel
3. 📋 ข้อมูลทั่วไป (2 Sheets):  /api/alumni/export/excel
*/

export default router;