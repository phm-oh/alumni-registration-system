// Path: src/features/alumni/alumni.service.js  
// ไฟล์: alumni.service.js - อัปเดตเพื่อรองรับระบบการจัดส่ง

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
 * สร้างการลงทะเบียนศิษย์เก่าใหม่ 🚀 อัปเดตสำหรับ shipping
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
  
  // กำหนดค่าจัดส่งและยอดรวม (middleware จะจัดการ shippingStatus)
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
  
  console.log('✅ New alumni registered:', newAlumni._id, newAlumni.firstName, newAlumni.lastName, `Shipping: ${newAlumni.shippingStatus}`);
  
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
 * 🚀 แก้ไข: เพิ่ม trackingNumber และข้อมูลการจัดส่งครบถ้วน
 */
export const checkRegistrationStatus = async (idCard) => {
  const alumni = await Alumni.findOne({ idCard });
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลการลงทะเบียน กรุณาตรวจสอบเลขบัตรประชาชนอีกครั้ง');
  }
  
  return {
    // ข้อมูลพื้นฐาน
    firstName: alumni.firstName,
    lastName: alumni.lastName,
    department: alumni.department,
    graduationYear: alumni.graduationYear,
    
    // สถานะการลงทะเบียน
    status: alumni.status,
    position: alumni.position,
    registrationDate: alumni.registrationDate,
    
    // ข้อมูลการชำระเงิน
    paymentMethod: alumni.paymentMethod,
    totalAmount: alumni.totalAmount,
    paymentDate: alumni.paymentDate,
    paymentProofUrl: alumni.paymentProofUrl,
    
    // ข้อมูลการจัดส่ง
    deliveryOption: alumni.deliveryOption,
    shippingStatus: alumni.shippingStatus,
    
    // 🚀 เพิ่มข้อมูลการจัดส่งที่ขาดหาย
    trackingNumber: alumni.trackingNumber || null,
    shippedDate: alumni.shippedDate || null,
    deliveryNotes: alumni.deliveryNotes || null,
    
    // 🚀 เพิ่มข้อมูลสำหรับแสดงสถานะที่ละเอียดขึ้น
    canTrack: !!(alumni.trackingNumber && alumni.shippingStatus !== 'ไม่ต้องจัดส่ง'),
    estimatedDelivery: alumni.shippingStatus === 'กำลังจัดส่ง' && alumni.shippedDate 
      ? new Date(new Date(alumni.shippedDate).getTime() + 3 * 24 * 60 * 60 * 1000) // +3 วัน
      : null,
    
    // 🚀 ข้อความสถานะที่เข้าใจง่าย
    statusMessage: getStatusMessage(alumni.status, alumni.shippingStatus, alumni.trackingNumber),
    
    // 🚀 ข้อมูลการติดตาม (ถ้ามี)
    trackingInfo: alumni.trackingNumber ? {
      trackingNumber: alumni.trackingNumber,
      shippingStatus: alumni.shippingStatus,
      shippedDate: alumni.shippedDate,
      deliveryNotes: alumni.deliveryNotes,
      canTrackOnline: true,
      trackingUrl: `${process.env.FRONTEND_URL}/track/${alumni.trackingNumber}`
    } : null
  };
};


/**
 * 🚀 Helper function: สร้างข้อความสถานะที่เข้าใจง่าย
 */
const getStatusMessage = (status, shippingStatus, trackingNumber) => {
  if (status === 'รอตรวจสอบ') {
    return 'เจ้าหน้าที่กำลังตรวจสอบข้อมูลและหลักฐานการชำระเงินของท่าน';
  }
  
  if (status === 'รอการชำระเงิน') {
    return 'กรุณาชำระเงินและอัปโหลดหลักฐานการโอนเงิน';
  }
  
  if (status === 'ปฏิเสธ') {
    return 'ข้อมูลหรือหลักฐานไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่';
  }
  
  if (status === 'อนุมัติ') {
    switch (shippingStatus) {
      case 'ไม่ต้องจัดส่ง':
        return 'ท่านสามารถมารับบัตรสมาชิกได้ที่วิทยาลัย';
      case 'รอการจัดส่ง':
        return 'บัตรสมาชิกของท่านอยู่ระหว่างการเตรียมจัดส่ง';
      case 'กำลังจัดส่ง':
        return trackingNumber 
          ? `บัตรสมาชิกถูกจัดส่งแล้ว เลขติดตาม: ${trackingNumber}`
          : 'บัตรสมาชิกถูกจัดส่งแล้ว';
      case 'จัดส่งแล้ว':
        return 'บัตรสมาชิกถูกจัดส่งถึงท่านเรียบร้อยแล้ว';
      default:
        return 'ท่านได้รับการอนุมัติเป็นสมาชิกแล้ว';
    }
  }
  
  return 'กรุณาติดต่อเจ้าหน้าที่เพื่อสอบถามรายละเอียด';
};

/**
 * อัปเดตสถานะการลงทะเบียน (สำหรับ Admin) 🚀 อัปเดตเพื่อจัดการ shipping
 */
