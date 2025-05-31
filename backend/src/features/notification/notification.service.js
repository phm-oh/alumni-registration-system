// Path: src/features/notification/notification.service.js
// ไฟล์: notification.service.js - อัปเดตเพื่อเพิ่ม shipping notifications

import Notification from './notification.model.js';

/**
 * สร้างการแจ้งเตือนใหม่
 */
export const createNotification = async (notificationData) => {
  const {
    title,
    message,
    type,
    relatedId = null,
    userId = null,  // ถ้าไม่ระบุ = แจ้งเตือนทุกคน
    priority = 'normal',
    expiresAt = null
  } = notificationData;

  const notification = new Notification({
    title,
    message,
    type,
    relatedId,
    userId,
    priority,
    expiresAt
  });

  await notification.save();
  return notification;
};

/**
 * สร้างการแจ้งเตือนการลงทะเบียนใหม่
 */
export const createNewRegistrationNotification = async (alumni) => {
  return await createNotification({
    title: 'มีการลงทะเบียนศิษย์เก่าใหม่',
    message: `${alumni.firstName} ${alumni.lastName} ได้ลงทะเบียนเป็นสมาชิกศิษย์เก่า`,
    type: 'new_registration',
    relatedId: alumni._id,
    priority: 'normal'
  });
};

/**
 * สร้างการแจ้งเตือนการอัปโหลดหลักฐานการชำระเงิน
 */
export const createPaymentUploadedNotification = async (alumni) => {
  return await createNotification({
    title: 'มีการอัปโหลดหลักฐานการชำระเงิน',
    message: `${alumni.firstName} ${alumni.lastName} ได้อัปโหลดหลักฐานการชำระเงิน`,
    type: 'payment_uploaded',
    relatedId: alumni._id,
    priority: 'high'
  });
};

/**
 * สร้างการแจ้งเตือนการอัปเดตสถานะ 
 */
export const createStatusUpdatedNotification = async (alumni, oldStatus, newStatus) => {
  return await createNotification({
    title: 'มีการอัปเดตสถานะสมาชิก',
    message: `สถานะของ ${alumni.firstName} ${alumni.lastName} เปลี่ยนจาก "${oldStatus}" เป็น "${newStatus}"`,
    type: 'status_updated',
    relatedId: alumni._id,
    priority: 'normal'
  });
};

/**
 * สร้างการแจ้งเตือนการอัปเดตตำแหน่ง
 */
export const createPositionUpdatedNotification = async (alumni, oldPosition, newPosition) => {
  return await createNotification({
    title: 'มีการอัปเดตตำแหน่งสมาชิก',
    message: `ตำแหน่งของ ${alumni.firstName} ${alumni.lastName} เปลี่ยนจาก "${oldPosition}" เป็น "${newPosition}"`,
    type: 'position_updated',
    relatedId: alumni._id,
    priority: 'high'
  });
};

// 🚀 === SHIPPING NOTIFICATIONS === 🚀

/**
 * สร้างการแจ้งเตือนการอัปเดตสถานะการจัดส่ง
 */
export const createShippingNotification = async (alumni, oldStatus, newStatus) => {
  const statusMessages = {
    'รอการจัดส่ง': 'กำลังเตรียมบัตรสมาชิกเพื่อจัดส่ง',
    'กำลังจัดส่ง': 'บัตรสมาชิกถูกส่งออกแล้ว',
    'จัดส่งแล้ว': 'บัตรสมาชิกถูกจัดส่งเรียบร้อยแล้ว'
  };

  const priority = newStatus === 'จัดส่งแล้ว' ? 'high' : 'normal';

  return await createNotification({
    title: 'อัปเดตสถานะการจัดส่งบัตรสมาชิก',
    message: `การจัดส่งบัตรสมาชิกของ ${alumni.firstName} ${alumni.lastName} เปลี่ยนเป็น "${newStatus}" - ${statusMessages[newStatus]}`,
    type: 'shipping_updated',
    relatedId: alumni._id,
    priority: priority
  });
};

/**
 * สร้างการแจ้งเตือนสำหรับ bulk shipping
 */
