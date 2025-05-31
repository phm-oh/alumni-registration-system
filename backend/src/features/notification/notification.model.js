// Path: src/features/notification/notification.model.js
// ไฟล์: notification.model.js - อัปเดตเพื่อเพิ่ม shipping notification types

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'กรุณาระบุหัวข้อการแจ้งเตือน']
  },
  message: {
    type: String,
    required: [true, 'กรุณาระบุข้อความการแจ้งเตือน']
  },
  type: {
    type: String,
    enum: [
      'new_registration',     // การลงทะเบียนใหม่
      'payment_uploaded',     // อัปโหลดหลักฐานการชำระเงิน
      'status_updated',       // อัปเดตสถานะ
      'position_updated',     // อัปเดตตำแหน่ง
      'shipping_updated',     // 🚀 อัปเดตสถานะการจัดส่ง
      'bulk_shipping',        // 🚀 จัดส่งแบบกลุ่ม
      'label_printed',        // 🚀 พิมพ์ label การจัดส่ง
      'tracking_inquiry',     // 🚀 มีการติดตามพัสดุ
      'urgent_shipping',      // 🚀 การจัดส่งค้างนาน
      'weekly_summary',       // 🚀 สรุปการจัดส่งรายสัปดาห์
      'system'               // ระบบ
    ],
    required: [true, 'กรุณาระบุประเภทการแจ้งเตือน']
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni'  // อ้างอิงไปยังศิษย์เก่าที่เกี่ยวข้อง
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // ผู้ใช้ที่จะได้รับการแจ้งเตือน (หากระบุ, ไม่ระบุ = ทุกคน)
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  expiresAt: {
    type: Date  // การแจ้งเตือนที่มีวันหมดอายุ
  }
}, {
  timestamps: true
});

// Index สำหรับการค้นหาที่เร็วขึ้น
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto delete expired notifications

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;