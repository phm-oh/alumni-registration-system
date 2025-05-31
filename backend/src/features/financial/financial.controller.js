// Path: src/features/financial/financial.controller.js
// ไฟล์: financial.controller.js - Request Handlers สำหรับระบบการเงิน

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  updateExpenseStatus,
  deleteExpense,
  getFinancialPeriods,
  getCurrentFinancialPeriod,
  calculateFinancialPeriod,
  getFinancialDashboard,
  getRevenueStatistics,
  getExpenseStatistics,
  getExportData
} from './financial.service.js';

// ===============================================
// 💰 EXPENSE CONTROLLERS
// ===============================================

/**
 * สร้างรายจ่ายใหม่
 * POST /api/financial/expenses
 */
export const createExpenseController = async (req, res) => {
  try {
    const receiptFile = req.file;
    const expense = await createExpense(req.body, receiptFile, req.user.id);
    
    return res.status(201).json({
      success: true,
      message: 'สร้างรายจ่ายสำเร็จ',
      data: expense
    });
  } catch (error) {
    console.error('Error in createExpense:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้างรายจ่าย'
    });
  }
};

/**
 * ดึงรายจ่ายทั้งหมด (พร้อม filters)
 * GET /api/financial/expenses
 */
export const getExpensesController = async (req, res) => {
  try {
    const {
      category,
      status,
      createdBy,
      startDate,
      endDate,
      search,
      page,
      limit,
      sort
    } = req.query;
    
    const filters = {
      category,
      status,
      createdBy,
      startDate,
      endDate,
      search
    };
    
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      sort: sort ? JSON.parse(sort) : { createdAt: -1 }
    };
    
    const results = await getExpenses(filters, options);
    
    return res.status(200).json({
      success: true,
      message: 'ดึงรายจ่ายสำเร็จ',
      ...results
    });
  } catch (error) {
    console.error('Error in getExpenses:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายจ่าย',
      error: error.message
    });
  }
};

/**
 * ดึงรายจ่ายตาม ID
 * GET /api/financial/expenses/:id
 */
export const getExpenseByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await getExpenseById(id);
    
    return res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error in getExpenseById:', error);
    return res.status(error.message.includes('ไม่พบ') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงรายจ่าย'
    });
  }
};

/**
 * อัปเดตรายจ่าย
 * PUT /api/financial/expenses/:id
 */
export const updateExpenseController = async (req, res) => {
  try {
    const { id } = req.params;
    const receiptFile = req.file;
    
    const expense = await updateExpense(id, req.body, receiptFile, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตรายจ่ายสำเร็จ',
      data: expense
    });
  } catch (error) {
    console.error('Error in updateExpense:', error);
    return res.status(error.message.includes('ไม่พบ') ? 404 : 400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตรายจ่าย'
    });
  }
};

/**
 * อนุมัติ/ปฏิเสธรายจ่าย
 * PATCH /api/financial/expenses/:id/status
 */
export const updateExpenseStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสถานะ'
      });
    }
    
    const expense = await updateExpenseStatus(id, status, notes, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะรายจ่ายสำเร็จ',
      data: expense
    });
  } catch (error) {
    console.error('Error in updateExpenseStatus:', error);
    return res.status(error.message.includes('ไม่พบ') ? 404 : 400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะรายจ่าย'
    });
  }
};

/**
 * ลบรายจ่าย
 * DELETE /api/financial/expenses/:id
 */
export const deleteExpenseController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await deleteExpense(id, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'ลบรายจ่ายสำเร็จ',
      data: expense
    });
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    return res.status(error.message.includes('ไม่พบ') ? 404 : 400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลบรายจ่าย'
    });
  }
};

// ===============================================
// 📊 FINANCIAL PERIOD CONTROLLERS
// ===============================================

/**
 * ดึงข้อมูล Financial Periods
 * GET /api/financial/periods
 */
export const getFinancialPeriodsController = async (req, res) => {
  try {
    const { year, month, isCalculated, page, limit, sort } = req.query;
    
    const filters = {
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      isCalculated: isCalculated !== undefined ? isCalculated === 'true' : undefined
    };
    
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
      sort: sort ? JSON.parse(sort) : { year: -1, month: -1 }
    };
    
    const results = await getFinancialPeriods(filters, options);
    
    return res.status(200).json({
      success: true,
      message: 'ดึงข้อมูล Financial Periods สำเร็จ',
      ...results
    });
  } catch (error) {
    console.error('Error in getFinancialPeriods:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Financial Periods',
      error: error.message
    });
  }
};

/**
 * ดึง Financial Period ปัจจุบัน
 * GET /api/financial/periods/current
 */
