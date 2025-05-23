// Alumni controller 
// src/features/alumni/alumni.controller.js
import Alumni from './alumni.model.js';
import { 
  sendRegistrationEmail, 
  sendAdminNotificationEmail, 
  sendStatusUpdateEmail 
} from '../../utils/email.js';
import { uploadToCloudinary } from '../../utils/upload.js';

// ลงทะเบียนศิษย์เก่าใหม่
export const registerAlumni = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      idCard,
      address,
      graduationYear,
      department,
      phone,
      email,
      currentJob,
      workplace,
      facebookId,
      lineId,
      paymentMethod,
      deliveryOption,
      pdpaConsent
    } = req.body;

    // ตรวจสอบว่ามีศิษย์เก่าลงทะเบียนด้วย idCard นี้แล้วหรือไม่
    const existingAlumni = await Alumni.findOne({ idCard });
    if (existingAlumni) {
      return res.status(400).json({
        success: false,
        message: 'เลขบัตรประชาชนนี้ได้ลงทะเบียนแล้ว'
      });
    }
    
    // สร้างข้อมูลศิษย์เก่าใหม่
    const newAlumni = new Alumni({
      firstName,
      lastName,
      idCard,
      address,
      graduationYear,
      department,
      phone,
      email,
      currentJob,
      workplace,
      facebookId,
      lineId,
      paymentMethod,
      deliveryOption,
      pdpaConsent,
      status: paymentMethod === 'ชำระด้วยตนเอง' ? 'รอการชำระเงิน' : 'รอตรวจสอบ'
    });
    
    // กำหนดค่าจัดส่งและยอดรวม
    if (deliveryOption === 'จัดส่งทางไปรษณีย์') {
      newAlumni.shippingFee = 30;
      newAlumni.totalAmount = 230;
    }

    // ถ้ามีการอัปโหลดไฟล์หลักฐานการชำระเงิน
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      newAlumni.paymentProofUrl = result.secure_url;
      newAlumni.paymentDate = new Date();
    }

    // บันทึกข้อมูล
    await newAlumni.save();
    
    // ส่งอีเมลแจ้งเตือน
    await sendRegistrationEmail(newAlumni);
    await sendAdminNotificationEmail(newAlumni);

    return res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลของท่าน',
      data: newAlumni
    });
  } catch (error) {
    console.error('Error in registerAlumni:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
      error: error.message
    });
  }
};

// ตรวจสอบสถานะการลงทะเบียน
export const checkRegistrationStatus = async (req, res) => {
  try {
    const { idCard } = req.body;
    
    const alumni = await Alumni.findOne({ idCard });
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการลงทะเบียน กรุณาตรวจสอบเลขบัตรประชาชนอีกครั้ง'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'ตรวจสอบสถานะสำเร็จ',
      data: {
        fullName: `${alumni.firstName} ${alumni.lastName}`,
        status: alumni.status,
        registrationDate: alumni.registrationDate,
        paymentMethod: alumni.paymentMethod,
        deliveryOption: alumni.deliveryOption,
        totalAmount: alumni.totalAmount
      }
    });
  } catch (error) {
    console.error('Error in checkRegistrationStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ',
      error: error.message
    });
  }
};

// อัปโหลดหลักฐานการชำระเงิน
export const uploadPaymentProof = async (req, res) => {
  try {
    const { idCard } = req.body;
    
    // ตรวจสอบว่ามีข้อมูลศิษย์เก่าหรือไม่
    const alumni = await Alumni.findOne({ idCard });
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการลงทะเบียน'
      });
    }
    
    // ตรวจสอบว่ามีไฟล์หรือไม่
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัปโหลดหลักฐานการชำระเงิน'
      });
    }
    
    // อัปโหลดไฟล์ไปยัง Cloudinary
    const result = await uploadToCloudinary(req.file);
    
    // อัปเดตข้อมูลศิษย์เก่า
    alumni.paymentProofUrl = result.secure_url;
    alumni.paymentDate = new Date();
    alumni.paymentDetails = req.body.paymentDetails || '';
    alumni.status = 'รอตรวจสอบ';
    
    await alumni.save();
    
    // ส่งอีเมลแจ้งเตือน Admin
    await sendAdminNotificationEmail(alumni);
    
    return res.status(200).json({
      success: true,
      message: 'อัปโหลดหลักฐานการชำระเงินสำเร็จ',
      data: {
        paymentProofUrl: result.secure_url,
        paymentDate: alumni.paymentDate,
        status: alumni.status
      }
    });
  } catch (error) {
    console.error('Error in uploadPaymentProof:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปโหลดหลักฐานการชำระเงิน',
      error: error.message
    });
  }
};

// ดึงข้อมูลศิษย์เก่าทั้งหมด (สำหรับ Admin)
export const getAllAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: alumni.length,
      data: alumni
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
export const getAlumniById = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลศิษย์เก่า'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: alumni
    });
  } catch (error) {
    console.error('Error in getAlumniById:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลศิษย์เก่า',
      error: error.message
    });
  }
};

// อัปเดตสถานะการลงทะเบียน (สำหรับ Admin)
export const updateAlumniStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const alumni = await Alumni.findById(id);
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลศิษย์เก่า'
      });
    }
    
    alumni.status = status;
    await alumni.save();
    
    // ส่งอีเมลแจ้งเตือนการอัปเดตสถานะ
    await sendStatusUpdateEmail(alumni);
    
    return res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: alumni
    });
  } catch (error) {
    console.error('Error in updateAlumniStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
      error: error.message
    });
  }
};