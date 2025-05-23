// Authentication routes 
// src/features/auth/auth.routes.js
import express from 'express';
import {
  register,
  login,
  getMe,
  changePassword,
  getAllUsers
} from './auth.controller.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes สำหรับผู้ใช้ทั่วไป
router.post('/register', register);
router.post('/login', login);

// Routes ที่ต้องยืนยันตัวตน
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware, changePassword);

// Routes สำหรับ Admin
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

export default router;