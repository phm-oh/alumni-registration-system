// Path: src/features/alumni/shipping.controller.js
// ไฟล์: shipping.controller.js - เพิ่ม endpoints สำหรับ minimal labels

import {
  getShippingList,
  updateShippingStatus,
  bulkUpdateShipping,
  getShippingStatistics,
  trackShipment
} from './shipping.service.js';

import { getAlumniById } from './alumni.service.js';

// 🚀 Import minimal label functions
import {
  generateMinimalShippingLabelHTML,
  generate4UpShippingLabelsHTML
} from '../../utils/minimalShippingLabel.js';

// Import original functions  
import {
  generateShippingLabelHTML,
  generateBulkShippingLabelsHTML,
  generateLabelWithQRData,
  generateShippingSummaryHTML
} from '../../utils/shippingLabel.js';

import {
  createLabelPrintedNotification,
  createBulkShippingNotification
} from '../notification/notification.service.js';

// 🚀 === SHIPPING MANAGEMENT === 🚀

/**
 * ดึงรายชื่อศิษย์เก่าที่ต้องจัดส่ง
 */
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

/**
 * อัปเดตสถานะการจัดส่ง
 */
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

/**
 * จัดส่งแบบกลุ่ม
 */
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
    
    // สร้างการแจ้งเตือน
    try {
      await createBulkShippingNotification(results, {
        batchNumber: `BULK-${Date.now()}`,
        updatedBy: req.user.username || req.user.id
      });
    } catch (notificationError) {
      console.error('Failed to create bulk shipping notification:', notificationError);
    }
    
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

/**
 * ดึงสถิติการจัดส่ง
 */
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

/**
 * ค้นหาด้วยเลขติดตาม
 */
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

// 🚀 === LABEL GENERATION (ORIGINAL) === 🚀

/**
 * สร้าง shipping label รายบุคคล (เวอร์ชันเต็ม)
 */
export const generateSingleLabelController = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      format = 'html',
      includeQR = false,
      logoUrl = '',
      companyName = 'สมาคมศิษย์เก่า วิทยาลัยการอาชีพอุดรธานี'
    } = req.query;
    
    // ดึงข้อมูลศิษย์เก่า
    const alumni = await getAlumniById(id);
    
    if (!alumni.isReadyToShip()) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถสร้าง label ได้ เนื่องจากยังไม่พร้อมจัดส่ง'
      });
    }
    
    const options = {
      logoUrl,
      companyName
    };
    
    // สร้าง HTML label
    const labelHTML = includeQR === 'true' 
      ? generateLabelWithQRData(alumni, options)
      : generateShippingLabelHTML(alumni, options);
    
    // บันทึกการแจ้งเตือน
    try {
      await createLabelPrintedNotification(alumni, 'single');
    } catch (notificationError) {
      console.error('Failed to create label notification:', notificationError);
    }
    
    if (format === 'json') {
      return res.status(200).json({
        success: true,
        message: 'สร้าง shipping label สำเร็จ',
        data: {
          alumni: {
            id: alumni._id,
            fullName: alumni.fullName,
            address: alumni.address,
            phone: alumni.phone,
            trackingNumber: alumni.trackingNumber
          },
          labelHTML
        }
      });
    }
    
    // ส่งกลับเป็น HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="shipping-label-${alumni.idCard}.html"`);
    return res.send(labelHTML);
    
  } catch (error) {
    console.error('Error in generateSingleLabel:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้าง shipping label'
    });
  }
};

// 🚀 === MINIMAL LABEL GENERATION === 🚀

/**
 * สร้าง minimal shipping label รายบุคคล
 */
export const generateMinimalLabelController = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'html' } = req.query;
    
    // ดึงข้อมูลศิษย์เก่า
    const alumni = await getAlumniById(id);
    
    if (!alumni.isReadyToShip()) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถสร้าง label ได้ เนื่องจากยังไม่พร้อมจัดส่ง'
      });
    }
    
    // สร้าง minimal HTML label
    const labelHTML = generateMinimalShippingLabelHTML(alumni);
    
    // บันทึกการแจ้งเตือน
    try {
      await createLabelPrintedNotification(alumni, 'minimal');
    } catch (notificationError) {
      console.error('Failed to create label notification:', notificationError);
    }
    
    if (format === 'json') {
      return res.status(200).json({
        success: true,
        message: 'สร้าง minimal shipping label สำเร็จ',
        data: {
          alumni: {
            id: alumni._id,
            fullName: alumni.fullName,
            address: alumni.address,
            phone: alumni.phone
          },
          labelHTML
        }
      });
    }
    
    // ส่งกลับเป็น HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="minimal-label-${alumni.idCard}.html"`);
    return res.send(labelHTML);
    
  } catch (error) {
    console.error('Error in generateMinimalLabel:', error);
    return res.status(error.message.includes('ไม่พบข้อมูล') ? 404 : 500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้าง minimal shipping label'
    });
  }
};

