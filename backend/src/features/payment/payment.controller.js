// src/features/payment/payment.controller.js
import {
  createNewPayment,
  uploadProofOfPayment,
  verifyPaymentStatus,
  searchPayments
} from './payment.service.js';

// สร้างการชำระเงินใหม่
export const createPayment = async (req, res) => {
  try {
    // ใช้ service เพื่อสร้างข้อมูลการชำระเงิน
    const payment = await createNewPayment(req.body, req.file);
    
    return res.status(201).json({
      success: true,
      message: 'บันทึกข้อมูลการชำระเงินสำเร็จ',
      data: payment
    });
  } catch (error) {
    console.error('Error in createPayment:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการชำระเงิน'
    });
  }
};

// อัปโหลดหลักฐานการชำระเงิน
export const uploadPaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentDetails } = req.body;
    
    // ใช้ service เพื่ออัปโหลดหลักฐานการชำระเงิน
    const payment = await uploadProofOfPayment(paymentId, req.file, paymentDetails);
    
    return res.status(200).json({
      success: true,
      message: 'อัปโหลดหลักฐานการชำระเงินสำเร็จ',
      data: payment
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

// ยืนยันการชำระเงิน (สำหรับ Admin)
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, notes } = req.body;
    
    // ใช้ service เพื่อยืนยันการชำระเงิน
    const payment = await verifyPaymentStatus(paymentId, status, notes, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'ยืนยันการชำระเงินสำเร็จ',
      data: payment
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการยืนยันการชำระเงิน'
    });
  }
};

// ดึงข้อมูลการชำระเงินทั้งหมด (สำหรับ Admin)
export const getAllPayments = async (req, res) => {
  try {
    // สร้าง filters และ options จาก query parameters
    const { 
      alumniId, status, paymentMethod, dateFrom, dateTo, 
      referenceCode, page, limit, sort 
    } = req.query;
    
    const filters = {};
    if (alumniId) filters.alumniId = alumniId;
    if (status) filters.status = status;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (referenceCode) filters.referenceCode = referenceCode;
    
    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort ? JSON.parse(sort) : { createdAt: -1 }
    };
    
    // ใช้ service เพื่อค้นหาข้อมูลการชำระเงิน
    const results = await searchPayments(filters, options);
    
    return res.status(200).json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error in getAllPayments:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน',
      error: error.message
    });
  }
};

// ดึงข้อมูลการชำระเงินตาม ID
export const getPaymentById = async (req, res) => {
  try {
    // ใช้ service เพื่อค้นหาข้อมูลการชำระเงินตาม ID
    const { id } = req.params;
    const results = await searchPayments({ _id: id });
    
    if (results.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการชำระเงิน'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: results.data[0]
    });
  } catch (error) {
    console.error('Error in getPaymentById:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน',
      error: error.message
    });
  }
};

// ดึงข้อมูลการชำระเงินตาม Alumni ID
export const getPaymentsByAlumniId = async (req, res) => {
  try {
    const { alumniId } = req.params;
    
    // ใช้ service เพื่อค้นหาข้อมูลการชำระเงินตาม Alumni ID
    const results = await searchPayments({ alumniId });
    
    return res.status(200).json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error in getPaymentsByAlumniId:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน',
      error: error.message
    });
  }
};