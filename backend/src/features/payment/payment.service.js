// src/features/payment/payment.service.js
import Payment from './payment.model.js';
import Alumni from '../alumni/alumni.model.js';
import { sendStatusUpdateEmail, sendAdminNotificationEmail } from '../../utils/email.js';
import { uploadToCloudinary } from '../../utils/upload.js';

/**
 * สร้างข้อมูลการชำระเงินใหม่
 * @param {Object} paymentData - ข้อมูลการชำระเงิน
 * @param {File} paymentProofFile - ไฟล์หลักฐานการชำระเงิน (ถ้ามี)
 * @returns {Object} - ข้อมูลการชำระเงินที่สร้างแล้ว
 */
export const createNewPayment = async (paymentData, paymentProofFile = null) => {
  const { alumniId, amount, shippingFee, paymentMethod } = paymentData;
  
  // ตรวจสอบว่ามีศิษย์เก่านี้อยู่ในระบบหรือไม่
  const alumni = await Alumni.findById(alumniId);
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลศิษย์เก่า');
  }
  
  // สร้างข้อมูลการชำระเงิน
  const payment = new Payment({
    alumniId,
    amount: amount || 200,
    shippingFee: shippingFee || 0,
    paymentMethod,
    status: 'รอการชำระเงิน'
  });
  
  // ถ้ามีการอัปโหลดไฟล์หลักฐานการชำระเงิน
  if (paymentProofFile) {
    const result = await uploadToCloudinary(paymentProofFile);
    payment.paymentProofUrl = result.secure_url;
    payment.status = 'รอตรวจสอบ';
  }
  
  // บันทึกข้อมูล
  await payment.save();
  
  // อัปเดตสถานะการชำระเงินในข้อมูลศิษย์เก่า
  alumni.status = payment.status;
  await alumni.save();
  
  return payment;
};

/**
 * อัปโหลดหลักฐานการชำระเงิน
 * @param {string} paymentId - ID ของการชำระเงิน
 * @param {File} paymentProofFile - ไฟล์หลักฐานการชำระเงิน
 * @param {string} paymentDetails - รายละเอียดการชำระเงิน
 * @returns {Object} - ข้อมูลการชำระเงินที่อัปเดตแล้ว
 */
export const uploadProofOfPayment = async (paymentId, paymentProofFile, paymentDetails) => {
  // ตรวจสอบว่ามีข้อมูลการชำระเงินนี้อยู่ในระบบหรือไม่
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('ไม่พบข้อมูลการชำระเงิน');
  }
  
  // ตรวจสอบว่ามีไฟล์หรือไม่
  if (!paymentProofFile) {
    throw new Error('กรุณาอัปโหลดหลักฐานการชำระเงิน');
  }
  
  // อัปโหลดไฟล์ไปยัง Cloudinary
  const result = await uploadToCloudinary(paymentProofFile);
  
  // อัปเดตข้อมูลการชำระเงิน
  payment.paymentProofUrl = result.secure_url;
  payment.paymentDate = new Date();
  payment.paymentDetails = paymentDetails || '';
  payment.status = 'รอตรวจสอบ';
  
  await payment.save();
  
  // อัปเดตสถานะการลงทะเบียนในข้อมูลศิษย์เก่า
  const alumni = await Alumni.findById(payment.alumniId);
  if (alumni) {
    alumni.status = 'รอตรวจสอบ';
    await alumni.save();
    
    // ส่งอีเมลแจ้งเตือนการอัปเดตสถานะ
    await sendStatusUpdateEmail(alumni);
  }
  
  // ส่งอีเมลแจ้งเตือน Admin
  await sendAdminNotificationEmail(alumni);
  
  return payment;
};

/**
 * ยืนยันการชำระเงิน
 * @param {string} paymentId - ID ของการชำระเงิน
 * @param {string} status - สถานะใหม่
 * @param {string} notes - บันทึกเพิ่มเติม
 * @param {string} userId - ID ของผู้ยืนยัน
 * @returns {Object} - ข้อมูลการชำระเงินที่อัปเดตแล้ว
 */
export const verifyPaymentStatus = async (paymentId, status, notes, userId) => {
  // ตรวจสอบว่ามีข้อมูลการชำระเงินนี้อยู่ในระบบหรือไม่
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('ไม่พบข้อมูลการชำระเงิน');
  }
  
  // อัปเดตข้อมูลการชำระเงิน
  payment.status = status;
  payment.notes = notes;
  payment.verifiedBy = userId;
  payment.verifiedAt = new Date();
  
  await payment.save();
  
  // อัปเดตสถานะการลงทะเบียนในข้อมูลศิษย์เก่า
  const alumni = await Alumni.findById(payment.alumniId);
  if (alumni) {
    alumni.status = status === 'ชำระเงินแล้ว' ? 'อนุมัติแล้ว' : status;
    await alumni.save();
    
    // ส่งอีเมลแจ้งเตือนการอัปเดตสถานะ
    await sendStatusUpdateEmail(alumni);
  }
  
  return payment;
};

/**
 * ค้นหาข้อมูลการชำระเงินตามเงื่อนไขต่างๆ
 * @param {Object} filters - เงื่อนไขในการค้นหา
 * @param {Object} options - ตัวเลือกในการค้นหา (เช่น sorting, pagination)
 * @returns {Array} - ข้อมูลการชำระเงินที่ตรงตามเงื่อนไข
 */
export const searchPayments = async (filters = {}, options = {}) => {
  const query = {};
  
  // สร้าง query ตามเงื่อนไขที่ได้รับ
  if (filters.alumniId) {
    query.alumniId = filters.alumniId;
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }
  
  if (filters.dateFrom && filters.dateTo) {
    query.paymentDate = {
      $gte: new Date(filters.dateFrom),
      $lte: new Date(filters.dateTo)
    };
  } else if (filters.dateFrom) {
    query.paymentDate = { $gte: new Date(filters.dateFrom) };
  } else if (filters.dateTo) {
    query.paymentDate = { $lte: new Date(filters.dateTo) };
  }
  
  if (filters.referenceCode) {
    query.referenceCode = { $regex: filters.referenceCode, $options: 'i' };
  }
  
  // กำหนดการเรียงลำดับ
  const sort = options.sort || { createdAt: -1 };
  
  // กำหนด pagination
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  
  // ค้นหาข้อมูล
  const payments = await Payment.find(query)
    .populate('alumniId', 'firstName lastName idCard email phone')
    .populate('verifiedBy', 'username')
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  // นับจำนวนทั้งหมด
  const total = await Payment.countDocuments(query);
  
  return {
    data: payments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export default {
  createNewPayment,
  uploadProofOfPayment,
  verifyPaymentStatus,
  searchPayments
};