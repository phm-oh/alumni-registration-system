// Path: src/features/financial/financial.routes.js
// ไฟล์: financial.routes.js - API Routes สำหรับระบบการเงิน

import express from 'express';
import {
  // Expense Controllers
  createExpenseController,
  getExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  updateExpenseStatusController,
  deleteExpenseController,
  
  // Financial Period Controllers
  getFinancialPeriodsController,
  getCurrentFinancialPeriodController,
  calculateFinancialPeriodController,
  
  // Dashboard & Statistics Controllers
  getFinancialDashboardController,
  getRevenueStatisticsController,
  getExpenseStatisticsController,
  getFinancialReportsController,
  
  // Export & Utility Controllers
  exportFinancialDataController,
  getPendingPaymentsController,
  getFinancialOptionsController,
  getFinancialSummaryController
} from './financial.controller.js';

import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';
import { upload } from '../../utils/upload.js';

const router = express.Router();

// ============================================
// 🔒 ทุก route ต้องผ่าน authentication
// ============================================
router.use(authMiddleware);

// ============================================
// 📊 DASHBOARD & SUMMARY ROUTES (ดูได้ทุกคน)
// ============================================

/**
 * สรุปข้อมูลการเงินแบบย่อ
 * GET /api/financial/summary
 */
router.get('/summary', getFinancialSummaryController);

/**
 * Dashboard การเงินครบถ้วน
 * GET /api/financial/dashboard
 */
router.get('/dashboard', getFinancialDashboardController);

/**
 * ตัวเลือกสำหรับ UI (หมวดหมู่, สถานะ, ปี, เดือน)
 * GET /api/financial/options
 */
router.get('/options', getFinancialOptionsController);

// ============================================
// 💰 EXPENSE ROUTES (ต้องเป็น admin)
// ============================================

/**
 * ดึงรายจ่ายทั้งหมด (พร้อม filters)
 * GET /api/financial/expenses?category=ค่าจัดส่ง&status=รอดำเนินการ&page=1&limit=20
 */
router.get('/expenses', adminMiddleware, getExpensesController);

/**
 * สร้างรายจ่ายใหม่ (พร้อมอัปโหลดใบเสร็จ)
 * POST /api/financial/expenses
 * Body: { title, description, amount, category, date }
 * File: receipt (optional)
 */
router.post('/expenses', adminMiddleware, upload.single('receipt'), createExpenseController);

/**
 * ดึงรายจ่ายตาม ID
 * GET /api/financial/expenses/:id
 */
router.get('/expenses/:id', adminMiddleware, getExpenseByIdController);

/**
 * อัปเดตรายจ่าย (พร้อมอัปโหลดใบเสร็จใหม่)
 * PUT /api/financial/expenses/:id
 * Body: { title, description, amount, category, date }
 * File: receipt (optional)
 */
router.put('/expenses/:id', adminMiddleware, upload.single('receipt'), updateExpenseController);

/**
 * อนุมัติ/ปฏิเสธรายจ่าย
 * PATCH /api/financial/expenses/:id/status
 * Body: { status: 'อนุมัติ'|'ปฏิเสธ'|'ชำระแล้ว', notes: 'เหตุผล' }
 */
router.patch('/expenses/:id/status', adminMiddleware, updateExpenseStatusController);

/**
 * ลบรายจ่าย
 * DELETE /api/financial/expenses/:id
 */
router.delete('/expenses/:id', adminMiddleware, deleteExpenseController);

// ============================================
// 📅 FINANCIAL PERIOD ROUTES (admin only)
// ============================================

/**
 * ดึงข้อมูล Financial Periods
 * GET /api/financial/periods?year=2025&month=1&isCalculated=true
 */
router.get('/periods', adminMiddleware, getFinancialPeriodsController);

/**
 * ดึง Financial Period ปัจจุบัน
 * GET /api/financial/periods/current
 */
router.get('/periods/current', adminMiddleware, getCurrentFinancialPeriodController);

/**
 * คำนวณ Financial Period
 * POST /api/financial/periods/calculate
 * Body: { year: 2025, month: 1 }
 */
router.post('/periods/calculate', adminMiddleware, calculateFinancialPeriodController);

// ============================================
// 📈 STATISTICS ROUTES (admin only)
// ============================================

/**
 * สถิติรายรับ
 * GET /api/financial/statistics/revenue?startDate=2025-01-01&endDate=2025-01-31
 */
router.get('/statistics/revenue', adminMiddleware, getRevenueStatisticsController);

/**
 * สถิติรายจ่าย
 * GET /api/financial/statistics/expenses?startDate=2025-01-01&endDate=2025-01-31
 */
router.get('/statistics/expenses', adminMiddleware, getExpenseStatisticsController);

// ============================================
// 📊 REPORTS ROUTES (admin only)
// ============================================

/**
 * สร้างรายงานการเงิน
 * GET /api/financial/reports?type=summary&startDate=2025-01-01&endDate=2025-01-31
 * Types: summary (default), revenue, expenses
 */
router.get('/reports', adminMiddleware, getFinancialReportsController);

// ============================================
// 📤 EXPORT ROUTES (admin only)
// ============================================

/**
 * Export ข้อมูลการเงิน
 * GET /api/financial/export?type=expenses&format=json&startDate=2025-01-01&endDate=2025-01-31
 * Types: expenses, revenue, periods
 * Formats: json (csv, excel ในอนาคต)
 */
router.get('/export', adminMiddleware, exportFinancialDataController);

