// src/features/auth/auth.controller.js
import User from './auth.model.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/env.js';

// สร้าง Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '1d'
  });
};

// ตรวจสอบว่าระบบมี Admin แล้วหรือยัง
export const checkAdminExists = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    return res.status(200).json({
      success: true,
      data: {
        hasAdmin: adminCount > 0,
        adminCount
      }
    });
  } catch (error) {
    console.error('Error in checkAdminExists:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบ Admin',
      error: error.message
    });
  }
};

// สร้าง Admin คนแรก (ไม่ต้องยืนยันตัวตน)
export const createFirstAdmin = async (req, res) => {
  try {
    // ตรวจสอบว่ามี Admin อยู่แล้วหรือไม่
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'ระบบมี Admin อยู่แล้ว กรุณาใช้การลงทะเบียนปกติ'
      });
    }

    const { username, email, password } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว'
      });
    }
    
    // สร้าง Admin คนแรก
    const user = await User.create({
      username,
      email,
      password,
      role: 'admin'
    });
    
    // สร้าง Token
    const token = generateToken(user._id);
    
    return res.status(201).json({
      success: true,
      message: 'สร้าง Admin คนแรกสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in createFirstAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้าง Admin',
      error: error.message
    });
  }
};

// ลงทะเบียนผู้ใช้ (Admin/Staff) - ต้องมี Admin อยู่แล้ว
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว'
      });
    }
    
    // สร้างผู้ใช้ใหม่
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'staff'
    });
    
    // สร้าง Token
    const token = generateToken(user._id);
    
    return res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
      error: error.message
    });
  }
};

// เข้าสู่ระบบ
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }
    
    // ตรวจสอบรหัสผ่าน
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }
    
    // สร้าง Token
    const token = generateToken(user._id);
    
    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      error: error.message
    });
  }
};

// ดึงข้อมูลผู้ใช้ปัจจุบัน
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error.message
    });
  }
};

// เปลี่ยนรหัสผ่าน
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
    const user = await User.findById(req.user.id).select('+password');
    
    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
      });
    }
    
    // ตั้งค่ารหัสผ่านใหม่
    user.password = newPassword;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
      error: error.message
    });
  }
};

// ดึงข้อมูลผู้ใช้ทั้งหมด (เฉพาะ Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error.message
    });
  }
};

// อัปเดตข้อมูลผู้ใช้ (เฉพาะ Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้นี้ในระบบ'
      });
    }
    
    // อัปเดตข้อมูล
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้',
      error: error.message
    });
  }
};

// ลบผู้ใช้ (เฉพาะ Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ไม่สามารถลบตัวเองได้
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบบัญชีของตัวเองได้'
      });
    }
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้นี้ในระบบ'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'ลบผู้ใช้สำเร็จ',
      data: user
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
      error: error.message
    });
  }
};