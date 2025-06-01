// Path: src/features/alumni/alumni.model.js
// ไฟล์: alumni.model.js - เพิ่ม Shipping Status และ Fields ใหม่

import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema({
  // ข้อมูลส่วนตัว
  firstName: {
    type: String,
    required: [true, 'กรุณากรอกชื่อ']
  },
  lastName: {
    type: String,
    required: [true, 'กรุณากรอกนามสกุล']
  },
  idCard: {
    type: String,
    required: [true, 'กรุณากรอกเลขบัตรประชาชน'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{13}$/.test(v);
      },
      message: 'เลขบัตรประชาชนต้องมี 13 หลัก'
    }
  },
  address: {
    type: String,
    required: [true, 'กรุณากรอกที่อยู่']
  },
  graduationYear: {
    type: Number,
    required: [true, 'กรุณาเลือกปีที่สำเร็จการศึกษา']
  },
  department: {
    type: String,
    required: [true, 'กรุณาเลือกแผนกวิชา']
  },
  
  // ข้อมูลติดต่อ
  phone: {
    type: String,
    required: [true, 'กรุณากรอกเบอร์โทรศัพท์']
  },
  email: {
    type: String,
    required: [true, 'กรุณากรอกอีเมล'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'กรุณากรอกอีเมลให้ถูกต้อง']
  },
  
  // ข้อมูลการทำงานปัจจุบัน
  currentJob: {
    type: String
  },
  workplace: {
    type: String
  },
  
  // ข้อมูลโซเชียลมีเดีย
  facebookId: {
    type: String
  },
  lineId: {
    type: String
  },
  
  // ตำแหน่งในสมาคม
  position: {
    type: String,
    enum: [
      'สมาชิกสามัญ',
      'ประธาน',
      'รองประธาน',
      'เลขานุการ',
      'กรรมการ',
      'สมาชิกกิตติมศักดิ์',
    ],
    default: 'สมาชิกสามัญ'
  },
  
  // ข้อมูลการสมัครสมาชิก
  registrationDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['โอนเงิน', 'ชำระด้วยตนเอง'],
    required: [true, 'กรุณาเลือกวิธีการชำระเงิน']
  },
  paymentDate: {
    type: Date
  },
  paymentDetails: {
    type: String
  },
  profileImageUrl: {
    type: String
  },
  paymentProofUrl: {
    type: String
  },
  deliveryOption: {
    type: String,
    enum: ['รับที่วิทยาลัย', 'จัดส่งทางไปรษณีย์'],
    default: 'รับที่วิทยาลัย'
  },
  amount: {
    type: Number,
    default: 200
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 200
  },
  
  // 🚀 สถานะการอนุมัติ (แยกจากการจัดส่ง)
  status: {
    type: String,
    enum: ['รอตรวจสอบ', 'อนุมัติ', 'รอการชำระเงิน', 'ปฏิเสธ'],
    default: 'รอตรวจสอบ'
  },
  
  // 🚀 สถานะการจัดส่งใหม่ (แยกต่างหาก)
  shippingStatus: {
    type: String,
    enum: ['ไม่ต้องจัดส่ง', 'รอการจัดส่ง', 'กำลังจัดส่ง', 'จัดส่งแล้ว'],
    default: function() {
      return this.deliveryOption === 'รับที่วิทยาลัย' ? 'ไม่ต้องจัดส่ง' : 'รอการจัดส่ง';
    }
  },
  
  // 🚀 ข้อมูลการจัดส่งเพิ่มเติม
  shippedDate: {
    type: Date
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  shippedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // ผู้ดำเนินการจัดส่ง
  },
  deliveryNotes: {
    type: String  // หมายเหตุการจัดส่ง
  },
  
  pdpaConsent: {
    type: Boolean,
    required: [true, 'กรุณายินยอมให้ใช้ข้อมูลส่วนบุคคล']
  },
  
  // ประวัติการอัปเดตสถานะ
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
  }],
  
  // ประวัติการอัปเดตตำแหน่ง
  positionHistory: [{
    position: String,
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 🚀 ประวัติการจัดส่ง
  shippingHistory: [{
    shippingStatus: String,
    trackingNumber: String,
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

// Virtual field for full name
alumniSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// 🚀 ก่อนบันทึกข้อมูล ให้คำนวณค่าใช้จ่ายและ shippingStatus
alumniSchema.pre('save', function(next) {
  // คำนวณค่าจัดส่ง
  if (this.deliveryOption === 'จัดส่งทางไปรษณีย์') {
    this.shippingFee = 30;
    this.totalAmount = this.amount + this.shippingFee;
    
    // ถ้าเป็นคนใหม่ ตั้งสถานะการจัดส่ง
    if (this.isNew && !this.shippingStatus) {
      this.shippingStatus = 'รอการจัดส่ง';
    }
  } else {
    this.shippingFee = 0;
    this.totalAmount = this.amount;
    
    // ถ้าเป็นคนรับเอง ไม่ต้องจัดส่ง
    if (this.isNew && !this.shippingStatus) {
      this.shippingStatus = 'ไม่ต้องจัดส่ง';
    }
  }
  
  next();
});

// 🚀 Method สำหรับอัปเดตสถานะการจัดส่ง
alumniSchema.methods.updateShippingStatus = function(newStatus, trackingNumber, notes, userId) {
  this.shippingStatus = newStatus;
  
  if (trackingNumber !== undefined && trackingNumber !== null) {
  const trimmedTracking = String(trackingNumber).trim();
  this.trackingNumber = trimmedTracking; // เก็บแม้จะเป็น empty string
}
  
  if (newStatus === 'จัดส่งแล้ว') {
    this.shippedDate = new Date();
    this.shippedBy = userId;
  }
  
  // บันทึกประวัติการจัดส่ง
  if (!this.shippingHistory) {
    this.shippingHistory = [];
  }
  
  this.shippingHistory.push({
    shippingStatus: newStatus,
    trackingNumber: trackingNumber,
    notes: notes,
    updatedBy: userId,
    updatedAt: new Date()
  });
  
  if (notes) {
    this.deliveryNotes = notes;
  }
};

// 🚀 Method ตรวจสอบว่าพร้อมจัดส่งหรือไม่
alumniSchema.methods.isReadyToShip = function() {
  return this.status === 'อนุมัติ' && 
         this.deliveryOption === 'จัดส่งทางไปรษณีย์' && 
         this.shippingStatus === 'รอการจัดส่ง';
};

const Alumni = mongoose.model('Alumni', alumniSchema);

export default Alumni;