export const getCurrentFinancialPeriodController = async (req, res) => {
  try {
    const period = await getCurrentFinancialPeriod();
    
    return res.status(200).json({
      success: true,
      data: period
    });
  } catch (error) {
    console.error('Error in getCurrentFinancialPeriod:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Financial Period ปัจจุบัน',
      error: error.message
    });
  }
};

/**
 * คำนวณ Financial Period
 * POST /api/financial/periods/calculate
 */
export const calculateFinancialPeriodController = async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุปีและเดือน'
      });
    }
    
    const period = await calculateFinancialPeriod(
      parseInt(year), 
      parseInt(month), 
      req.user.id
    );
    
    return res.status(200).json({
      success: true,
      message: 'คำนวณ Financial Period สำเร็จ',
      data: period
    });
  } catch (error) {
    console.error('Error in calculateFinancialPeriod:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการคำนวณ Financial Period'
    });
  }
};

// ===============================================
// 📈 DASHBOARD & STATISTICS CONTROLLERS
// ===============================================

/**
 * ดึงข้อมูล Dashboard การเงิน
 * GET /api/financial/dashboard
 */
export const getFinancialDashboardController = async (req, res) => {
  try {
    const dashboard = await getFinancialDashboard();
    
    return res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error in getFinancialDashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard การเงิน',
      error: error.message
    });
  }
};

/**
 * ดึงสถิติรายรับ
 * GET /api/financial/statistics/revenue
 */
export const getRevenueStatisticsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const statistics = await getRevenueStatistics(startDate, endDate);
    
    return res.status(200).json({
      success: true,
      message: 'ดึงสถิติรายรับสำเร็จ',
      data: statistics
    });
  } catch (error) {
    console.error('Error in getRevenueStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติรายรับ',
      error: error.message
    });
  }
};

/**
 * ดึงสถิติรายจ่าย
 * GET /api/financial/statistics/expenses
 */
export const getExpenseStatisticsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const statistics = await getExpenseStatistics(startDate, endDate);
    
    return res.status(200).json({
      success: true,
      message: 'ดึงสถิติรายจ่ายสำเร็จ',
      data: statistics
    });
  } catch (error) {
    console.error('Error in getExpenseStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติรายจ่าย',
      error: error.message
    });
  }
};

/**
 * สรุปรายงานการเงิน
 * GET /api/financial/reports
 */
export const getFinancialReportsController = async (req, res) => {
  try {
    const { startDate, endDate, type = 'summary' } = req.query;
    
    let reportData = {};
    
    switch (type) {
      case 'summary':
        const [dashboard, revenueStats, expenseStats] = await Promise.all([
          getFinancialDashboard(),
          getRevenueStatistics(startDate, endDate),
          getExpenseStatistics(startDate, endDate)
        ]);
        
        reportData = {
          dashboard,
          revenue: revenueStats,
          expenses: expenseStats,
          period: {
            startDate,
            endDate,
            generatedAt: new Date()
          }
        };
        break;
        
      case 'revenue':
        reportData = await getRevenueStatistics(startDate, endDate);
        break;
        
      case 'expenses':
        reportData = await getExpenseStatistics(startDate, endDate);
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'ประเภทรายงานไม่ถูกต้อง'
        });
    }
    
    return res.status(200).json({
      success: true,
      message: 'สร้างรายงานการเงินสำเร็จ',
      data: reportData
    });
  } catch (error) {
    console.error('Error in getFinancialReports:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างรายงานการเงิน',
      error: error.message
    });
  }
};

// ===============================================
// 📤 EXPORT CONTROLLERS
// ===============================================

/**
 * Export ข้อมูลการเงิน
 * GET /api/financial/export
 */
export const exportFinancialDataController = async (req, res) => {
  try {
    const { 
      type = 'expenses',
      format = 'json',
      startDate,
      endDate,
      category,
      status
    } = req.query;
    
    if (!['expenses', 'revenue', 'periods'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'ประเภทการ Export ไม่ถูกต้อง (expenses, revenue, periods)'
      });
    }
    
    const filters = {
      startDate,
      endDate,
      category,
      status
    };
    
    const exportData = await getExportData(type, filters);
    
    if (format === 'json') {
      return res.status(200).json({
        success: true,
        message: `Export ${type} สำเร็จ`,
        data: exportData,
        meta: {
          exportedAt: new Date(),
          recordCount: exportData.length,
          filters
        }
      });
    }
    
    // TODO: เพิ่ม CSV/Excel export ในอนาคต
    return res.status(400).json({
      success: false,
      message: 'รองรับเฉพาะ JSON format ในขณะนี้'
    });
    
  } catch (error) {
    console.error('Error in exportFinancialData:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ Export ข้อมูล',
      error: error.message
    });
  }
};

