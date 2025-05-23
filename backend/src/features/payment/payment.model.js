// src/features/payment/payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni',
    required: [true, 'กรุณาระบุศิษย์เก่า']
  },
  amount: {
    type: Number,
    required: [true, 'กรุณาระบุจำนวนเงิน'],
    default: 200
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'กรุณาระบุจำนวนเงินทั้งหมด']
  },
  paymentMethod: {
    type: String,
    enum: ['โอนเงิน', 'ชำระด้วยตนเอง'],
    required: [true, 'กรุณาระบุวิธีการชำระเงิน']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentDetails: {
    type: String
  },
  paymentProofUrl: {
    type: String
  },
  referenceCode: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['รอการชำระเงิน', 'รอตรวจสอบ', 'ชำระเงินแล้ว', 'ยกเลิก'],
    default: 'รอการชำระเงิน'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate reference code before saving
paymentSchema.pre('save', async function(next) {
  if (!this.referenceCode) {
    const prefix = 'ALM';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.referenceCode = `${prefix}${timestamp}${random}`;
  }
  
  // Calculate total amount
  this.totalAmount = this.amount + this.shippingFee;
  
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;