export const createBulkShippingNotification = async (shippingResults, batchInfo) => {
  const { success, errors, total } = shippingResults;
  const successCount = success.length;
  const errorCount = errors.length;

  return await createNotification({
    title: 'ดำเนินการจัดส่งแบบกลุ่มเสร็จสิ้น',
    message: `จัดส่งแบบกลุ่ม: สำเร็จ ${successCount} รายการ, ล้มเหลว ${errorCount} รายการ จากทั้งหมด ${total} รายการ`,
    type: 'bulk_shipping',
    relatedId: null,
    priority: errorCount > 0 ? 'high' : 'normal'
  });
};

/**
 * สร้างการแจ้งเตือนเมื่อมีการปิ้น label
 */
export const createLabelPrintedNotification = async (alumni, labelType = 'single') => {
  return await createNotification({
    title: `พิมพ์ label การจัดส่งแล้ว`,
    message: `Label สำหรับ ${alumni.firstName} ${alumni.lastName} ถูกสร้างและพิมพ์แล้ว (${labelType})`,
    type: 'label_printed',
    relatedId: alumni._id,
    priority: 'low'
  });
};

/**
 * สร้างการแจ้งเตือนเมื่อมีการติดตามพัสดุ
 */
export const createTrackingNotification = async (alumni, trackingData) => {
  return await createNotification({
    title: 'มีการติดตามพัสดุ',
    message: `มีการติดตามพัสดุของ ${alumni.firstName} ${alumni.lastName} (${alumni.trackingNumber})`,
    type: 'tracking_inquiry',
    relatedId: alumni._id,
    priority: 'low'
  });
};

/**
 * สร้างการแจ้งเตือนสำหรับรายการที่ต้องจัดส่งด่วน
 */
export const createUrgentShippingNotification = async (urgentCount) => {
  if (urgentCount === 0) return null;

  const message = urgentCount === 1 
    ? 'มีบัตรสมาชิก 1 รายการที่ค้างการจัดส่งนานเกิน 7 วัน'
    : `มีบัตรสมาชิก ${urgentCount} รายการที่ค้างการจัดส่งนานเกิน 7 วัน`;

  return await createNotification({
    title: '⚠️ แจ้งเตือน: การจัดส่งค้างนาน',
    message: message,
    type: 'urgent_shipping',
    relatedId: null,
    priority: 'urgent'
  });
};

/**
 * สร้างการแจ้งเตือนรายสัปดาห์สำหรับสรุปการจัดส่ง
 */
export const createWeeklyShippingSummaryNotification = async (summaryData) => {
  const { shipped, pending, problems } = summaryData;

  return await createNotification({
    title: '📊 สรุปการจัดส่งประจำสัปดาห์',
    message: `สรุปสัปดาห์นี้: จัดส่งแล้ว ${shipped} รายการ, รอจัดส่ง ${pending} รายการ, ปัญหา ${problems} รายการ`,
    type: 'weekly_summary',
    relatedId: null,
    priority: 'low',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // หมดอายุใน 7 วัน
  });
};

// 🚀 === NOTIFICATION QUERIES === 🚀

/**
 * ดึงการแจ้งเตือนที่เกี่ยวข้องกับการจัดส่ง
 */
