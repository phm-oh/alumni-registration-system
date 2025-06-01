// Path: src/features/alumni/shipping.service.js
// ไฟล์: shipping.service.js - ไฟล์ใหม่จัดการระบบการจัดส่ง

import Alumni from './alumni.model.js';
import { sendShippingNotificationEmail } from '../../utils/email.js';
import { createShippingNotification } from '../notification/notification.service.js';

/**
 * 🚀 ดึงรายชื่อศิษย์เก่าที่ต้องจัดส่ง
 * แสดงเฉพาะคนที่: อนุมัติแล้ว + เลือกจัดส่งทางไปรษณีย์ + รอการจัดส่ง
 */
export const getShippingList = async (filters = {}, options = {}) => {
  const {
    shippingStatus = 'รอการจัดส่ง',
    graduationYear,
    department,
    search,
    page = 1,
    limit = 20,
    sort = { createdAt: -1 }
  } = { ...filters, ...options };

  // Query หลัก: ต้องเป็นคนที่อนุมัติแล้ว + เลือกจัดส่ง
  const query = {
    status: 'อนุมัติ',  // อนุมัติแล้วเท่านั้น
    deliveryOption: 'จัดส่งทางไปรษณีย์',  // เลือกจัดส่งเท่านั้น
    shippingStatus: shippingStatus  // สถานะการจัดส่งตามที่ระบุ
  };

  // กรองเพิ่มเติม
  if (graduationYear) {
    query.graduationYear = graduationYear;
  }

  if (department) {
    query.department = department;
  }

  if (search && search.trim()) {
    query.$or = [
      { firstName: { $regex: search.trim(), $options: 'i' } },
      { lastName: { $regex: search.trim(), $options: 'i' } },
      { idCard: { $regex: search.trim(), $options: 'i' } },
      { trackingNumber: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  // ดึงข้อมูล
  const alumni = await Alumni.find(query)
    .populate('shippedBy', 'username')
    .populate('shippingHistory.updatedBy', 'username')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Alumni.countDocuments(query);

  return {
    data: alumni,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    summary: {
      readyToShip: await Alumni.countDocuments({
        status: 'อนุมัติ',
        deliveryOption: 'จัดส่งทางไปรษณีย์',
        shippingStatus: 'รอการจัดส่ง'
      }),
      shipping: await Alumni.countDocuments({
        status: 'อนุมัติ',
        deliveryOption: 'จัดส่งทางไปรษณีย์',
        shippingStatus: 'กำลังจัดส่ง'
      }),
      shipped: await Alumni.countDocuments({
        status: 'อนุมัติ',
        deliveryOption: 'จัดส่งทางไปรษณีย์',
        shippingStatus: 'จัดส่งแล้ว'
      })
    }
  };
};

/**
 * 🚀 อัปเดตสถานะการจัดส่ง
 */
export const updateShippingStatus = async (alumniId, shippingData, userId) => {
  const { 
    shippingStatus, 
    trackingNumber, 
    notes, 
    shippedDate 
  } = shippingData;

  // ตรวจสอบว่ามีศิษย์เก่าคนนี้หรือไม่
  const alumni = await Alumni.findById(alumniId);
  if (!alumni) {
    throw new Error('ไม่พบข้อมูลศิษย์เก่า');
  }

  // ตรวจสอบว่าสามารถอัปเดตได้หรือไม่
  if (alumni.status !== 'อนุมัติ') {
    throw new Error('ไม่สามารถจัดส่งได้ เนื่องจากยังไม่ได้รับการอนุมัติ');
  }

  if (alumni.deliveryOption !== 'จัดส่งทางไปรษณีย์') {
    throw new Error('สมาชิกคนนี้เลือกรับที่วิทยาลัย ไม่ต้องจัดส่ง');
  }

  // ตรวจสอบ tracking number สำหรับสถานะที่ต้องการ
  if (['กำลังจัดส่ง', 'จัดส่งแล้ว'].includes(shippingStatus) && !trackingNumber) {
    throw new Error('กรุณากรอกเลขติดตามพัสดุ');
  }

  // บันทึกข้อมูลเดิมเพื่อส่งอีเมล
  const oldStatus = alumni.shippingStatus;

  // อัปเดตข้อมูลการจัดส่ง
  alumni.updateShippingStatus(shippingStatus, trackingNumber, notes, userId);

  // ถ้าระบุวันที่จัดส่งมาเอง
  if (shippedDate && shippingStatus === 'จัดส่งแล้ว') {
    alumni.shippedDate = new Date(shippedDate);
  }

  await alumni.save();

  console.log(`✅ Shipping status updated: ${alumni.fullName} from "${oldStatus}" to "${shippingStatus}"`);

  // ส่งอีเมลแจ้งเตือน (ถ้าสถานะเปลี่ยน)
  if (oldStatus !== shippingStatus) {
    try {
      await sendShippingNotificationEmail(alumni, oldStatus, shippingStatus);
      console.log('✅ Shipping notification email sent');
    } catch (error) {
      console.error('❌ Failed to send shipping notification email:', error);
    }

    // สร้างการแจ้งเตือนในระบบ
    try {
      await createShippingNotification(alumni, oldStatus, shippingStatus);
      console.log('✅ System shipping notification created');
    } catch (error) {
      console.error('❌ Failed to create system shipping notification:', error);
    }
  }

  return alumni;
};

/**
 * 🚀 จัดส่งแบบกลุ่ม (Bulk shipping)
 */
export const bulkUpdateShipping = async (alumniIds, shippingData, userId) => {
  const { shippingStatus, notes } = shippingData;
  
  if (!Array.isArray(alumniIds) || alumniIds.length === 0) {
    throw new Error('กรุณาเลือกรายชื่อที่ต้องการจัดส่ง');
  }

  // ตรวจสอบว่าทุกคนพร้อมจัดส่งหรือไม่
  const alumni = await Alumni.find({
    _id: { $in: alumniIds },
    status: 'อนุมัติ',
    deliveryOption: 'จัดส่งทางไปรษณีย์'
  });

  if (alumni.length !== alumniIds.length) {
    throw new Error('มีบางรายชื่อที่ไม่สามารถจัดส่งได้');
  }

  const results = [];
  const errors = [];

  // อัปเดตทีละคน
  for (const person of alumni) {
    try {
      // สำหรับการจัดส่งแบบกลุ่ม จะไม่มี tracking number
      person.updateShippingStatus(shippingStatus, null, notes, userId);
      await person.save();
      
      results.push({
        id: person._id,
        name: person.fullName,
        success: true
      });
    } catch (error) {
      errors.push({
        id: person._id,
        name: person.fullName,
        error: error.message
      });
    }
  }

  return {
    success: results,
    errors,
    total: alumniIds.length,
    updated: results.length,
    failed: errors.length
  };
};

/**
 * 🚀 ดึงข้อมูลสถิติการจัดส่ง
 */
export const getShippingStatistics = async () => {
  // จำนวนคนที่เลือกจัดส่งทั้งหมด
  const totalShippingMembers = await Alumni.countDocuments({
    deliveryOption: 'จัดส่งทางไปรษณีย์',
    status: 'อนุมัติ'
  });

  // แยกตามสถานะการจัดส่ง
  const shippingStatusCounts = await Alumni.aggregate([
    {
      $match: {
        deliveryOption: 'จัดส่งทางไปรษณีย์',
        status: 'อนุมัติ'
      }
    },
    {
      $group: {
        _id: '$shippingStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  // การจัดส่งตามแผนกวิชา
  const departmentShipping = await Alumni.aggregate([
    {
      $match: {
        deliveryOption: 'จัดส่งทางไปรษณีย์',
        status: 'อนุมัติ'
      }
    },
    {
      $group: {
        _id: {
          department: '$department',
          shippingStatus: '$shippingStatus'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.department',
        statuses: {
          $push: {
            status: '$_id.shippingStatus',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);

  // การจัดส่งในแต่ละเดือน
  const monthlyShipping = await Alumni.aggregate([
    {
      $match: {
        deliveryOption: 'จัดส่งทางไปรษณีย์',
        status: 'อนุมัติ',
        shippedDate: { $exists: true }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$shippedDate' },
          month: { $month: '$shippedDate' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    }
  ]);

  return {
    totalShippingMembers,
    shippingStatusCounts,
    departmentShipping,
    monthlyShipping
  };
};

/**
 * 🚀 ค้นหาด้วยเลขติดตาม
 */
export const trackShipment = async (trackingNumber) => {
  if (!trackingNumber || !trackingNumber.trim()) {
    throw new Error('กรุณากรอกเลขติดตามพัสดุ');
  }

  const alumni = await Alumni.findOne({ 
    trackingNumber: trackingNumber.trim() 
  })
  .populate('shippedBy', 'username')
  .populate('shippingHistory.updatedBy', 'username');

  if (!alumni) {
    throw new Error('ไม่พบข้อมูลการจัดส่งด้วยเลขติดตามนี้');
  }

  return {
    alumni,
    trackingInfo: {
      trackingNumber: alumni.trackingNumber,
      shippingStatus: alumni.shippingStatus,
      shippedDate: alumni.shippedDate,
      shippedBy: alumni.shippedBy,
      deliveryNotes: alumni.deliveryNotes,
      shippingHistory: alumni.shippingHistory
    }
  };
};

export default {
  getShippingList,
  updateShippingStatus,
  bulkUpdateShipping,
  getShippingStatistics,
  trackShipment
};