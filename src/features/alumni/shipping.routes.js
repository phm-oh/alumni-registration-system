// Path: src/features/alumni/shipping.routes.js
// ไฟล์: shipping.routes.js - Routes สำหรับ shipping และ label generation

import express from 'express';
import {
  // Label Generation (Original)
  generateSingleLabelController,
  generateBulkLabelsController,
  generateShippingSummaryController,
  
  // 🚀 Minimal Label Generation (New)
  generateMinimalLabelController,
  generate4UpLabelsController,
  
  // Utilities
  checkOverdueShipmentsController,
  getShippingReportsController
} from './shipping.controller.js';

import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// 🚀 MINIMAL LABEL GENERATION ROUTES (NEW)
// ============================================

/**
 * สร้าง minimal shipping label รายบุคคล
 * GET /api/shipping/labels/minimal/:id?format=html
 */
router.get('/labels/minimal/:id', authMiddleware, adminMiddleware, generateMinimalLabelController);

/**
 * สร้าง 4 minimal labels ใน A4 เดียว
 * POST /api/shipping/labels/4up
 * Body: { alumniIds: [] } (สูงสุด 4 คน)
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
 * Body: { alumniIds: [], format: "html", batchNumber: "", logoUrl: "", companyName: "" }
 */
router.post('/labels/bulk', authMiddleware, adminMiddleware, generateBulkLabelsController);

/**
 * สร้าง shipping summary report
 * POST /api/shipping/summary
 * Body: { alumniIds: [], batchNumber: "", preparedBy: "", notes: "", format: "html" }
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
 * ดึงรายงานการจัดส่ง
 * GET /api/shipping/reports?period=weekly&startDate=&endDate=
 */
router.get('/reports', authMiddleware, adminMiddleware, getShippingReportsController);

// ============================================
// 🔍 TESTING ROUTE (สำหรับทดสอบ)
// ============================================

/**
 * ทดสอบ API
 * GET /api/shipping/test
 */
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shipping API is working!',
    availableRoutes: [
      'GET /api/shipping/labels/minimal/:id',
      'POST /api/shipping/labels/4up',
      'GET /api/shipping/labels/single/:id',
      'POST /api/shipping/labels/bulk',
      'POST /api/shipping/summary',
      'GET /api/shipping/overdue',
      'GET /api/shipping/reports'
    ],
    timestamp: new Date()
  });
});

export default router;