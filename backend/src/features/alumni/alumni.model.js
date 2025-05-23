// src/features/alumni/alumni.model.js
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
      'ประธานชมรมศิษย์เก่า',
      'รองประธาน',
      'การเงิน',
      'ทะเบียน',
      'ประชาสัมพันธ์'
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
  status: {
    type: String,
    enum: ['รอตรวจสอบ', 'อนุมัติแล้ว', 'รอการชำระเงิน', 'ยกเลิก'],
    default: 'รอตรวจสอบ'
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
  }]
}, {
  timestamps: true
});

// Virtual field for full name
alumniSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ก่อนบันทึกข้อมูล ให้คำนวณค่าใช้จ่ายทั้งหมด
alumniSchema.pre('save', function(next) {
  if (this.deliveryOption === 'จัดส่งทางไปรษณีย์') {
    this.shippingFee = 30;
    this.totalAmount = this.amount + this.shippingFee;
  } else {
    this.shippingFee = 0;
    this.totalAmount = this.amount;
  }
  next();
});

const Alumni = mongoose.model('Alumni', alumniSchema);

export default Alumni;