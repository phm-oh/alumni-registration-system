// src/features/auth/auth.controller.js
// ไฟล์: auth.controller.js - Controller Layer (Request/Response Handling)

import {
  checkAdminExistence,
  createFirstAdmin as createFirstAdminService,
  createUser as createUserService,
  authenticateUser,
  generateToken,
  getUserById,
  changeUserPassword,
  getAllUsersService,
  updateUserService,
  deleteUserService,
  searchUsers
} from './auth.service.js';

// =====================================
// 👑 ADMIN SETUP CONTROLLERS
// =====================================

/**
 * ตรวจสอบว่าระบบมี Admin แล้วหรือยัง
 */
export const checkAdminExists = async (req, res) => {
  try {
    const result = await checkAdminExistence();
    
    return res.status(200).json({
      success: true,
      data: result
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

/**
 * สร้าง Admin คนแรก (ไม่ต้องยืนยันตัวตน)
 */
export const createFirstAdmin = async (req, res) => {
  try {
    const user = await createFirstAdminService(req.body);
    
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
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้าง Admin'
    });
  }
};

// =====================================
// 🔐 AUTHENTICATION CONTROLLERS
// =====================================

/**
 * ลงทะเบียนผู้ใช้ (Admin/Staff) - ต้องมี Admin อยู่แล้ว
 */
export const register = async (req, res) => {
  try {
    const user = await createUserService(req.body);
    
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
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
    });
  }
};

/**
 * เข้าสู่ระบบ
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ใช้ service เพื่อตรวจสอบข้อมูลผู้ใช้
    const user = await authenticateUser(email, password);
    
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
    return res.status(401).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    });
  }
};

// =====================================
// 👤 USER PROFILE CONTROLLERS
// =====================================

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 */
export const getMe = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    });
  }
};

/**
 * เปลี่ยนรหัสผ่าน
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // ใช้ service เพื่อเปลี่ยนรหัสผ่าน
    await changeUserPassword(req.user.id, currentPassword, newPassword);
    
    return res.status(200).json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
    });
  }
};

// =====================================
// 👥 USER MANAGEMENT CONTROLLERS (Admin Only)
// =====================================

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมด (เฉพาะ Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    
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

/**
 * อัปเดตข้อมูลผู้ใช้ (เฉพาะ Admin)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await updateUserService(id, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้'
    });
  }
};

/**
 * ลบผู้ใช้ (เฉพาะ Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await deleteUserService(id, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'ลบผู้ใช้สำเร็จ',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้'
    });
  }
};

// =====================================
// 🔍 ADDITIONAL CONTROLLERS (ขยายความสามารถ)
// =====================================

/**
 * ค้นหาผู้ใช้ (เฉพาะ Admin)
 */
export const searchUsersController = async (req, res) => {
  try {
    const { role, search, page, limit, sort } = req.query;
    
    const filters = { role, search };
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort ? JSON.parse(sort) : { createdAt: -1 }
    };
    
    const results = await searchUsers(filters, options);
    
    return res.status(200).json({
      success: true,
      message: 'ค้นหาผู้ใช้สำเร็จ',
      ...results
    });
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการค้นหาผู้ใช้',
      error: error.message
    });
  }
};

/**
 * ดึงสถิติผู้ใช้ (เฉพาะ Admin)
 */
export const getUserStatsController = async (req, res) => {
  try {
    // TODO: Implement getUserStatsService in auth.service.js
    const stats = {
      totalUsers: 0,
      adminCount: 0,
      staffCount: 0,
      recentRegistrations: []
    };
    
    return res.status(200).json({
      success: true,
      message: 'ฟีเจอร์นี้อยู่ระหว่างพัฒนา',
      data: stats
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติผู้ใช้',
      error: error.message
    });
  }
};

// =====================================
// 📤 EXPORTS
// =====================================

export default {
  // Admin Setup
  checkAdminExists,
  createFirstAdmin,
  
  // Authentication
  register,
  login,
  
  // User Profile
  getMe,
  changePassword,
  
  // User Management (Admin Only)
  getAllUsers,
  updateUser,
  deleteUser,
  
  // Additional Features
  searchUsersController,
  getUserStatsController
};