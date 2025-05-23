// src/features/notification/notification.routes.js
import express from 'express';
import {
  getNotifications,
  getUnreadCountController,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationController,
  cleanupNotifications
} from './notification.controller.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes สำหรับผู้ใช้ที่ผ่านการยืนยันตัวตน
router.get('/', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadCountController);
router.patch('/:id/read', authMiddleware, markNotificationAsRead);
router.patch('/mark-all-read', authMiddleware, markAllNotificationsAsRead);
router.delete('/:id', authMiddleware, deleteNotificationController);

// Routes สำหรับ Admin
router.delete('/cleanup', authMiddleware, adminMiddleware, cleanupNotifications);

export default router;