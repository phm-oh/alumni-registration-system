// src/features/alumni/alumni.service.js
import Alumni from './alumni.model.js';
import { 
  sendRegistrationEmail, 
  sendAdminNotificationEmail, 
  sendStatusUpdateEmail 
} from '../../utils/email.js';
import { uploadToCloudinary } from '../../utils/upload.js';

/**
 * สร้างการลงทะเบียนศิษย์เก่าใหม่
 */
export const createAlumniRegistration = async (alumniData, paymentProofFile = null) => {
  const {
    firstName, lastName, idCard, address, graduationYear, department,
    phone, email, currentJob, workplace, facebookId, lineId,
    paymentMethod, deliveryOption, pdpaConsent
  } = alumniData;

  // ตรวจสอบว่ามีศิษย์เก่าลงทะเบียนด้วย idCard นี้แล้วหรือไม่
  const existingAlumni = await Alumni.findOne({ idCard });
  if (existingAlumni) {
    throw new Error('เลขบัตรประชาชนนี้ได้ลงทะเบียนแล้ว');
  }
  
  // สร้างข้อมูลศิษย์เก่าใหม่
  const newAlumni = new Alumni({
    firstName, lastName, idCard, address, graduationYear, department,
    phone, email, currentJob, workplace, facebookId, lineId,
    paymentMethod, deliveryOption, pdpaConsent,
    status: paymentMethod === 'ชำระด้วยตนเอง' ? 'รอการชำระเงิน' : 'รอตรวจสอบ'
  });
  
  // กำหนดค่าจัดส่งและยอดรวม
  if (deliveryOption === 'จัดส่งทางไปรษณีย์') {
    newAlumni.shippingFee = 30;
    newAlumni.totalAmount = 230;
  }

  // ถ้ามีการอัปโหลดไฟล์หลักฐานการชำระเงิน
  if (paymentProofFile) {
    const result = await uploadToCloudinary(paymentProofFile);
    newAlumni.paymentProofUrl = result.secure_url;
    newAlumni.paymentDate = new Date();
    newAlumni.status = 'รอตรวจสอบ';
  }

  // บันทึกข้อมูล
  await newAlumni.save();
  
  // ส่งอีเมลแจ้งเตือน
  await sendRegistrationEmail(newAlumni);
  await sendAdminNotificationEmail(newAlumni);

  return newAlumni;
};

/**
 * อัปโหลดหลักฐานการชำระเงิน
 */
export const uploadPaymentProof = async (idCard, paymentProofFile, paymentDetails) => {
  // ตรวจสอบว่ามีข้อมูลศิษย์เก่าหรือไม่
  const alumni = await Alumni.findOne({ idCard });
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลการลงทะเบียน');
  }
  
  // ตรวจสอบว่ามีไฟล์หรือไม่
  if (!paymentProofFile) {
    throw new Error('กรุณาอัปโหลดหลักฐานการชำระเงิน');
  }
  
  // อัปโหลดไฟล์ไปยัง Cloudinary
  const result = await uploadToCloudinary(paymentProofFile);
  
  // อัปเดตข้อมูลศิษย์เก่า
  alumni.paymentProofUrl = result.secure_url;
  alumni.paymentDate = new Date();
  alumni.paymentDetails = paymentDetails || '';
  alumni.status = 'รอตรวจสอบ';
  
  await alumni.save();
  
  // ส่งอีเมลแจ้งเตือน Admin
  await sendAdminNotificationEmail(alumni);
  
  return alumni;
};

/**
 * ตรวจสอบสถานะการลงทะเบียนโดยใช้เลขบัตรประชาชน
 */
export const checkRegistrationStatus = async (idCard) => {
  const alumni = await Alumni.findOne({ idCard });
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลการลงทะเบียน กรุณาตรวจสอบเลขบัตรประชาชนอีกครั้ง');
  }
  
  return {
    fullName: `${alumni.firstName} ${alumni.lastName}`,
    status: alumni.status,
    registrationDate: alumni.registrationDate,
    paymentMethod: alumni.paymentMethod,
    deliveryOption: alumni.deliveryOption,
    totalAmount: alumni.totalAmount,
    paymentDate: alumni.paymentDate,
    paymentProofUrl: alumni.paymentProofUrl
  };
};

/**
 * อัปเดตสถานะการลงทะเบียน (สำหรับ Admin)
 */
export const updateAlumniStatus = async (id, status, notes, userId) => {
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
    notes,
    updatedBy: userId,
    updatedAt: new Date()
  });
  
  await alumni.save();
  
  // ส่งอีเมลแจ้งเตือนการอัปเดตสถานะ
  await sendStatusUpdateEmail(alumni);
  
  return alumni;
};

/**
 * ดึงข้อมูลศิษย์เก่าทั้งหมด (สำหรับ Admin)
 */
export const getAllAlumni = async (filters = {}, options = {}) => {
  const query = {};
  
  // สร้าง query ตามเงื่อนไขที่ได้รับ
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.graduationYear) {
    query.graduationYear = filters.graduationYear;
  }
  
  if (filters.department) {
    query.department = filters.department;
  }
  
  if (filters.name) {
    query.$or = [
      { firstName: { $regex: filters.name, $options: 'i' } },
      { lastName: { $regex: filters.name, $options: 'i' } }
    ];
  }
  
  if (filters.idCard) {
    query.idCard = { $regex: filters.idCard, $options: 'i' };
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

/**
 * ดึงข้อมูลศิษย์เก่าตาม ID
 */
export const getAlumniById = async (id) => {
  const alumni = await Alumni.findById(id);
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลศิษย์เก่า');
  }
  
  return alumni;
};

/**
 * ดึงข้อมูลสถิติการลงทะเบียน
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
  
  // รายได้ทั้งหมด (จากศิษย์เก่าที่อนุมัติแล้ว)
  const paymentStats = await Alumni.aggregate([
    {
      $match: { status: 'อนุมัติแล้ว' }
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

export default {
  createAlumniRegistration,
  uploadPaymentProof,
  checkRegistrationStatus,
  updateAlumniStatus,
  getAllAlumni,
  getAlumniById,
  getRegistrationStatistics
};