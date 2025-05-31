// Path: src/features/financial/financial.service.js
// ไฟล์: financial.service.js - Business Logic สำหรับระบบการเงิน

import { Expense, FinancialPeriod, PaymentSummary } from './financial.model.js';
import Alumni from '../alumni/alumni.model.js';
import { uploadToCloudinary } from '../../utils/upload.js';

// ===============================================
// 💰 EXPENSE MANAGEMENT SERVICES
// ===============================================

/**
 * สร้างรายจ่ายใหม่
 */
export const createExpense = async (expenseData, receiptFile, userId) => {
  const { title, description, amount, category, date } = expenseData;
  
  // Validation
  if (!title || !amount || !category) {
    throw new Error('กรุณากรอกข้อมูลหัวข้อ จำนวนเงิน และหมวดหมู่');
  }
  
  if (amount <= 0) {
    throw new Error('จำนวนเงินต้องมากกว่า 0');
  }
  
  // อัปโหลดใบเสร็จ (ถ้ามี)
  let receiptUrl = null;
  if (receiptFile) {
    const uploadResult = await uploadToCloudinary(receiptFile);
    receiptUrl = uploadResult.secure_url;
  }
  
  // สร้างรายจ่าย
  const expense = new Expense({
    title: title.trim(),
    description: description?.trim(),
    amount: parseFloat(amount),
    category,
    date: date ? new Date(date) : new Date(),
    receiptUrl,
    createdBy: userId,
    status: 'รอดำเนินการ'
  });
  
  await expense.save();
  
  // อัปเดต Financial Period
  await updateFinancialPeriodFromExpense(expense);
  
  return expense;
};

/**
 * ดึงรายจ่ายทั้งหมด (พร้อม filters)
 */
