// src/features/status/status.controller.js
import {
  checkStatusByIdCard,
  updateAlumniStatus,
  getRegistrationStatistics,
  searchAlumni
} from './status.service.js';

// ตรวจสอบสถานะการลงทะเบียนและการชำระเงิน
export const checkStatus = async (req, res) => {
  try {
    const { idCard } = req.body;
    
    // ใช้ service เพื่อตรวจสอบสถานะ
    const statusData = await checkStatusByIdCard(idCard);
    
    return res.status(200).json({
      success: true,
      message: 'ตรวจสอบสถานะสำเร็จ',
      data: statusData
    });
  } catch (error) {
    console.error('Error in checkStatus:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ'
    });
  }
};

// อัปเดตสถานะการลงทะเบียน (สำหรับ Admin)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    // ใช้ service เพื่ออัปเดตสถานะ
    const alumni = await updateAlumniStatus(id, status, note, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: alumni
    });
  } catch (error) {
    console.error('Error in updateStatus:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ'
    });
  }
};

// ดึงข้อมูลสถิติการลงทะเบียน (สำหรับ Admin)
export const getStatistics = async (req, res) => {
  try {
    // ใช้ service เพื่อดึงข้อมูลสถิติ
    const statistics = await getRegistrationStatistics();
    
    return res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error in getStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ',
      error: error.message
    });
  }
};

// ค้นหาข้อมูลศิษย์เก่า (สำหรับ Admin)
export const searchAlumniRecords = async (req, res) => {
  try {
    const { idCard, name, status, graduationYear, department, page, limit, sort } = req.query;
    
    // สร้าง filters และ options สำหรับการค้นหา
    const filters = {};
    if (idCard) filters.idCard = idCard;
    if (name) filters.name = name;
    if (status) filters.status = status;
    if (graduationYear) filters.graduationYear = parseInt(graduationYear);
    if (department) filters.department = department;
    
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort ? JSON.parse(sort) : { createdAt: -1 }
    };
    
    // ใช้ service เพื่อค้นหาข้อมูล
    const results = await searchAlumni(filters, options);
    
    return res.status(200).json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error in searchAlumniRecords:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูลศิษย์เก่า',
      error: error.message
    });
  }
};