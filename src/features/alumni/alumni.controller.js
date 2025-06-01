// Path: src/features/alumni/alumni.controller.js
// ไฟล์: alumni.controller.js - อัปเดตเพื่อรองรับระบบการจัดส่ง

import {
  createAlumniRegistration,
  uploadPaymentProof,
  checkRegistrationStatus,
  updateAlumniStatus,
  updateAlumniPosition,
  getAllAlumni,
  getAlumniById,
  getRegistrationStatistics,
  getAllDepartments,
  getAllGraduationYears
} from './alumni.service.js';

// 🚀 Import shipping services
import {
  getShippingList,
  updateShippingStatus,
  bulkUpdateShipping,
  getShippingStatistics,
  trackShipment
} from './shipping.service.js';

// ลงทะเบียนศิษย์เก่าใหม่
export const registerAlumni = async (req, res) => {
  try {
    // ใช้ service เพื่อสร้างการลงทะเบียน
    const newAlumni = await createAlumniRegistration(req.body, req.files);

    return res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลของท่าน',
      data: newAlumni
    });
  } catch (error) {
    console.error('Error in registerAlumni:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
    });
  }
};

// ตรวจสอบสถานะการลงทะเบียน
export const checkRegistrationStatusController = async (req, res) => {
  try {
    const { idCard } = req.body;
    
    // ใช้ service เพื่อตรวจสอบสถานะ
    const statusData = await checkRegistrationStatus(idCard);
    
    return res.status(200).json({
      success: true,
      message: 'ตรวจสอบสถานะสำเร็จ',
      data: statusData
    });
  } catch (error) {
    console.error('Error in checkRegistrationStatus:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ'
    });
  }
};

// อัปโหลดหลักฐานการชำระเงิน
export const uploadPaymentProofController = async (req, res) => {
  try {
    const { idCard, paymentDetails } = req.body;
    
    // ใช้ service เพื่ออัปโหลดหลักฐานการชำระเงิน
    const alumni = await uploadPaymentProof(idCard, req.file, paymentDetails);
    
    return res.status(200).json({
      success: true,
      message: 'อัปโหลดหลักฐานการชำระเงินสำเร็จ',
      data: {
        paymentProofUrl: alumni.paymentProofUrl,
        paymentDate: alumni.paymentDate,
        status: alumni.status
      }
    });
  } catch (error) {
    console.error('Error in uploadPaymentProof:', error);
    const statusCode = 
      error.message.includes('ไม่พบข้อมูล') ? 404 : 
      error.message.includes('กรุณาอัปโหลด') ? 400 : 500;
    
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปโหลดหลักฐานการชำระเงิน'
    });
  }
};

// ดึงข้อมูลศิษย์เก่าทั้งหมด (สำหรับ Admin) 🚀 เพิ่มการกรอง shipping
export const getAllAlumniController = async (req, res) => {
  try {
    const { 
      status, position, graduationYear, department, 
      search, name, idCard,
      shippingStatus, deliveryOption, // 🚀 เพิ่มใหม่
      page, limit, sort 
    } = req.query;
    
    console.log('Search params received:', { search, name, idCard, shippingStatus, deliveryOption });
    
    // สร้าง filters และ options
    const filters = {};
    if (status) filters.status = status;
    if (position) filters.position = position;
    if (graduationYear) filters.graduationYear = parseInt(graduationYear);
    if (department) filters.department = department;
    
    // 🚀 เพิ่มการกรอง shipping
    if (shippingStatus) filters.shippingStatus = shippingStatus;
    if (deliveryOption) filters.deliveryOption = deliveryOption;
    
    // แก้ไข: รองรับทั้ง search และ name parameter
    const searchTerm = search || name;
    if (searchTerm && searchTerm.trim()) {
      filters.name = searchTerm.trim();
    }
    
    if (idCard && idCard.trim()) {
      filters.idCard = idCard.trim();
    }
    
    console.log('Filters applied:', filters);
    
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort ? JSON.parse(sort) : { createdAt: -1 }
    };
    
    // ใช้ service เพื่อดึงข้อมูล
    const results = await getAllAlumni(filters, options);
    
    console.log('Search results:', { total: results.total, count: results.data.length });
    
    return res.status(200).json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error in getAllAlumni:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลศิษย์เก่า',
      error: error.message
    });
  }
};

// ดึงข้อมูลศิษย์เก่าตาม ID
export const getAlumniByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ใช้ service เพื่อดึงข้อมูล
    const alumni = await getAlumniById(id);
    
    return res.status(200).json({
      success: true,
      data: alumni
    });
  } catch (error) {
    console.error('Error in getAlumniById:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลศิษย์เก่า'
    });
  }
};

