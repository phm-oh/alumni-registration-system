// src/features/alumni/alumni.service.js - Fixed Statistics Status Mapping
import Alumni from './alumni.model.js';
import { 
  sendRegistrationEmail, 
  sendAdminNotificationEmail, 
  sendStatusUpdateEmail 
} from '../../utils/email.js';
import { uploadToCloudinary } from '../../utils/upload.js';
import {
  createNewRegistrationNotification,
  createPaymentUploadedNotification,
  createStatusUpdatedNotification,
  createPositionUpdatedNotification
} from '../notification/notification.service.js';

/**
 * สร้างการลงทะเบียนศิษย์เก่าใหม่
 */
export const createAlumniRegistration = async (alumniData, files = {}) => {
  // แยกไฟล์ออกมา
  const profileImageFile = files.profileImage ? files.profileImage[0] : null;
  const paymentProofFile = files.paymentProof ? files.paymentProof[0] : null;

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
    status: paymentMethod === 'ชำระด้วยตนเอง' ? 'รอการชำระเงิน' : 'รอตรวจสอบ',
    position: 'สมาชิกสามัญ'
  });
  
  // กำหนดค่าจัดส่งและยอดรวม
  if (deliveryOption === 'จัดส่งทางไปรษณีย์') {
    newAlumni.shippingFee = 30;
    newAlumni.totalAmount = 230;
  }

  // อัปโหลดรูปประจำตัว
  if (profileImageFile) {
    const profileResult = await uploadToCloudinary(profileImageFile);
    newAlumni.profileImageUrl = profileResult.secure_url;
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
  
  console.log('✅ New alumni registered:', newAlumni._id, newAlumni.firstName, newAlumni.lastName);
  
  // ส่งอีเมลแจ้งเตือน
  try {
    await sendRegistrationEmail(newAlumni);
    console.log('✅ Registration email sent');
  } catch (error) {
    console.error('❌ Failed to send registration email:', error);
  }
  
  try {
    await sendAdminNotificationEmail(newAlumni);
    console.log('✅ Admin notification email sent');
  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error);
  }
  
  // สร้างการแจ้งเตือนในระบบ
  try {
    await createNewRegistrationNotification(newAlumni);
    console.log('✅ System notification created for admins');
  } catch (error) {
    console.error('❌ Failed to create system notification:', error);
  }

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
  
  // สร้างการแจ้งเตือนในระบบ
  await createPaymentUploadedNotification(alumni);
  
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
    firstName: alumni.firstName,
    lastName: alumni.lastName,
    department: alumni.department,
    graduationYear: alumni.graduationYear,
    status: alumni.status,
    position: alumni.position,
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
  
  const oldStatus = alumni.status;
  
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
  
  // สร้างการแจ้งเตือนในระบบ
  if (oldStatus !== status) {
    await createStatusUpdatedNotification(alumni, oldStatus, status);
  }
  
  return alumni;
};

/**
 * อัปเดตตำแหน่งสมาชิก (สำหรับ Admin)
 */
export const updateAlumniPosition = async (id, position, notes, userId) => {
  const alumni = await Alumni.findById(id);
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลศิษย์เก่า');
  }
  
  const oldPosition = alumni.position;
  
  // ตรวจสอบว่าตำแหน่งที่ต้องการเปลี่ยนไปมีคนดำรงอยู่แล้วหรือไม่
  if (position !== 'สมาชิกสามัญ') {
    const existingPosition = await Alumni.findOne({ 
      position: position,
      _id: { $ne: id } 
    });
    
    // สำหรับตำแหน่งที่มีได้คนเดียว
    if (['ประธาน', 'การเงิน', 'ทะเบียน', 'ประชาสัมพันธ์'].includes(position) && existingPosition) {
      throw new Error(`ตำแหน่ง "${position}" มีผู้ดำรงตำแหน่งอยู่แล้ว`);
    }
    
    // สำหรับรองประธาน (สูงสุด 4 คน)
    if (position === 'รองประธาน') {
      const vicePresidentCount = await Alumni.countDocuments({ 
        position: 'รองประธาน',
        _id: { $ne: id }
      });
      
      if (vicePresidentCount >= 4) {
        throw new Error('ตำแหน่งรองประธานมีผู้ดำรงตำแหน่งครบ 4 คนแล้ว');
      }
    }
  }
  
  // อัปเดตตำแหน่ง
  alumni.position = position;
  
  // เพิ่มบันทึกประวัติการอัปเดตตำแหน่ง
  if (!alumni.positionHistory) {
    alumni.positionHistory = [];
  }
  
  alumni.positionHistory.push({
    position,
    notes,
    updatedBy: userId,
    updatedAt: new Date()
  });
  
  await alumni.save();
  
  // สร้างการแจ้งเตือนในระบบ
  if (oldPosition !== position) {
    await createPositionUpdatedNotification(alumni, oldPosition, position);
  }
  
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
  
  if (filters.position) {
    query.position = filters.position;
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
  
  console.log('Search query:', query); // Debug log
  
  // กำหนดการเรียงลำดับ
  const sort = options.sort || { createdAt: -1 };
  
  // กำหนด pagination
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  
  // ค้นหาข้อมูล
  const alumni = await Alumni.find(query)
    .populate('statusHistory.updatedBy', 'username')
    .populate('positionHistory.updatedBy', 'username')
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  // นับจำนวนทั้งหมด
  const total = await Alumni.countDocuments(query);
  
  console.log(`Found ${alumni.length} alumni out of ${total} total`); // Debug log
  
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
  const alumni = await Alumni.findById(id)
    .populate('statusHistory.updatedBy', 'username')
    .populate('positionHistory.updatedBy', 'username');
    
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลศิษย์เก่า');
  }
  
  return alumni;
};

