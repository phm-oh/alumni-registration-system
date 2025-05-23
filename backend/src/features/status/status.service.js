// src/features/status/status.service.js
import Alumni from '../alumni/alumni.model.js';
import Payment from '../payment/payment.model.js';
import { sendStatusUpdateEmail } from '../../utils/email.js';

/**
 * ตรวจสอบสถานะการลงทะเบียนโดยใช้เลขบัตรประชาชน
 * @param {string} idCard - เลขบัตรประชาชน
 * @returns {Object} - ข้อมูลสถานะการลงทะเบียนและการชำระเงิน
 */
export const checkStatusByIdCard = async (idCard) => {
  // ตรวจสอบว่ามีศิษย์เก่านี้อยู่ในระบบหรือไม่
  const alumni = await Alumni.findOne({ idCard });
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลการลงทะเบียน กรุณาตรวจสอบเลขบัตรประชาชนอีกครั้ง');
  }
  
  // ดึงข้อมูลการชำระเงิน
  const payments = await Payment.find({ alumniId: alumni._id }).sort({ createdAt: -1 });
  
  return {
    alumni: {
      id: alumni._id,
      fullName: `${alumni.firstName} ${alumni.lastName}`,
      idCard: alumni.idCard,
      email: alumni.email,
      phone: alumni.phone,
      registrationDate: alumni.registrationDate,
      status: alumni.status,
      deliveryOption: alumni.deliveryOption
    },
    payments: payments.map(payment => ({
      id: payment._id,
      referenceCode: payment.referenceCode,
      amount: payment.amount,
      shippingFee: payment.shippingFee,
      totalAmount: payment.totalAmount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      status: payment.status,
      paymentProofUrl: payment.paymentProofUrl
    }))
  };
};

/**
 * อัปเดตสถานะการลงทะเบียน
 * @param {string} id - ID ของศิษย์เก่า
 * @param {string} status - สถานะใหม่
 * @param {string} note - บันทึกเพิ่มเติม
 * @param {string} userId - ID ของผู้อัปเดต
 * @returns {Object} - ข้อมูลศิษย์เก่าที่อัปเดตแล้ว
 */
export const updateAlumniStatus = async (id, status, note, userId) => {
  // ตรวจสอบว่ามีศิษย์เก่านี้อยู่ในระบบหรือไม่
  const alumni = await Alumni.findById(id);
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลศิษย์เก่า');
  }
  
  // อัปเดตสถานะ
  alumni.status = status;
  
  // เพิ่มบันทึกประวัติการอัปเดตสถานะ
  if (!alumni.statusHistory) {
    alumni.statusHistory = [];
  }
  
  alumni.statusHistory.push({
    status,
    note,
    updatedBy: userId,
    updatedAt: new Date()
  });
  
  await alumni.save();
  
  // ส่งอีเมลแจ้งเตือนการอัปเดตสถานะ
  await sendStatusUpdateEmail(alumni);
  
  return alumni;
};

/**
 * ดึงข้อมูลสถิติการลงทะเบียน
 * @returns {Object} - ข้อมูลสถิติต่างๆ
 */
export const getRegistrationStatistics = async () => {
  // จำนวนศิษย์เก่าทั้งหมด
  const totalAlumni = await Alumni.countDocuments();
  
  // จำนวนศิษย์เก่าแยกตามสถานะ
  const pendingCount = await Alumni.countDocuments({ status: 'รอตรวจสอบ' });
  const approvedCount = await Alumni.countDocuments({ status: 'อนุมัติแล้ว' });
  const waitingPaymentCount = await Alumni.countDocuments({ status: 'รอการชำระเงิน' });
  const cancelledCount = await Alumni.countDocuments({ status: 'ยกเลิก' });
  
  // จำนวนศิษย์เก่าแยกตามปีที่สำเร็จการศึกษา
  const graduationYearStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$graduationYear',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
  
  // จำนวนศิษย์เก่าแยกตามแผนกวิชา
  const departmentStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  // รายได้ทั้งหมด
  const paymentStats = await Payment.aggregate([
    {
      $match: { status: 'ชำระเงินแล้ว' }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    totalAlumni,
    statusStats: {
      pending: pendingCount,
      approved: approvedCount,
      waitingPayment: waitingPaymentCount,
      cancelled: cancelledCount
    },
    graduationYearStats,
    departmentStats,
    paymentStats: paymentStats.length > 0 ? {
      totalAmount: paymentStats[0].totalAmount,
      count: paymentStats[0].count
    } : {
      totalAmount: 0,
      count: 0
    }
  };
};

/**
 * ค้นหาข้อมูลศิษย์เก่าตามเงื่อนไขต่างๆ
 * @param {Object} filters - เงื่อนไขในการค้นหา
 * @param {Object} options - ตัวเลือกในการค้นหา (เช่น sorting, pagination)
 * @returns {Array} - ข้อมูลศิษย์เก่าที่ตรงตามเงื่อนไข
 */
export const searchAlumni = async (filters, options = {}) => {
  const query = {};
  
  // สร้าง query ตามเงื่อนไขที่ได้รับ
  if (filters.idCard) {
    query.idCard = { $regex: filters.idCard, $options: 'i' };
  }
  
  if (filters.name) {
    query.$or = [
      { firstName: { $regex: filters.name, $options: 'i' } },
      { lastName: { $regex: filters.name, $options: 'i' } }
    ];
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.graduationYear) {
    query.graduationYear = filters.graduationYear;
  }
  
  if (filters.department) {
    query.department = filters.department;
  }
  
  // กำหนดการเรียงลำดับ
  const sort = options.sort || { createdAt: -1 };
  
  // กำหนด pagination
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  
  // ค้นหาข้อมูล
  const alumni = await Alumni.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  // นับจำนวนทั้งหมด
  const total = await Alumni.countDocuments(query);
  
  return {
    data: alumni,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export default {
  checkStatusByIdCard,
  updateAlumniStatus,
  getRegistrationStatistics,
  searchAlumni
};