export const getShippingNotifications = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    priority = null
  } = options;

  const query = {
    $or: [
      { userId: userId },
      { userId: null }
    ],
    type: { 
      $in: [
        'shipping_updated', 
        'bulk_shipping', 
        'label_printed', 
        'tracking_inquiry', 
        'urgent_shipping',
        'weekly_summary'
      ] 
    }
  };

  if (priority) {
    query.priority = priority;
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(query)
    .populate('relatedId', 'firstName lastName idCard trackingNumber shippingStatus')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);

  return {
    data: notifications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * ดึงการแจ้งเตือนที่ต้องการความสนใจด่วน
 */
export const getUrgentNotifications = async (userId) => {
  return await Notification.find({
    $or: [
      { userId: userId },
      { userId: null }
    ],
    priority: { $in: ['high', 'urgent'] },
    'readBy.user': { $ne: userId }
  })
  .populate('relatedId', 'firstName lastName idCard trackingNumber shippingStatus')
  .sort({ createdAt: -1 })
  .limit(10);
};

/**
 * ดึงสถิติการแจ้งเตือนการจัดส่ง
 */
export const getShippingNotificationStats = async () => {
  const stats = await Notification.aggregate([
    {
      $match: {
        type: { 
          $in: [
            'shipping_updated', 
            'bulk_shipping', 
            'label_printed', 
            'tracking_inquiry', 
            'urgent_shipping'
          ] 
        },
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // ล่าสุด 30 วัน
        }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        latestCreated: { $max: '$createdAt' }
      }
    }
  ]);

  // นับการแจ้งเตือนด่วน
  const urgentCount = await Notification.countDocuments({
    priority: 'urgent',
    type: 'urgent_shipping',
    createdAt: { 
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // ล่าสุด 7 วัน
    }
  });

  return {
    stats,
    urgentShippingAlerts: urgentCount
  };
};

/**
 * ดึงข้อมูลสถิติการแจ้งเตือนทั้งหมด (รวม shipping)
 */
export const getNotificationsForUser = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    isRead = null,
    type = null
  } = options;

  const query = {
    $or: [
      { userId: userId },  // การแจ้งเตือนเฉพาะบุคคล
      { userId: null }     // การแจ้งเตือนทั่วไป
    ]
  };

  if (isRead !== null) {
    if (isRead) {
      query['readBy.user'] = userId;
    } else {
      query['readBy.user'] = { $ne: userId };
    }
  }

  if (type) {
    query.type = type;
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(query)
    .populate('relatedId', 'firstName lastName idCard trackingNumber shippingStatus')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);

  return {
    data: notifications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    unreadCount: await getUnreadCount(userId)
  };
};

/**
 * ดึงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
 */
export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    $or: [
      { userId: userId },
      { userId: null }
    ],
    'readBy.user': { $ne: userId }
  });
};

/**
 * ทำเครื่องหมายว่าอ่านแล้ว
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    throw new Error('ไม่พบการแจ้งเตือน');
  }

  // ตรวจสอบว่าผู้ใช้อ่านแล้วหรือยัง
  const alreadyRead = notification.readBy.some(
    read => read.user.toString() === userId.toString()
  );

  if (!alreadyRead) {
    notification.readBy.push({
      user: userId,
      readAt: new Date()
    });
    await notification.save();
  }

  return notification;
};

/**
 * ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
 */
export const markAllAsRead = async (userId) => {
  const notifications = await Notification.find({
    $or: [
      { userId: userId },
      { userId: null }
    ],
    'readBy.user': { $ne: userId }
  });

  const updatePromises = notifications.map(notification => {
    notification.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return notification.save();
  });

  await Promise.all(updatePromises);
  
  return { updated: notifications.length };
};

/**
 * ลบการแจ้งเตือน
 */
export const deleteNotification = async (notificationId) => {
  const notification = await Notification.findByIdAndDelete(notificationId);
  
  if (!notification) {
    throw new Error('ไม่พบการแจ้งเตือน');
  }

  return notification;
};

/**
 * ลบการแจ้งเตือนที่เก่าเกินไป (เก่ากว่า 30 วัน)
 */
export const cleanupOldNotifications = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await Notification.deleteMany({
    createdAt: { $lt: thirtyDaysAgo }
  });

  return { deletedCount: result.deletedCount };
};

export default {
  createNotification,
  createNewRegistrationNotification,
  createPaymentUploadedNotification,
  createStatusUpdatedNotification,
  createPositionUpdatedNotification,
  // 🚀 Shipping notifications
  createShippingNotification,
  createBulkShippingNotification,
  createLabelPrintedNotification,
  createTrackingNotification,
  createUrgentShippingNotification,
  createWeeklyShippingSummaryNotification,
  // Queries
  getNotificationsForUser,
  getShippingNotifications,
  getUrgentNotifications,
  getShippingNotificationStats,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications
};