/**
 * สร้าง 4 minimal labels ใน A4 เดียว
 */
export const generate4UpLabelsController = async (req, res) => {
  try {
    const { alumniIds } = req.body;
    const { format = 'html' } = req.query;
    
    if (!alumniIds || !Array.isArray(alumniIds)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกรายชื่อที่ต้องการสร้าง 4-up labels (สูงสุด 4 คน)'
      });
    }
    
    // เอาแค่ 4 คนแรก
    const limitedIds = alumniIds.slice(0, 4);
    
    // ดึงข้อมูลศิษย์เก่าทั้งหมด
    const alumniPromises = limitedIds.map(id => getAlumniById(id));
    const alumniList = await Promise.all(alumniPromises);
    
    // ตรวจสอบว่าทุกคนพร้อมจัดส่งหรือไม่
    const notReadyList = alumniList.filter(alumni => !alumni.isReadyToShip());
    if (notReadyList.length > 0) {
      return res.status(400).json({
        success: false,
        message: `มี ${notReadyList.length} รายการที่ยังไม่พร้อมจัดส่ง`,
        data: {
          notReady: notReadyList.map(alumni => ({
            id: alumni._id,
            fullName: alumni.fullName,
            status: alumni.status,
            shippingStatus: alumni.shippingStatus
          }))
        }
      });
    }
    
    // สร้าง 4-up labels HTML
    const labelsHTML = generate4UpShippingLabelsHTML(alumniList);
    
    // บันทึกการแจ้งเตือน
    try {
      for (const alumni of alumniList) {
        await createLabelPrintedNotification(alumni, '4-up');
      }
    } catch (notificationError) {
      console.error('Failed to create 4-up label notifications:', notificationError);
    }
    
    if (format === 'json') {
      return res.status(200).json({
        success: true,
        message: `สร้าง 4-up shipping labels สำเร็จ ${alumniList.length} รายการ`,
        data: {
          count: alumniList.length,
          alumni: alumniList.map(alumni => ({
            id: alumni._id,
            fullName: alumni.fullName
          })),
          labelsHTML
        }
      });
    }
    
    // ส่งกลับเป็น HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="4up-labels-${Date.now()}.html"`);
    return res.send(labelsHTML);
    
  } catch (error) {
    console.error('Error in generate4UpLabels:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้าง 4-up shipping labels'
    });
  }
};

/**
 * สร้าง bulk shipping labels (เวอร์ชันเต็ม)
 */
export const generateBulkLabelsController = async (req, res) => {
  try {
    const { 
      alumniIds,
      format = 'html',
      batchNumber,
      logoUrl = '',
      companyName = 'สมาคมศิษย์เก่า วิทยาลัยการอาชีพอุดรธานี'
    } = req.body;
    
    if (!alumniIds || !Array.isArray(alumniIds) || alumniIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกรายชื่อที่ต้องการสร้าง label'
      });
    }
    
    // ดึงข้อมูลศิษย์เก่าทั้งหมด
    const alumniPromises = alumniIds.map(id => getAlumniById(id));
    const alumniList = await Promise.all(alumniPromises);
    
    // ตรวจสอบว่าทุกคนพร้อมจัดส่งหรือไม่
    const notReadyList = alumniList.filter(alumni => !alumni.isReadyToShip());
    if (notReadyList.length > 0) {
      return res.status(400).json({
        success: false,
        message: `มี ${notReadyList.length} รายการที่ยังไม่พร้อมจัดส่ง`,
        data: {
          notReady: notReadyList.map(alumni => ({
            id: alumni._id,
            fullName: alumni.fullName,
            status: alumni.status,
            shippingStatus: alumni.shippingStatus
          }))
        }
      });
    }
    
    const options = {
      logoUrl,
      companyName,
      batchNumber: batchNumber || `BATCH-${Date.now()}`
    };
    
    // สร้าง bulk labels HTML
    const bulkLabelsHTML = generateBulkShippingLabelsHTML(alumniList, options);
    
    // บันทึกการแจ้งเตือน
    try {
      for (const alumni of alumniList) {
        await createLabelPrintedNotification(alumni, 'bulk');
      }
    } catch (notificationError) {
      console.error('Failed to create bulk label notifications:', notificationError);
    }
    
    if (format === 'json') {
      return res.status(200).json({
        success: true,
        message: `สร้าง bulk shipping labels สำเร็จ ${alumniList.length} รายการ`,
        data: {
          batchNumber: options.batchNumber,
          count: alumniList.length,
          alumni: alumniList.map(alumni => ({
            id: alumni._id,
            fullName: alumni.fullName,
            trackingNumber: alumni.trackingNumber
          })),
          labelsHTML: bulkLabelsHTML
        }
      });
    }
    
    // ส่งกลับเป็น HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="bulk-shipping-labels-${options.batchNumber}.html"`);
    return res.send(bulkLabelsHTML);
    
  } catch (error) {
    console.error('Error in generateBulkLabels:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้าง bulk shipping labels'
    });
  }
};

