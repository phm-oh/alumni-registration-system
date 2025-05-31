// Path: src/features/alumni/alumni.routes.js
// ไฟล์: alumni.routes.js - แก้ไข Route Ordering เพื่อป้องกัน Route Conflict

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
// 📋 Route Order Documentation
// ============================================
/*
⚠️ IMPORTANT: Route Order Matters!

CORRECT ORDER:
1. Static routes (exact match)
   - /statistics
   - /departments 
   - /shipping-list
   - /shipping-statistics

2. POST routes
   - /register
   - /check-status
   - /bulk-shipping

3. Parameterized routes (LAST!)
   - /:id
   - /:id/status
   - /:id/shipping
   - /track/:trackingNumber

❌ WRONG ORDER:
router.get('/:id', ...)           // This will catch everything!
router.get('/shipping-list', ...) // This will never be reached!

✅ CORRECT ORDER:  
router.get('/shipping-list', ...) // Specific route first
router.get('/:id', ...)           // Parameterized route last

🎯 URL EXAMPLES:
- /api/alumni/shipping-list       → getShippingListController
- /api/alumni/statistics          → getStatisticsController  
- /api/alumni/60f7b123.../shipping → updateShippingStatusController
- /api/alumni/60f7b123...         → getAlumniByIdController
- /api/alumni/track/TH123456789   → trackShipmentController
*/

export default router;