export const getExpenses = async (filters = {}, options = {}) => {
  const {
    category,
    status,
    createdBy,
    startDate,
    endDate,
    search
  } = filters;
  
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 }
  } = options;
  
  // สร้าง query
  const query = {};
  
  if (category) query.category = category;
  if (status) query.status = status;
  if (createdBy) query.createdBy = createdBy;
  
  // กรองตามวันที่
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  // ค้นหาจากหัวข้อหรือคำอธิบาย
  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  // ดึงข้อมูล
  const expenses = await Expense.find(query)
    .populate('createdBy', 'username')
    .populate('approvedBy', 'username')
    .populate('statusHistory.updatedBy', 'username')
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  const total = await Expense.countDocuments(query);
  
  return {
    data: expenses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * ดึงรายจ่ายตาม ID
 */
export const getExpenseById = async (id) => {
  const expense = await Expense.findById(id)
    .populate('createdBy', 'username')
    .populate('approvedBy', 'username')
    .populate('statusHistory.updatedBy', 'username');
    
  if (!expense) {
    throw new Error('ไม่พบรายจ่ายนี้');
  }
  
  return expense;
};

/**
 * อัปเดตรายจ่าย
 */
export const updateExpense = async (id, updateData, receiptFile, userId) => {
  const expense = await Expense.findById(id);
  if (!expense) {
    throw new Error('ไม่พบรายจ่ายนี้');
  }
  
  // ตรวจสอบสิทธิ์ (เฉพาะคนสร้างหรือ admin)
  if (expense.createdBy.toString() !== userId.toString()) {
    // TODO: ตรวจสอบ admin role
  }
  
  const { title, description, amount, category, date } = updateData;
  
  // อัปเดตข้อมูล
  if (title) expense.title = title.trim();
  if (description !== undefined) expense.description = description?.trim();
  if (amount) {
    if (parseFloat(amount) <= 0) {
      throw new Error('จำนวนเงินต้องมากกว่า 0');
    }
    expense.amount = parseFloat(amount);
  }
  if (category) expense.category = category;
  if (date) expense.date = new Date(date);
  
  // อัปโหลดใบเสร็จใหม่ (ถ้ามี)
  if (receiptFile) {
    const uploadResult = await uploadToCloudinary(receiptFile);
    expense.receiptUrl = uploadResult.secure_url;
  }
  
  await expense.save();
  
  // อัปเดต Financial Period
  await updateFinancialPeriodFromExpense(expense);
  
  return expense;
};

/**
 * อนุมัติ/ปฏิเสธรายจ่าย
 */
export const updateExpenseStatus = async (id, status, notes, userId) => {
  const expense = await Expense.findById(id);
  if (!expense) {
    throw new Error('ไม่พบรายจ่ายนี้');
  }
  
  if (!['อนุมัติ', 'ปฏิเสธ', 'ชำระแล้ว'].includes(status)) {
    throw new Error('สถานะไม่ถูกต้อง');
  }
  
  // อัปเดตสถานะผ่าน method
  expense.updateStatus(status, notes, userId);
  await expense.save();
  
  // อัปเดต Financial Period
  await updateFinancialPeriodFromExpense(expense);
  
  return expense;
};

/**
 * ลบรายจ่าย
 */
export const deleteExpense = async (id, userId) => {
  const expense = await Expense.findById(id);
  if (!expense) {
    throw new Error('ไม่พบรายจ่ายนี้');
  }
  
  // ตรวจสอบสิทธิ์ (เฉพาะคนสร้างหรือ admin)
  if (expense.createdBy.toString() !== userId.toString()) {
    // TODO: ตรวจสอบ admin role
  }
  
  await Expense.findByIdAndDelete(id);
  
  // อัปเดต Financial Period
  await recalculateFinancialPeriod(expense.date);
  
  return expense;
};

// ===============================================
// 📊 FINANCIAL PERIOD SERVICES
// ===============================================

/**
 * ดึงข้อมูล Financial Period
 */
export const getFinancialPeriods = async (filters = {}, options = {}) => {
  const { year, month, isCalculated } = filters;
  const { page = 1, limit = 12, sort = { year: -1, month: -1 } } = options;
  
  const query = {};
  if (year) query.year = year;
  if (month) query.month = month;
  if (isCalculated !== undefined) query.isCalculated = isCalculated;
  
  const skip = (page - 1) * limit;
  
  const periods = await FinancialPeriod.find(query)
    .populate('calculatedBy', 'username')
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  const total = await FinancialPeriod.countDocuments(query);
  
  return {
    data: periods,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * ดึง Financial Period ปัจจุบัน
 */
export const getCurrentFinancialPeriod = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  let period = await FinancialPeriod.findOne({
    year: currentYear,
    month: currentMonth
  });
  
  // ถ้าไม่มี ให้สร้างใหม่
  if (!period) {
    period = await FinancialPeriod.createPeriod(currentYear, currentMonth);
  }
  
  return period;
};

/**
 * คำนวณ Financial Period ใหม่
 */
export const calculateFinancialPeriod = async (year, month, userId) => {
  // หา period หรือสร้างใหม่
  let period = await FinancialPeriod.findOne({ year, month });
  if (!period) {
    period = await FinancialPeriod.createPeriod(year, month);
  }
  
  // คำนวณรายรับจาก Alumni
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  const revenueStats = await Alumni.aggregate([
    {
      $match: {
        status: 'อนุมัติ',
        paymentDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        membershipFees: { $sum: '$amount' },
        shippingFees: { $sum: '$shippingFee' },
        memberCount: { $sum: 1 },
        shippingCount: {
          $sum: {
            $cond: [{ $eq: ['$deliveryOption', 'จัดส่งทางไปรษณีย์'] }, 1, 0]
          }
        },
        pickupCount: {
          $sum: {
            $cond: [{ $eq: ['$deliveryOption', 'รับที่วิทยาลัย'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  // คำนวณรายจ่าย
  const expenseStats = await Expense.aggregate([
    {
      $match: {
        status: 'อนุมัติ',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' }
      }
    }
  ]);
  
  const totalExpenses = await Expense.aggregate([
    {
      $match: {
        status: 'อนุมัติ',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  // อัปเดต period
  const revenue = revenueStats[0] || {};
  const expenses = totalExpenses[0]?.total || 0;
  
  period.totalRevenue = revenue.totalRevenue || 0;
  period.membershipFees = revenue.membershipFees || 0;
  period.shippingFees = revenue.shippingFees || 0;
  period.totalExpenses = expenses;
  period.newMemberCount = revenue.memberCount || 0;
  period.shippingCount = revenue.shippingCount || 0;
  period.pickupCount = revenue.pickupCount || 0;
  
  // สร้าง expense breakdown
  const expensesByCategory = new Map();
  expenseStats.forEach(stat => {
    expensesByCategory.set(stat._id, stat.amount);
  });
  period.expensesByCategory = expensesByCategory;
  
  // คำนวณ net profit และทำเครื่องหมายว่าคำนวณแล้ว
  period.markAsCalculated(userId);
  
  await period.save();
  
  return period;
};

/**
 * อัปเดต Financial Period จากรายจ่าย
 */
const updateFinancialPeriodFromExpense = async (expense) => {
  const expenseDate = new Date(expense.date);
  const year = expenseDate.getFullYear();
  const month = expenseDate.getMonth() + 1;
  
  // หา period หรือสร้างใหม่
  let period = await FinancialPeriod.findOne({ year, month });
  if (!period) {
    period = await FinancialPeriod.createPeriod(year, month);
  }
  
  // คำนวณรายจ่ายใหม่สำหรับเดือนนี้
  await recalculateFinancialPeriod(expense.date);
};

/**
 * คำนวณ Financial Period ใหม่ทั้งหมด
 */
const recalculateFinancialPeriod = async (date) => {
  const targetDate = new Date(date);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  
  // คำนวณใหม่โดยไม่ระบุ userId (auto calculation)
  await calculateFinancialPeriod(year, month, null);
};

// ===============================================
// 📈 DASHBOARD & STATISTICS SERVICES
// ===============================================

/**
 * ดึงข้อมูล Dashboard การเงิน
 */
export const getFinancialDashboard = async () => {
  const currentPeriod = await getCurrentFinancialPeriod();
  
  // สถิติรวมทั้งหมด
  const totalStats = await Alumni.aggregate([
    {
      $match: { status: 'อนุมัติ' }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalMembers: { $sum: 1 },
        totalMembershipFees: { $sum: '$amount' },
        totalShippingFees: { $sum: '$shippingFee' }
      }
    }
  ]);
  
  const totalExpensesStats = await Expense.aggregate([
    {
      $match: { status: 'อนุมัติ' }
    },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: '$amount' }
      }
    }
  ]);
  
  // สถิติ 30 วันล่าสุด
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentStats = await Alumni.aggregate([
    {
      $match: {
        status: 'อนุมัติ',
        paymentDate: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: null,
        recentRevenue: { $sum: '$totalAmount' },
        recentMembers: { $sum: 1 }
      }
    }
  ]);
  
  const recentExpenses = await Expense.aggregate([
    {
      $match: {
        status: 'อนุมัติ',
        date: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: null,
        recentExpenses: { $sum: '$amount' }
      }
    }
  ]);
  
  // รายจ่ายรอดำเนินการ
  const pendingExpenses = await Expense.countDocuments({ status: 'รอดำเนินการ' });
  
  const total = totalStats[0] || {};
  const totalExp = totalExpensesStats[0] || {};
  const recent = recentStats[0] || {};
  const recentExp = recentExpenses[0] || {};
  
  return {
    // สถิติรวม
    overview: {
      totalRevenue: total.totalRevenue || 0,
      totalExpenses: totalExp.totalExpenses || 0,
      netProfit: (total.totalRevenue || 0) - (totalExp.totalExpenses || 0),
      totalMembers: total.totalMembers || 0
    },
    
    // เดือนปัจจุบัน
    currentPeriod: {
      year: currentPeriod.year,
      month: currentPeriod.month,
      periodName: currentPeriod.periodName,
      revenue: currentPeriod.totalRevenue,
      expenses: currentPeriod.totalExpenses,
      netProfit: currentPeriod.netProfit,
      memberCount: currentPeriod.newMemberCount
    },
    
    // 30 วันล่าสุด
    recent30Days: {
      revenue: recent.recentRevenue || 0,
      expenses: recentExp.recentExpenses || 0,
      newMembers: recent.recentMembers || 0,
      netProfit: (recent.recentRevenue || 0) - (recentExp.recentExpenses || 0)
    },
    
    // การดำเนินการ
    pending: {
      expenseApprovals: pendingExpenses
    }
  };
};

/**
 * ดึงสถิติรายรับแยกตามหมวดหมู่
 */
export const getRevenueStatistics = async (startDate, endDate) => {
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  
  const query = { status: 'อนุมัติ' };
  if (Object.keys(dateFilter).length > 0) {
    query.paymentDate = dateFilter;
  }
  
  // รายรับแยกตามแผนกวิชา
  const byDepartment = await Alumni.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$department',
        totalAmount: { $sum: '$totalAmount' },
        memberCount: { $sum: 1 },
        membershipFees: { $sum: '$amount' },
        shippingFees: { $sum: '$shippingFee' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  // รายรับแยกตามปีการศึกษา
  const byGraduationYear = await Alumni.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$graduationYear',
        totalAmount: { $sum: '$totalAmount' },
        memberCount: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);
  
  // รายรับแยกตามวิธีการชำระเงิน
  const byPaymentMethod = await Alumni.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$totalAmount' },
        memberCount: { $sum: 1 }
      }
    }
  ]);
  
  return {
    byDepartment,
    byGraduationYear,
    byPaymentMethod
  };
};

/**
 * ดึงสถิติรายจ่ายแยกตามหมวดหมู่
 */
export const getExpenseStatistics = async (startDate, endDate) => {
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  
  const query = { status: 'อนุมัติ' };
  if (Object.keys(dateFilter).length > 0) {
    query.date = dateFilter;
  }
  
  // รายจ่ายแยกตามหมวดหมู่
  const byCategory = await Expense.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        expenseCount: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  // รายจ่ายแยกตามสถานะ
  const byStatus = await Expense.aggregate([
    { $match: { date: query.date || { $exists: true } } },
    {
      $group: {
        _id: '$status',
        totalAmount: { $sum: '$amount' },
        expenseCount: { $sum: 1 }
      }
    }
  ]);
  
  // แนวโน้มรายจ่ายรายเดือน
  const monthlyTrend = await Expense.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalAmount: { $sum: '$amount' },
        expenseCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
  
  return {
    byCategory,
    byStatus,
    monthlyTrend
  };
};

// ===============================================
// 📤 EXPORT SERVICES
// ===============================================

/**
 * ดึงข้อมูลสำหรับ Export
 */
export const getExportData = async (type, filters = {}) => {
  switch (type) {
    case 'expenses':
      return await getExpensesForExport(filters);
    case 'revenue':
      return await getRevenueForExport(filters);
    case 'periods':
      return await getPeriodsForExport(filters);
    default:
      throw new Error('ประเภทการ Export ไม่ถูกต้อง');
  }
};

const getExpensesForExport = async (filters) => {
  const { data } = await getExpenses(filters, { page: 1, limit: 10000 });
  return data.map(expense => ({
    วันที่: expense.date.toLocaleDateString('th-TH'),
    หัวข้อ: expense.title,
    หมวดหมู่: expense.category,
    จำนวนเงิน: expense.amount,
    สถานะ: expense.status,
    ผู้สร้าง: expense.createdBy?.username || 'ไม่ระบุ',
    ผู้อนุมัติ: expense.approvedBy?.username || '-',
    หมายเหตุ: expense.description || '-'
  }));
};

const getRevenueForExport = async (filters) => {
  const alumni = await Alumni.find({ status: 'อนุมัติ' })
    .select('firstName lastName department graduationYear totalAmount amount shippingFee paymentDate paymentMethod');
  
  return alumni.map(member => ({
    ชื่อ: member.firstName,
    นามสกุล: member.lastName,
    แผนกวิชา: member.department,
    ปีที่สำเร็จการศึกษา: member.graduationYear,
    ค่าสมาชิก: member.amount,
    ค่าจัดส่ง: member.shippingFee,
    รวมทั้งหมด: member.totalAmount,
    วิธีการชำระ: member.paymentMethod,
    วันที่ชำระ: member.paymentDate?.toLocaleDateString('th-TH') || '-'
  }));
};

const getPeriodsForExport = async (filters) => {
  const { data } = await getFinancialPeriods(filters, { page: 1, limit: 100 });
  return data.map(period => ({
    ปี: period.year,
    เดือน: period.month,
    ชื่อช่วง: period.periodName,
    รายรับ: period.totalRevenue,
    รายจ่าย: period.totalExpenses,
    กำไรสุทธิ: period.netProfit,
    จำนวนสมาชิกใหม่: period.newMemberCount,
    คำนวณแล้ว: period.isCalculated ? 'ใช่' : 'ไม่'
  }));
};

export default {
  // Expense Management
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  updateExpenseStatus,
  deleteExpense,
  
  // Financial Periods
  getFinancialPeriods,
  getCurrentFinancialPeriod,
  calculateFinancialPeriod,
  
  // Dashboard & Statistics
  getFinancialDashboard,
  getRevenueStatistics,
  getExpenseStatistics,
  
  // Export
  getExportData
};