export const updateAlumniStatus = async (id, status, notes, userId) => {
  const alumni = await Alumni.findById(id);
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลศิษย์เก่า');
  }
  
  const oldStatus = alumni.status;
  
  // อัปเดตสถานะ
  alumni.status = status;
  
  // 🚀 Logic การจัดการ shippingStatus เมื่อเปลี่ยนสถานะหลัก
  if (status === 'อนุมัติ' && alumni.deliveryOption === 'จัดส่งทางไปรษณีย์') {
    // ถ้าอนุมัติและเลือกจัดส่ง ให้เปลี่ยนเป็น "รอการจัดส่ง"
    alumni.shippingStatus = 'รอการจัดส่ง';
  } else if (status === 'อนุมัติ' && alumni.deliveryOption === 'รับที่วิทยาลัย') {
    // ถ้าอนุมัติและเลือกรับเอง ให้เปลี่ยนเป็น "ไม่ต้องจัดส่ง"
    alumni.shippingStatus = 'ไม่ต้องจัดส่ง';
  } else if (status === 'ปฏิเสธ') {
    // ถ้าปฏิเสธ ยกเลิกการจัดส่ง
    alumni.shippingStatus = 'ไม่ต้องจัดส่ง';
  }
  
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
  
  console.log(`✅ Status updated: ${alumni.fullName} from "${oldStatus}" to "${status}", Shipping: ${alumni.shippingStatus}`);
  
  // ส่งอีเมลแจ้งเตือนการอัปเดตสถานะ
  await sendStatusUpdateEmail(alumni);
  
  // สร้างการแจ้งเตือนในระบบ
  if (oldStatus !== status) {
    await createStatusUpdatedNotification(alumni, oldStatus, status);
  }
  
  return alumni;
};

/**
 * อัปเดตตำแหน่งสมาชิก (สำหรับ Admin) - ไม่เปลี่ยนแปลง
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
 * ดึงข้อมูลศิษย์เก่าทั้งหมด (สำหรับ Admin) 🚀 เพิ่มการกรอง shipping
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
  
  // 🚀 เพิ่มการกรองตาม shippingStatus
  if (filters.shippingStatus) {
    query.shippingStatus = filters.shippingStatus;
  }
  
  // 🚀 เพิ่มการกรองตาม deliveryOption
  if (filters.deliveryOption) {
    query.deliveryOption = filters.deliveryOption;
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
  
  // ค้นหาข้อมูล 🚀 เพิ่ม populate สำหรับ shipping
  const alumni = await Alumni.find(query)
    .populate('statusHistory.updatedBy', 'username')
    .populate('positionHistory.updatedBy', 'username')
    .populate('shippedBy', 'username')  // 🚀 เพิ่ม
    .populate('shippingHistory.updatedBy', 'username')  // 🚀 เพิ่ม
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
 * ดึงข้อมูลศิษย์เก่าตาม ID 🚀 เพิ่ม populate shipping
 */
export const getAlumniById = async (id) => {
  const alumni = await Alumni.findById(id)
    .populate('statusHistory.updatedBy', 'username')
    .populate('positionHistory.updatedBy', 'username')
    .populate('shippedBy', 'username')  // 🚀 เพิ่ม
    .populate('shippingHistory.updatedBy', 'username');  // 🚀 เพิ่ม
    
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลศิษย์เก่า');
  }
  
  return alumni;
};

/**
 * ดึงข้อมูลสถิติการลงทะเบียน 🚀 เพิ่มสถิติการจัดส่ง
 */
export const getRegistrationStatistics = async () => {
  console.log('🔍 Calculating registration statistics...');
  
  // จำนวนศิษย์เก่าทั้งหมด
  const totalAlumni = await Alumni.countDocuments();
  console.log(`Total alumni: ${totalAlumni}`);
  
  // ดึงข้อมูล status ทั้งหมดเพื่อ debug
  const allStatuses = await Alumni.distinct('status');
  console.log('All statuses in database:', allStatuses);
  
  // จำนวนศิษย์เก่าแยกตามสถานะ
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
  const approvedCount = (statusMap['อนุมัติ'] || 0) + (statusMap['อนุมัติแล้ว'] || 0);
  const waitingPaymentCount = (statusMap['รอการชำระเงิน'] || 0);
  const rejectedCount = (statusMap['ปฏิเสธ'] || 0) + (statusMap['ยกเลิก'] || 0);
  
  // 🚀 สถิติการจัดส่งใหม่
  const shippingStats = await Alumni.aggregate([
    {
      $match: { deliveryOption: 'จัดส่งทางไปรษณีย์' }
    },
    {
      $group: {
        _id: '$shippingStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const shippingMap = {};
  shippingStats.forEach(item => {
    shippingMap[item._id] = item.count;
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
  
  // 🚀 สถิติการจัดส่งแยกตามแผนกวิชา
  const departmentShippingStats = await Alumni.aggregate([
    {
      $match: { deliveryOption: 'จัดส่งทางไปรษณีย์' }
    },
    {
      $group: {
        _id: {
          department: '$department',
          shippingStatus: '$shippingStatus'
        },
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
      cancelled: rejectedCount
    },
    // 🚀 เพิ่มสถิติการจัดส่ง
    shippingStats: {
      needShipping: (shippingMap['รอการจัดส่ง'] || 0),
      shipping: (shippingMap['กำลังจัดส่ง'] || 0),
      shipped: (shippingMap['จัดส่งแล้ว'] || 0),
      noShipping: (shippingMap['ไม่ต้องจัดส่ง'] || 0)
    },
    positionStats,
    graduationYearStats,
    departmentStats,
    departmentShippingStats, // 🚀 เพิ่ม
    paymentStats: paymentStats.length > 0 ? {
      totalAmount: paymentStats[0].totalAmount,
      count: paymentStats[0].count
    } : {
      totalAmount: 0,
      count: 0
    }
  };
  
  console.log('✅ Final statistics with shipping:', finalStats);
  
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