// ============================================
// 💸 PENDING PAYMENTS ROUTES (admin only)
// ============================================

/**
 * ดึงรายการค้างชำระ
 * GET /api/financial/pending-payments
 */
router.get('/pending-payments', adminMiddleware, getPendingPaymentsController);

// ============================================
// 🔧 MAINTENANCE ROUTES (admin only)
// ============================================

/**
 * คำนวณ Financial Period ทั้งหมดใหม่ (สำหรับ maintenance)
 * POST /api/financial/recalculate-all
 * Body: { year?: number, confirm: true }
 */
router.post('/recalculate-all', adminMiddleware, async (req, res) => {
  try {
    const { year, confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'กรุณายืนยันการคำนวณใหม่ด้วย confirm: true'
      });
    }
    
    const targetYear = year || new Date().getFullYear();
    const results = [];
    
    // คำนวณทุกเดือนในปีที่ระบุ
    for (let month = 1; month <= 12; month++) {
      try {
        const { calculateFinancialPeriod } = await import('./financial.service.js');
        const period = await calculateFinancialPeriod(targetYear, month, req.user.id);
        results.push({
          year: targetYear,
          month,
          success: true,
          revenue: period.totalRevenue,
          expenses: period.totalExpenses,
          netProfit: period.netProfit
        });
      } catch (error) {
        results.push({
          year: targetYear,
          month,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return res.status(200).json({
      success: true,
      message: `คำนวณใหม่เสร็จสิ้น: สำเร็จ ${successCount}/12 เดือน`,
      data: {
        year: targetYear,
        results,
        summary: {
          total: 12,
          success: successCount,
          failed: 12 - successCount
        }
      }
    });
  } catch (error) {
    console.error('Error in recalculate-all:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการคำนวณใหม่',
      error: error.message
    });
  }
});

/**
 * ทดสอบการเชื่อมต่อ Financial API
 * GET /api/financial/test
 */
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Financial API is working! 💰',
    timestamp: new Date(),
    user: {
      id: req.user.id,
      role: req.user.role
    },
    availableEndpoints: [
      'GET /api/financial/summary',
      'GET /api/financial/dashboard',
      'GET /api/financial/options',
      'GET /api/financial/expenses',
      'POST /api/financial/expenses',
      'GET /api/financial/periods',
      'POST /api/financial/periods/calculate',
      'GET /api/financial/statistics/revenue',
      'GET /api/financial/statistics/expenses',
      'GET /api/financial/reports',
      'GET /api/financial/export',
      'GET /api/financial/pending-payments'
    ]
  });
});

// ============================================
// 📋 Route Documentation & Examples
// ============================================
/*
🔥 FINANCIAL API ROUTES DOCUMENTATION

📊 DASHBOARD ROUTES:
GET /api/financial/summary                     # สรุปข้อมูลการเงินแบบย่อ
GET /api/financial/dashboard                   # Dashboard การเงินครบถ้วน
GET /api/financial/options                     # ตัวเลือกสำหรับ UI

💰 EXPENSE MANAGEMENT:
GET    /api/financial/expenses                 # ดึงรายจ่าย (ใช้ filters ได้)
POST   /api/financial/expenses                 # สร้างรายจ่าย + อัปโหลดใบเสร็จ
GET    /api/financial/expenses/:id             # ดึงรายจ่ายตาม ID
PUT    /api/financial/expenses/:id             # แก้ไขรายจ่าย
PATCH  /api/financial/expenses/:id/status      # อนุมัติ/ปฏิเสธรายจ่าย
DELETE /api/financial/expenses/:id             # ลบรายจ่าย

📅 FINANCIAL PERIODS:
GET  /api/financial/periods                    # ดึง periods ทั้งหมด
GET  /api/financial/periods/current            # Period ปัจจุบัน
POST /api/financial/periods/calculate          # คำนวณ period

📈 STATISTICS & REPORTS:
GET /api/financial/statistics/revenue          # สถิติรายรับ
GET /api/financial/statistics/expenses         # สถิติรายจ่าย
GET /api/financial/reports                     # รายงานการเงิน

📤 EXPORT & UTILITIES:
GET /api/financial/export                      # Export ข้อมูล
GET /api/financial/pending-payments            # รายการค้างชำระ

🔧 MAINTENANCE:
POST /api/financial/recalculate-all            # คำนวณใหม่ทั้งหมด
GET  /api/financial/test                       # ทดสอบ API

🎯 EXAMPLE REQUESTS:

1. สร้างรายจ่าย:
POST /api/financial/expenses
Content-Type: multipart/form-data
{
  "title": "ค่าจัดส่งพัสดุ",
  "description": "ค่าจัดส่งบัตรสมาชิกประจำเดือน",
  "amount": 500,
  "category": "ค่าจัดส่ง",
  "date": "2025-01-15"
}
File: receipt

2. ดึงรายจ่าย (พร้อม filters):
GET /api/financial/expenses?category=ค่าจัดส่ง&status=รอดำเนินการ&page=1&limit=20&startDate=2025-01-01&endDate=2025-01-31

3. สถิติรายรับ:
GET /api/financial/statistics/revenue?startDate=2025-01-01&endDate=2025-01-31

4. Export รายจ่าย:
GET /api/financial/export?type=expenses&format=json&startDate=2025-01-01&endDate=2025-01-31

🔐 AUTHENTICATION:
- ทุก route ต้องมี Authorization: Bearer <jwt_token>
- Dashboard routes: ใช้ได้ทุกคน (auth required)
- Admin routes: ต้องเป็น admin role
*/

export default router;