// ===============================================
// 💸 PENDING PAYMENTS CONTROLLER
// ===============================================

/**
 * ดึงรายการค้างชำระ
 * GET /api/financial/pending-payments
 */
export const getPendingPaymentsController = async (req, res) => {
  try {
    // ใช้ Alumni service ที่มีอยู่
    const { getAllAlumni } = await import('../alumni/alumni.service.js');
    
    const filters = {
      status: 'รอการชำระเงิน'
    };
    
    const options = {
      page: 1,
      limit: 1000,
      sort: { createdAt: -1 }
    };
    
    const results = await getAllAlumni(filters, options);
    
    // คำนวณสถิติ
    const totalUnpaid = results.data.reduce((sum, alumni) => sum + alumni.totalAmount, 0);
    const overdueCount = results.data.filter(alumni => {
      const daysSinceRegistration = Math.floor(
        (new Date() - new Date(alumni.registrationDate)) / (1000 * 60 * 60 * 24)
      );
      return daysSinceRegistration > 7; // ถือว่าค้างเกิน 7 วัน
    }).length;
    
    return res.status(200).json({
      success: true,
      message: 'ดึงรายการค้างชำระสำเร็จ',
      data: results.data,
      summary: {
        totalUnpaidAmount: totalUnpaid,
        unpaidCount: results.total,
        overdueCount
      }
    });
  } catch (error) {
    console.error('Error in getPendingPayments:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการค้างชำระ',
      error: error.message
    });
  }
};

// ===============================================
// 🔧 UTILITY CONTROLLERS
// ===============================================

/**
 * ดึงข้อมูลตัวเลือกต่างๆ สำหรับ UI
 * GET /api/financial/options
 */
export const getFinancialOptionsController = async (req, res) => {
  try {
    const expenseCategories = [
      'ค่าจัดส่ง',
      'ค่าดำเนินการ',
      'ค่าสื่อสาร',
      'ค่าวัสดุสำนักงาน',
      'ค่าจัดกิจกรรม',
      'ค่าเดินทาง',
      'ค่าบำรุงรักษา',
      'อื่นๆ'
    ];
    
    const expenseStatuses = [
      'รอดำเนินการ',
      'อนุมัติ',
      'ปฏิเสธ',
      'ชำระแล้ว'
    ];
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    
    const months = [
      { value: 1, label: 'มกราคม' },
      { value: 2, label: 'กุมภาพันธ์' },
      { value: 3, label: 'มีนาคม' },
      { value: 4, label: 'เมษายน' },
      { value: 5, label: 'พฤษภาคม' },
      { value: 6, label: 'มิถุนายน' },
      { value: 7, label: 'กรกฎาคม' },
      { value: 8, label: 'สิงหาคม' },
      { value: 9, label: 'กันยายน' },
      { value: 10, label: 'ตุลาคม' },
      { value: 11, label: 'พฤศจิกายน' },
      { value: 12, label: 'ธันวาคม' }
    ];
    
    return res.status(200).json({
      success: true,
      data: {
        expenseCategories,
        expenseStatuses,
        years,
        months
      }
    });
  } catch (error) {
    console.error('Error in getFinancialOptions:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงตัวเลือก',
      error: error.message
    });
  }
};

/**
 * สรุปสถิติรวมย่อๆ
 * GET /api/financial/summary
 */
export const getFinancialSummaryController = async (req, res) => {
  try {
    const dashboard = await getFinancialDashboard();
    
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: dashboard.overview.totalRevenue,
        totalExpenses: dashboard.overview.totalExpenses,
        netProfit: dashboard.overview.netProfit,
        totalMembers: dashboard.overview.totalMembers,
        pendingExpenses: dashboard.pending.expenseApprovals,
        currentMonthRevenue: dashboard.currentPeriod.revenue,
        currentMonthExpenses: dashboard.currentPeriod.expenses
      }
    });
  } catch (error) {
    console.error('Error in getFinancialSummary:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสรุปข้อมูลการเงิน',
      error: error.message
    });
  }
};

export default {
  // Expense Management
  createExpenseController,
  getExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  updateExpenseStatusController,
  deleteExpenseController,
  
  // Financial Periods
  getFinancialPeriodsController,
  getCurrentFinancialPeriodController,
  calculateFinancialPeriodController,
  
  // Dashboard & Statistics
  getFinancialDashboardController,
  getRevenueStatisticsController,
  getExpenseStatisticsController,
  getFinancialReportsController,
  
  // Export & Utilities
  exportFinancialDataController,
  getPendingPaymentsController,
  getFinancialOptionsController,
  getFinancialSummaryController
};