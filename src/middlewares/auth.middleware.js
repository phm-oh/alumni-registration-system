// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../features/auth/auth.model.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // ตรวจสอบว่ามี token ใน headers หรือไม่
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบ Token กรุณาเข้าสู่ระบบ'
      });
    }
    
    // ตรวจสอบความถูกต้องของ token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ตรวจสอบว่าผู้ใช้ยังมีอยู่ในระบบหรือไม่
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบผู้ใช้นี้ในระบบ'
      });
    }
    
    // เก็บข้อมูลผู้ใช้ไว้ใน req
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ',
      error: error.message
    });
  }
};

// Middleware สำหรับตรวจสอบสิทธิ์ Admin
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ดูแลระบบเท่านั้น'
    });
  }
};

export default {
  authMiddleware,
  adminMiddleware
};