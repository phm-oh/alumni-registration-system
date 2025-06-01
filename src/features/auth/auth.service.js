// src/features/auth/auth.service.js
// ไฟล์: auth.service.js - Business Logic Layer สำหรับ Authentication

import User from './auth.model.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/env.js';

// =====================================
// 🔐 TOKEN MANAGEMENT
// =====================================

/**
 * สร้าง JWT Token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '1d'
  });
};

/**
 * ตรวจสอบ JWT Token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// =====================================
// 👑 ADMIN MANAGEMENT
// =====================================

/**
 * ตรวจสอบว่าระบบมี Admin แล้วหรือยัง
 */
export const checkAdminExistence = async () => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  
  return {
    hasAdmin: adminCount > 0,
    adminCount
  };
};

/**
 * สร้าง Admin คนแรก (ไม่ต้องยืนยันตัวตน)
 */
export const createFirstAdmin = async (adminData) => {
  const { username, email, password } = adminData;
  
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!username || !email || !password) {
    throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
  }

  // ตรวจสอบว่ามี Admin อยู่แล้วหรือไม่
  const adminExists = await checkAdminExistence();
  if (adminExists.hasAdmin) {
    throw new Error('ระบบมี Admin อยู่แล้ว กรุณาใช้การลงทะเบียนปกติ');
  }

  // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
  }
  
  // สร้าง Admin คนแรก
  const user = await User.create({
    username,
    email,
    password,
    role: 'admin'
  });
  
  return user;
};

// =====================================
// 👤 USER AUTHENTICATION
// =====================================

/**
 * ตรวจสอบข้อมูลผู้ใช้และรหัสผ่าน
 */
export const authenticateUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
  }

  // ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }
  
  // ตรวจสอบรหัสผ่าน
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }
  
  return user;
};

/**
 * ลงทะเบียนผู้ใช้ใหม่ (Admin/Staff) - ต้องมี Admin อยู่แล้ว
 */
export const createUser = async (userData) => {
  const { username, email, password, role } = userData;
  
  // ตรวจสอบข้อมูลที่จำเป็น
  if (!username || !email || !password) {
    throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
  }
  
  // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
  }
  
  // สร้างผู้ใช้ใหม่
  const user = await User.create({
    username,
    email,
    password,
    role: role || 'staff'
  });
  
  return user;
};

// =====================================
// 🔑 PASSWORD MANAGEMENT
// =====================================

/**
 * เปลี่ยนรหัสผ่าน
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่');
  }

  // ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('ไม่พบผู้ใช้นี้ในระบบ');
  }
  
  // ตรวจสอบรหัสผ่านปัจจุบัน
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
  }
  
  // ตั้งค่ารหัสผ่านใหม่
  user.password = newPassword;
  await user.save();
  
  return user;
};

// =====================================
// 📊 USER QUERIES & MANAGEMENT
// =====================================

/**
 * ดึงข้อมูลผู้ใช้ตาม ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('ไม่พบผู้ใช้นี้ในระบบ');
  }
  return user;
};

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมด (เฉพาะ Admin)
 */
export const getAllUsersService = async () => {
  return await User.find().select('-password');
};

/**
 * อัปเดตข้อมูลผู้ใช้ (เฉพาะ Admin)
 */
export const updateUserService = async (userId, updateData) => {
  const { username, email, role } = updateData;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('ไม่พบผู้ใช้นี้ในระบบ');
  }
  
  // ตรวจสอบว่าอีเมลหรือชื่อผู้ใช้ซ้ำหรือไม่ (ถ้ามีการเปลี่ยน)
  if (username !== user.username || email !== user.email) {
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }],
      _id: { $ne: userId } // ยกเว้นผู้ใช้คนนี้
    });
    
    if (existingUser) {
      throw new Error('อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
    }
  }
  
  // อัปเดตข้อมูล
  if (username) user.username = username;
  if (email) user.email = email;
  if (role) user.role = role;
  
  await user.save();
  return user;
};

/**
 * ลบผู้ใช้ (เฉพาะ Admin)
 */
export const deleteUserService = async (userId, requestingUserId) => {
  // ไม่สามารถลบตัวเองได้
  if (userId === requestingUserId) {
    throw new Error('ไม่สามารถลบบัญชีของตัวเองได้');
  }
  
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error('ไม่พบผู้ใช้นี้ในระบบ');
  }
  
  return user;
};

// =====================================
// 🔍 UTILITY FUNCTIONS
// =====================================

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์ Admin หรือไม่
 */
export const checkUserPermissions = async (userId) => {
  const user = await User.findById(userId);
  return {
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    user: user
  };
};

/**
 * ค้นหาผู้ใช้ตามเงื่อนไข
 */
export const searchUsers = async (filters = {}, options = {}) => {
  const { role, search } = filters;
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  
  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search && search.trim()) {
    query.$or = [
      { username: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const users = await User.find(query)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  const total = await User.countDocuments(query);
  
  return {
    data: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export default {
  // Token Management
  generateToken,
  verifyToken,
  
  // Admin Management
  checkAdminExistence,
  createFirstAdmin,
  
  // User Authentication
  authenticateUser,
  createUser,
  
  // Password Management
  changeUserPassword,
  
  // User Queries & Management
  getUserById,
  getAllUsersService,
  updateUserService,
  deleteUserService,
  
  // Utility Functions
  checkUserPermissions,
  searchUsers
};