// อัปเดตสถานะการลงทะเบียน (สำหรับ Admin)
export const updateAlumniStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // ใช้ service เพื่ออัปเดตสถานะ
    const alumni = await updateAlumniStatus(id, status, notes, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: alumni
    });
  } catch (error) {
    console.error('Error in updateAlumniStatus:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ'
    });
  }
};

// อัปเดตตำแหน่งสมาชิก (สำหรับ Admin)
export const updateAlumniPositionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, notes } = req.body;
    
    // ใช้ service เพื่ออัปเดตตำแหน่ง
    const alumni = await updateAlumniPosition(id, position, notes, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตตำแหน่งสำเร็จ',
      data: alumni
    });
  } catch (error) {
    console.error('Error in updateAlumniPosition:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตตำแหน่ง'
    });
  }
};

// ดึงข้อมูลสถิติการลงทะเบียน (สำหรับ Admin)
export const getStatisticsController = async (req, res) => {
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

// ดึงรายชื่อแผนกวิชาทั้งหมด
export const getDepartmentsController = async (req, res) => {
  try {
    const departments = await getAllDepartments();
    
    return res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error in getDepartments:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนกวิชา',
      error: error.message
    });
  }
};

// ดึงรายชื่อปีที่สำเร็จการศึกษาทั้งหมด
export const getGraduationYearsController = async (req, res) => {
  try {
    const years = await getAllGraduationYears();
    
    return res.status(200).json({
      success: true,
      data: years
    });
  } catch (error) {
    console.error('Error in getGraduationYears:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลปีที่สำเร็จการศึกษา',
      error: error.message
    });
  }
};

// 🚀 === SHIPPING CONTROLLERS === 🚀

// ดึงรายชื่อศิษย์เก่าที่ต้องจัดส่ง
export const getShippingListController = async (req, res) => {
  try {
    const { 
      shippingStatus = 'รอการจัดส่ง',
      graduationYear, 
      department, 
      search,
      page, 
      limit, 
      sort 
    } = req.query;
    
    const filters = {
      shippingStatus,
      graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      department,
      search
    };
    
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      sort: sort ? JSON.parse(sort) : { createdAt: -1 }
    };
    
    const results = await getShippingList(filters, options);
    
    return res.status(200).json({
      success: true,
      message: 'ดึงรายชื่อการจัดส่งสำเร็จ',
      ...results
    });
  } catch (error) {
    console.error('Error in getShippingList:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายชื่อการจัดส่ง',
      error: error.message
    });
  }
};

// อัปเดตสถานะการจัดส่ง
export const updateShippingStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingStatus, trackingNumber, notes, shippedDate } = req.body;
    
    if (!shippingStatus) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสถานะการจัดส่ง'
      });
    }
    
    const shippingData = {
      shippingStatus,
      trackingNumber,
      notes,
      shippedDate
    };
    
    const alumni = await updateShippingStatus(id, shippingData, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะการจัดส่งสำเร็จ',
      data: {
        id: alumni._id,
        fullName: alumni.fullName,
        shippingStatus: alumni.shippingStatus,
        trackingNumber: alumni.trackingNumber,
        shippedDate: alumni.shippedDate,
        deliveryNotes: alumni.deliveryNotes
      }
    });
  } catch (error) {
    console.error('Error in updateShippingStatus:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะการจัดส่ง'
    });
  }
};

// จัดส่งแบบกลุ่ม
export const bulkUpdateShippingController = async (req, res) => {
  try {
    const { alumniIds, shippingStatus, notes } = req.body;
    
    if (!alumniIds || !Array.isArray(alumniIds) || alumniIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกรายชื่อที่ต้องการจัดส่ง'
      });
    }
    
    if (!shippingStatus) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสถานะการจัดส่ง'
      });
    }
    
    const shippingData = { shippingStatus, notes };
    const results = await bulkUpdateShipping(alumniIds, shippingData, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: `อัปเดตสถานะการจัดส่งสำเร็จ ${results.updated} รายการ`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulkUpdateShipping:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการจัดส่งแบบกลุ่ม'
    });
  }
};

// ดึงสถิติการจัดส่ง
export const getShippingStatisticsController = async (req, res) => {
  try {
    const statistics = await getShippingStatistics();
    
    return res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error in getShippingStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติการจัดส่ง',
      error: error.message
    });
  }
};

// ค้นหาด้วยเลขติดตาม
export const trackShipmentController = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const result = await trackShipment(trackingNumber);
    
    return res.status(200).json({
      success: true,
      message: 'ค้นหาการจัดส่งสำเร็จ',
      data: result
    });
  } catch (error) {
    console.error('Error in trackShipment:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการค้นหาการจัดส่ง'
    });
  }
};