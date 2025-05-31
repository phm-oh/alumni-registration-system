// Path: src/features/notification/notification.controller.js
// ไฟล์: notification.controller.js - คืนค่ากลับมาเป็นไฟล์เดิม

import {
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications
} from './notification.service.js';

// ดึงการแจ้งเตือนสำหรับผู้ใช้
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, isRead, type } = req.query;
    
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      isRead: isRead !== undefined ? isRead === 'true' : null,
      type: type || null
    };
    
    const results = await getNotificationsForUser(userId, options);
    
    return res.status(200).json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน',
      error: error.message
    });
  }
};

// ดึงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
export const getUnreadCountController = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);
    
    return res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงจำนวนการแจ้งเตือน',
      error: error.message
    });
  }
};

// ทำเครื่องหมายว่าอ่านแล้ว
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await markAsRead(id, userId);
    
    return res.status(200).json({
      success: true,
      message: 'ทำเครื่องหมายว่าอ่านแล้วสำเร็จ',
      data: notification
    });
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return res.status(error.message.includes('ไม่พบ') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านแล้ว'
    });
  }
};

// ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await markAllAsRead(userId);
    
    return res.status(200).json({
      success: true,
      message: 'ทำเครื่องหมายทั้งหมดว่าอ่านแล้วสำเร็จ',
      data: result
    });
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการทำเครื่องหมายทั้งหมดว่าอ่านแล้ว',
      error: error.message
    });
  }
};

// ลบการแจ้งเตือน
export const deleteNotificationController = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await deleteNotification(id);
    
    return res.status(200).json({
      success: true,
      message: 'ลบการแจ้งเตือนสำเร็จ',
      data: notification
    });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return res.status(error.message.includes('ไม่พบ') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลบการแจ้งเตือน'
    });
  }
};

// ทำความสะอาดการแจ้งเตือนเก่า (สำหรับ Admin)
export const cleanupNotifications = async (req, res) => {
  try {
    const result = await cleanupOldNotifications();
    
    return res.status(200).json({
      success: true,
      message: 'ทำความสะอาดการแจ้งเตือนเก่าสำเร็จ',
      data: result
    });
  } catch (error) {
    console.error('Error in cleanupNotifications:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการทำความสะอาดการแจ้งเตือน',
      error: error.message
    });
  }
};