/**
 * ดึงข้อมูลสถิติการลงทะเบียน - แก้ไข Status Mapping
 */
export const getRegistrationStatistics = async () => {
  console.log('🔍 Calculating registration statistics...');
  
  // จำนวนศิษย์เก่าทั้งหมด
  const totalAlumni = await Alumni.countDocuments();
  console.log(`Total alumni: ${totalAlumni}`);
  
  // ดึงข้อมูล status ทั้งหมดเพื่อ debug
  const allStatuses = await Alumni.distinct('status');
  console.log('All statuses in database:', allStatuses);
  
  // จำนวนศิษย์เก่าแยกตามสถานะ - แก้ไข mapping ให้ตรงกับข้อมูลจริง
  const statusCounts = await Alumni.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  console.log('Status counts from database:', statusCounts);
  
  // แปลงข้อมูลให้ตรงกับที่ frontend ต้องการ
  const statusMap = {};
  statusCounts.forEach(item => {
    statusMap[item._id] = item.count;
  });
  
  // Map status ให้ตรงกับที่ใช้ใน frontend
  const pendingCount = (statusMap['รอตรวจสอบ'] || 0);
  const approvedCount = (statusMap['อนุมัติ'] || 0) + (statusMap['อนุมัติแล้ว'] || 0); // รวมทั้ง 2 แบบ
  const waitingPaymentCount = (statusMap['รอการชำระเงิน'] || 0);
  const rejectedCount = (statusMap['ปฏิเสธ'] || 0) + (statusMap['ยกเลิก'] || 0); // รวมทั้ง 2 แบบ
  
  console.log('Mapped status counts:', {
    pending: pendingCount,
    approved: approvedCount,
    waitingPayment: waitingPaymentCount,
    rejected: rejectedCount
  });
  
  // จำนวนศิษย์เก่าแยกตามตำแหน่ง
  const positionStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$position',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
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
      $match: { 
        $or: [
          { status: 'อนุมัติ' },
          { status: 'อนุมัติแล้ว' }
        ]
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const finalStats = {
    totalAlumni,
    statusStats: {
      pending: pendingCount,
      approved: approvedCount,
      waitingPayment: waitingPaymentCount,
      cancelled: rejectedCount // ใช้ cancelled แทน rejected ตามที่ frontend ต้องการ
    },
    positionStats,
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
  
  console.log('✅ Final statistics:', finalStats);
  
  return finalStats;
};

/**
 * ดึงรายชื่อแผนกวิชาทั้งหมด
 */
export const getAllDepartments = async () => {
  const departments = await Alumni.distinct('department');
  return departments.sort();
};

/**
 * ดึงรายชื่อปีที่สำเร็จการศึกษาทั้งหมด
 */
export const getAllGraduationYears = async () => {
  const years = await Alumni.distinct('graduationYear');
  return years.sort((a, b) => b - a); // เรียงจากใหม่ไปเก่า
};

export default {
  createAlumniRegistration,
  uploadPaymentProof,
  checkRegistrationStatus,
  updateAlumniStatus,
  updateAlumniPosition,
  getAllAlumni,
  getAlumniById,
  getRegistrationStatistics,
  getAllDepartments,
  getAllGraduationYears
};