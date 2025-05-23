// src/features/auth/auth.routes.js
import express from 'express';
import {
  checkAdminExists,
  createFirstAdmin,
  register,
  login,
  getMe,
  changePassword,
  getAllUsers,
  updateUser,
  deleteUser
} from './auth.controller.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes สำหรับตรวจสอบและสร้าง Admin คนแรก
router.get('/check-admin', checkAdminExists);
router.post('/setup-admin', createFirstAdmin);

// Routes สำหรับผู้ใช้ทั่วไป
router.post('/register', authMiddleware, adminMiddleware, register); // เฉพาะ Admin ถึงจะสร้างผู้ใช้ใหม่ได้
router.post('/login', login);

// Routes ที่ต้องยืนยันตัวตน
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware, changePassword);

// Routes สำหรับ Admin
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;