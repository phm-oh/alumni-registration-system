// src/features/notification/notification.service.js
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

/**
 * ดึงการแจ้งเตือนสำหรับผู้ใช้
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
    .populate('relatedId', 'firstName lastName idCard')
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
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications
};