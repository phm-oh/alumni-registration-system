// Path: src/features/financial/financial.model.js
// ไฟล์: financial.model.js - Database Models สำหรับระบบการเงิน

import mongoose from 'mongoose';

// ===============================================
// 💰 Expense Model - จัดการรายจ่าย
// ===============================================

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'กรุณาระบุหัวข้อรายจ่าย'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'กรุณาระบุจำนวนเงิน'],
    min: [0, 'จำนวนเงินต้องมากกว่า 0']
  },
  category: {
    type: String,
    required: [true, 'กรุณาเลือกหมวดหมู่'],
    enum: [
      'ค่าจัดส่ง',           // Shipping costs
      'ค่าดำเนินการ',        // Operation costs
      'ค่าสื่อสาร',          // Communication costs
      'ค่าวัสดุสำนักงาน',    // Office supplies
      'ค่าจัดกิจกรรม',       // Event costs
      'ค่าเดินทาง',          // Travel expenses
      'ค่าบำรุงรักษา',       // Maintenance costs
      'อื่นๆ'               // Others
    ]
  },
  date: {
    type: Date,
    required: [true, 'กรุณาระบุวันที่จ่าย'],
    default: Date.now
  },
  receiptUrl: {
    type: String  // Cloudinary URL ของใบเสร็จ
  },
  status: {
    type: String,
    enum: ['รอดำเนินการ', 'อนุมัติ', 'ปฏิเสธ', 'ชำระแล้ว'],
    default: 'รอดำเนินการ'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  approvalNotes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // สำหรับ tracking การเปลี่ยนแปลง
  statusHistory: [{
    status: String,
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index สำหรับการค้นหาเร็วขึ้น
expenseSchema.index({ category: 1, date: -1 });
expenseSchema.index({ createdBy: 1, status: 1 });
expenseSchema.index({ status: 1, createdAt: -1 });

// Virtual สำหรับ formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(this.amount);
});

// Method สำหรับอัปเดตสถานะ
expenseSchema.methods.updateStatus = function(newStatus, notes, userId) {
  this.status = newStatus;
  
  if (newStatus === 'อนุมัติ') {
    this.approvedBy = userId;
    this.approvedAt = new Date();
    this.approvalNotes = notes;
  }
  
  // บันทึกประวัติ
  this.statusHistory.push({
    status: newStatus,
    notes: notes,
    updatedBy: userId,
    updatedAt: new Date()
  });
};

// ===============================================
// 📊 FinancialPeriod Model - สรุปยอดตามช่วงเวลา
// ===============================================

const financialPeriodSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, 'กรุณาระบุปี'],
    min: [2020, 'ปีต้องไม่ต่ำกว่า 2020']
  },
  month: {
    type: Number,
    required: [true, 'กรุณาระบุเดือน'],
    min: [1, 'เดือนต้องอยู่ระหว่าง 1-12'],
    max: [12, 'เดือนต้องอยู่ระหว่าง 1-12']
  },
  
  // ข้อมูลรายรับ
  totalRevenue: {
    type: Number,
    default: 0,
    min: [0, 'รายรับต้องไม่ติดลบ']
  },
  membershipFees: {
    type: Number,
    default: 0
  },
  shippingFees: {
    type: Number,
    default: 0
  },
  
  // ข้อมูลรายจ่าย
  totalExpenses: {
    type: Number,
    default: 0,
    min: [0, 'รายจ่ายต้องไม่ติดลบ']
  },
  expensesByCategory: {
    type: Map,
    of: Number,
    default: {}
  },
  
  // สรุปผล
  netProfit: {
    type: Number,
    default: 0
  },
  
  // สถิติสมาชิก
  newMemberCount: {
    type: Number,
    default: 0,
    min: [0, 'จำนวนสมาชิกต้องไม่ติดลบ']
  },
  totalMemberCount: {
    type: Number,
    default: 0,
    min: [0, 'จำนวนสมาชิกรวมต้องไม่ติดลบ']
  },
  
  // สถิติการจัดส่ง
  shippingCount: {
    type: Number,
    default: 0
  },
  pickupCount: {
    type: Number,
    default: 0
  },
  
  // การคำนวณ/สรุป
  isCalculated: {
    type: Boolean,
    default: false
  },
  calculatedAt: {
    type: Date
  },
  calculatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // หมายเหตุ
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index สำหรับการค้นหาเร็วขึ้น
financialPeriodSchema.index({ year: -1, month: -1 }, { unique: true });
financialPeriodSchema.index({ isCalculated: 1, createdAt: -1 });

// Virtual สำหรับ period name
financialPeriodSchema.virtual('periodName').get(function() {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  return `${months[this.month - 1]} ${this.year + 543}`;
});

// Virtual สำหรับ formatted values
financialPeriodSchema.virtual('formattedRevenue').get(function() {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(this.totalRevenue);
});

financialPeriodSchema.virtual('formattedExpenses').get(function() {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(this.totalExpenses);
});

financialPeriodSchema.virtual('formattedNetProfit').get(function() {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(this.netProfit);
});

// Method สำหรับคำนวณ net profit
financialPeriodSchema.methods.calculateNetProfit = function() {
  this.netProfit = this.totalRevenue - this.totalExpenses;
  return this.netProfit;
};

// Method สำหรับทำเครื่องหมายว่าคำนวณแล้ว
financialPeriodSchema.methods.markAsCalculated = function(userId) {
  this.isCalculated = true;
  this.calculatedAt = new Date();
  this.calculatedBy = userId;
  this.calculateNetProfit();
};

// Static method สำหรับหา period ปัจจุบัน
financialPeriodSchema.statics.findCurrentPeriod = function() {
  const now = new Date();
  return this.findOne({
    year: now.getFullYear(),
    month: now.getMonth() + 1
  });
};

// Static method สำหรับสร้าง period ใหม่
financialPeriodSchema.statics.createPeriod = function(year, month) {
  return this.create({
    year,
    month,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    newMemberCount: 0,
    totalMemberCount: 0,
    shippingCount: 0,
    pickupCount: 0,
    expensesByCategory: new Map()
  });
};

// ===============================================
// 📈 PaymentSummary Model - สรุปการชำระเงิน
// ===============================================

const paymentSummarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  
  // สรุปการชำระเงิน
  totalPayments: {
    type: Number,
    default: 0
  },
  membershipPayments: {
    type: Number,
    default: 0
  },
  shippingPayments: {
    type: Number,
    default: 0
  },
  
  // จำนวนการชำระ
  paymentCount: {
    type: Number,
    default: 0
  },
  transferCount: {
    type: Number,
    default: 0  // โอนเงิน
  },
  cashCount: {
    type: Number,
    default: 0  // ชำระด้วยตนเอง
  },
  
  // รายละเอียดแยกตามแผนก
  departmentBreakdown: {
    type: Map,
    of: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    default: {}
  },
  
  // สถานะการสรุป
  isSummarized: {
    type: Boolean,
    default: false
  },
  summarizedAt: {
    type: Date
  },
  summarizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index
paymentSummarySchema.index({ date: -1 });
paymentSummarySchema.index({ isSummarized: 1 });

// Virtual สำหรับ formatted date
paymentSummarySchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('th-TH');
});

// ===============================================
// 📤 Export Models
// ===============================================

const Expense = mongoose.model('Expense', expenseSchema);
const FinancialPeriod = mongoose.model('FinancialPeriod', financialPeriodSchema);
const PaymentSummary = mongoose.model('PaymentSummary', paymentSummarySchema);

export { Expense, FinancialPeriod, PaymentSummary };
export default { Expense, FinancialPeriod, PaymentSummary };