/**
 * สร้าง shipping summary report
 */
export const generateShippingSummaryController = async (req, res) => {
  try {
    const { 
      alumniIds,
      batchNumber,
      preparedBy,
      notes,
      format = 'html'
    } = req.body;
    
    if (!alumniIds || !Array.isArray(alumniIds) || alumniIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกรายชื่อที่ต้องการสร้างรายงาน'
      });
    }
    
    // ดึงข้อมูลศิษย์เก่าทั้งหมด
    const alumniPromises = alumniIds.map(id => getAlumniById(id));
    const alumniList = await Promise.all(alumniPromises);
    
    const batchInfo = {
      batchNumber: batchNumber || `SUMMARY-${Date.now()}`,
      preparedBy: preparedBy || req.user.username || 'Admin',
      notes: notes || ''
    };
    
    // สร้าง summary HTML
    const summaryHTML = generateShippingSummaryHTML(alumniList, batchInfo);
    
    if (format === 'json') {
      // คำนวณสถิติ
      const totalValue = alumniList.reduce((sum, alumni) => sum + alumni.totalAmount, 0);
      const byDepartment = alumniList.reduce((acc, alumni) => {
        acc[alumni.department] = (acc[alumni.department] || 0) + 1;
        return acc;
      }, {});
      
      return res.status(200).json({
        success: true,
        message: `สร้าง shipping summary สำเร็จ ${alumniList.length} รายการ`,
        data: {
          batchInfo,
          summary: {
            totalItems: alumniList.length,
            totalValue,
            byDepartment
          },
          alumni: alumniList.map(alumni => ({
            id: alumni._id,
            fullName: alumni.fullName,
            department: alumni.department,
            graduationYear: alumni.graduationYear,
            totalAmount: alumni.totalAmount
          })),
          summaryHTML
        }
      });
    }
    
    // ส่งกลับเป็น HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="shipping-summary-${batchInfo.batchNumber}.html"`);
    return res.send(summaryHTML);
    
  } catch (error) {
    console.error('Error in generateShippingSummary:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสร้าง shipping summary'
    });
  }
};

// 🚀 === SHIPPING UTILITIES === 🚀

/**
 * เช็คและแจ้งเตือนการจัดส่งที่ค้างนาน
 */
export const checkOverdueShipmentsController = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    // หารายการที่ค้างการจัดส่งนานเกินกำหนด
    const overdueShipments = await getShippingList({
      shippingStatus: 'รอการจัดส่ง'
    });
    
    const overdueList = overdueShipments.data.filter(alumni => 
      new Date(alumni.createdAt) < cutoffDate
    );
    
    return res.status(200).json({
      success: true,
      message: `พบการจัดส่งค้างนาน ${overdueList.length} รายการ`,
      data: {
        cutoffDate,
        days: parseInt(days),
        overdueCount: overdueList.length,
        overdueShipments: overdueList.map(alumni => ({
          id: alumni._id,
          fullName: alumni.fullName,
          createdAt: alumni.createdAt,
          daysPending: Math.floor((new Date() - new Date(alumni.createdAt)) / (1000 * 60 * 60 * 24))
        }))
      }
    });
  } catch (error) {
    console.error('Error in checkOverdueShipments:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบการจัดส่งค้างนาน',
      error: error.message
    });
  }
};

/**
 * ดึงสรุปการจัดส่งรายวัน/รายสัปดาห์/รายเดือน
 */
export const getShippingReportsController = async (req, res) => {
  try {
    const { period = 'weekly', startDate, endDate } = req.query;
    
    let start, end;
    const now = new Date();
    
    switch (period) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return res.status(400).json({
            success: false,
            message: 'กรุณาระบุ startDate และ endDate สำหรับ custom period'
          });
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'period ต้องเป็น daily, weekly, monthly, หรือ custom'
        });
    }
    
    // ดึงสถิติการจัดส่งในช่วงเวลาที่กำหนด
    const statistics = await getShippingStatistics();
    
    return res.status(200).json({
      success: true,
      message: `ดึงรายงานการจัดส่ง${period}สำเร็จ`,
      data: {
        period,
        startDate: start,
        endDate: end,
        statistics
      }
    });
  } catch (error) {
    console.error('Error in getShippingReports:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายงานการจัดส่ง',
      error: error.message
    });
  }
};

export default {
  // Shipping Management
  getShippingListController,
  updateShippingStatusController,
  bulkUpdateShippingController,
  getShippingStatisticsController,
  trackShipmentController,
  
  // Label Generation (Original)
  generateSingleLabelController,
  generateBulkLabelsController,
  generateShippingSummaryController,
  
  // 🚀 Minimal Label Generation (New)
  generateMinimalLabelController,
  generate4UpLabelsController,
  
  // Utilities
  checkOverdueShipmentsController,
  getShippingReportsController
};