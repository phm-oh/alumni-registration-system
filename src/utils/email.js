// Path: src/utils/email.js
// ไฟล์: email.js - แก้ไข Nodemailer API

import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS, ADMIN_EMAIL } from '../config/env.js';

// Frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fontend-alumni.onrender.com';

// สร้าง transporter สำหรับส่งอีเมล - แก้ไข: createTransport แทน createTransporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// ส่งอีเมลแจ้งผู้สมัคร
export const sendRegistrationEmail = async (alumni) => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: alumni.email,
      subject: '[สมาคมศิษย์เก่า] ยืนยันการลงทะเบียนศิษย์เก่า',
      html: `
        <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://www.example.com/logo.png" alt="Logo" style="max-width: 150px;">
          </div>
          <h2 style="text-align: center; color: #3b5998;">ยืนยันการลงทะเบียนศิษย์เก่า</h2>
          <p>เรียน คุณ ${alumni.firstName} ${alumni.lastName},</p>
          <p>ขอบคุณสำหรับการลงทะเบียนเป็นสมาชิกศิษย์เก่า ระบบได้รับข้อมูลของท่านเรียบร้อยแล้ว</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">รายละเอียดการลงทะเบียน:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>ชื่อ-นามสกุล:</strong> ${alumni.firstName} ${alumni.lastName}</li>
              <li><strong>เลขบัตรประชาชน:</strong> ${alumni.idCard}</li>
              <li><strong>ปีที่สำเร็จการศึกษา:</strong> ${alumni.graduationYear}</li>
              <li><strong>แผนกวิชา:</strong> ${alumni.department}</li>
              <li><strong>วิธีการชำระเงิน:</strong> ${alumni.paymentMethod}</li>
              <li><strong>วิธีการรับบัตรสมาชิก:</strong> ${alumni.deliveryOption}</li>
              <li><strong>วันที่ชำระเงิน:</strong> ${alumni.paymentDate ? new Date(alumni.paymentDate).toLocaleDateString('th-TH') : 'รอการชำระเงิน'}</li>
            </ul>
          </div>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>สถานะการลงทะเบียน:</strong> ${alumni.status}</p>
          </div>
          <p>เจ้าหน้าที่จะตรวจสอบข้อมูลและหลักฐานการชำระเงินของท่าน และจะส่งอีเมลยืนยันการเป็นสมาชิกให้ท่านในภายหลัง</p>
          <p><strong>*** บัตรสมาชิกสำหรับสมาชิก${alumni.deliveryOption === 'จัดส่งทางไปรษณีย์' ? 'จะจัดส่งไปตามที่อยู่ที่ท่านแจ้งไว้ภายใน 7 วันทำการหลังจากได้รับการอนุมัติ' : 'สามารถมารับได้ที่สำนักงานสมาคมศิษย์เก่า'} ***</strong></p>
          <p>หากมีข้อสงสัยประการใด กรุณาติดต่อ <a href="mailto:alumni@gsuite.udvc.ac.th">alumni@gsuite.udvc.ac.th</a></p>
          <p>ขอแสดงความนับถือ,<br>สมาคมศิษย์เก่า</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${alumni.email}`);
    return true;
  } catch (error) {
    console.error('Error sending registration email:', error);
    return false;
  }
};

// ส่งอีเมลแจ้ง Admin
export const sendAdminNotificationEmail = async (alumni) => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: '[แจ้งเตือนระบบ] มีการลงทะเบียนศิษย์เก่าใหม่',
      html: `
        <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #3b5998;">แจ้งเตือน: มีการลงทะเบียนศิษย์เก่าใหม่</h2>
          <p>มีผู้สมัครสมาชิกศิษย์เก่าใหม่ในระบบ กรุณาตรวจสอบข้อมูลและดำเนินการต่อไป</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">รายละเอียดผู้สมัคร:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>ชื่อ-นามสกุล:</strong> ${alumni.firstName} ${alumni.lastName}</li>
              <li><strong>เลขบัตรประชาชน:</strong> ${alumni.idCard}</li>
              <li><strong>อีเมล:</strong> ${alumni.email}</li>
              <li><strong>เบอร์โทรศัพท์:</strong> ${alumni.phone}</li>
              <li><strong>วิธีการชำระเงิน:</strong> ${alumni.paymentMethod}</li>
              <li><strong>วิธีการจัดส่ง:</strong> ${alumni.deliveryOption}</li>
              <li><strong>จำนวนเงินทั้งหมด:</strong> ${alumni.totalAmount} บาท</li>
            </ul>
          </div>
          <p><a href="${FRONTEND_URL || 'https://fontend-alumni.onrender.com'}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">🔧 เข้าระบบ Admin</a></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin notification email sent to ${ADMIN_EMAIL}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
};

// ส่งอีเมลแจ้งเตือนการอัปเดตสถานะ
export const sendStatusUpdateEmail = async (alumni) => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: alumni.email,
      subject: '[สมาคมศิษย์เก่า] อัปเดตสถานะการลงทะเบียน',
      html: `
        <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://www.example.com/logo.png" alt="Logo" style="max-width: 150px;">
          </div>
          <h2 style="text-align: center; color: #3b5998;">อัปเดตสถานะการลงทะเบียนศิษย์เก่า</h2>
          <p>เรียน คุณ ${alumni.firstName} ${alumni.lastName},</p>
          <p>ระบบได้ทำการอัปเดตสถานะการลงทะเบียนของท่านแล้ว</p>
          <div style="background-color: ${alumni.status === 'อนุมัติ' ? '#d4edda' : '#fff3cd'}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${alumni.status === 'อนุมัติ' ? '#28a745' : '#ffc107'};">
            <p style="margin: 0; font-size: 18px;"><strong>สถานะปัจจุบัน:</strong> ${alumni.status}</p>
          </div>
          ${alumni.status === 'อนุมัติ' ? `
          <p>🎉 ขอแสดงความยินดี! ท่านได้เป็นสมาชิกศิษย์เก่าอย่างเป็นทางการแล้ว</p>
          <p><strong>การจัดส่งบัตรสมาชิก:</strong> ${alumni.deliveryOption === 'จัดส่งทางไปรษณีย์' ? 'บัตรสมาชิกจะถูกจัดส่งไปยังที่อยู่ที่ท่านให้ไว้ภายใน 7 วันทำการ' : 'ท่านสามารถมารับบัตรสมาชิกได้ที่สำนักงานสมาคมศิษย์เก่า ในวันและเวลาทำการ'}</p>
          ` : ''}
          ${alumni.status === 'รอการชำระเงิน' ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">💰 ข้อมูลการชำระเงิน:</h3>
            <p><strong>จำนวนเงิน:</strong> ${alumni.totalAmount} บาท</p>
            <p><strong>ธนาคาร:</strong> ธนาคารกรุงไทย</p>
            <p><strong>เลขที่บัญชี:</strong> 443-3-30313-5</p>
            <p><strong>ชื่อบัญชี:</strong> น.ส.=ชุติภัทร ชวาลไชย และ นางระพีพรรณ จันทรสา</p>
            <p><strong>สาขา:</strong> เซนทรัลพลาซา อุดรธานี</p>
            <p> alumni2@gsuite.udvc.ac.th</p>
          </div>
          ` : ''}
          <div style="text-align: center; margin: 20px 0;">
            <a href="${FRONTEND_URL || 'https://alumni-registration-system-1.onrender.com'}/?idCard=${alumni.idCard}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">🔍 ตรวจสอบสถานะการลงทะเบียน</a>
          </div>
          <p>หากมีข้อสงสัยประการใด กรุณาติดต่อ <a href="mailto:alumni2@it.udvc.ac.th">alumni@it.udvc.ac.th</a></p>
          <p>ขอแสดงความนับถือ,<br>สมาคมศิษย์เก่า</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to ${alumni.email}`);
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
};

// 🚀 ส่งอีเมลแจ้งการอัปเดตสถานะการจัดส่ง
export const sendShippingNotificationEmail = async (alumni, oldStatus, newStatus) => {
  try {
    const statusMessages = {
      'รอการจัดส่ง': 'รอการจัดส่ง - เจ้าหน้าที่กำลังเตรียมบัตรสมาชิกเพื่อจัดส่ง',
      'กำลังจัดส่ง': 'กำลังจัดส่ง - บัตรสมาชิกของท่านถูกส่งออกแล้ว',
      'จัดส่งแล้ว': 'จัดส่งแล้ว - ท่านได้รับบัตรสมาชิกเรียบร้อยแล้ว'
    };

    const statusColors = {
      'รอการจัดส่ง': '#ffc107',
      'กำลังจัดส่ง': '#17a2b8', 
      'จัดส่งแล้ว': '#28a745'
    };

    const mailOptions = {
      from: EMAIL_USER,
      to: alumni.email,
      subject: '[สมาคมศิษย์เก่า] อัปเดตสถานะการจัดส่งบัตรสมาชิก',
      html: `
        <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dzysz9ib8/image/upload/v1748184300/Udvc.imp_gork69.png" alt="Logo" style="max-width: 150px;">
          </div>
          <h2 style="text-align: center; color: #3b5998;">📦 อัปเดตสถานะการจัดส่งบัตรสมาชิก</h2>
          <p>เรียน คุณ ${alumni.firstName} ${alumni.lastName},</p>
          <p>ระบบได้ทำการอัปเดตสถานะการจัดส่งบัตรสมาชิกของท่านแล้ว</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📋 ข้อมูลการจัดส่ง:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>ชื่อ-นามสกุล:</strong> ${alumni.firstName} ${alumni.lastName}</li>
              <li><strong>ที่อยู่จัดส่ง:</strong> ${alumni.address}</li>
              <li><strong>เบอร์โทรศัพท์:</strong> ${alumni.phone}</li>
              ${alumni.trackingNumber ? `<li><strong>เลขติดตาม:</strong> <span style="background-color: #e9ecef; padding: 2px 8px; border-radius: 3px; font-family: monospace;">${alumni.trackingNumber}</span></li>` : ''}
              ${alumni.shippedDate ? `<li><strong>วันที่จัดส่ง:</strong> ${new Date(alumni.shippedDate).toLocaleDateString('th-TH')}</li>` : ''}
            </ul>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 2px solid ${statusColors[newStatus]}; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0; color: ${statusColors[newStatus]};">🚚 สถานะปัจจุบัน</h3>
            <p style="font-size: 18px; font-weight: bold; margin: 10px 0; color: ${statusColors[newStatus]};">${newStatus}</p>
            <p style="margin: 0; color: #666;">${statusMessages[newStatus]}</p>
          </div>

          ${newStatus === 'กำลังจัดส่ง' && alumni.trackingNumber ? `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h4 style="margin-top: 0; color: #1976d2;">📞 ข้อมูลการติดตาม:</h4>
              <p><strong>เลขติดตาม:</strong> ${alumni.trackingNumber}</p>
              <p>ท่านสามารถติดตามสถานะพัสดุได้ที่เว็บไซต์ของบริษัทขนส่ง หรือโทรสอบถามที่ Call Center</p>
              <p style="margin: 0;"><strong>หมายเหตุ:</strong> ${alumni.deliveryNotes || 'ไม่มี'}</p>
            </div>
          ` : ''}

          ${newStatus === 'จัดส่งแล้ว' ? `
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h4 style="margin-top: 0; color: #2e7d32;">🎉 การจัดส่งเสร็จสิ้น!</h4>
              <p>บัตรสมาชิกของท่านได้ถูกจัดส่งเรียบร้อยแล้ว หากไม่ได้รับสินค้า กรุณาติดต่อเจ้าหน้าที่</p>
              <p>ขอบคุณที่เป็นสมาชิกศิษย์เก่า และหวังว่าจะได้พบกันในกิจกรรมต่างๆ ของสมาคม</p>
            </div>
          ` : ''}

          ${alumni.trackingNumber ? `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/track/${alumni.trackingNumber}" style="background-color: #ff9800; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">📦 ติดตามพัสดุ</a>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 20px 0;">
            <a href="${FRONTEND_URL}/?idCard=${alumni.idCard}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">🔍 ตรวจสอบสถานะการลงทะเบียน</a>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0;">📞 ติดต่อเจ้าหน้าที่:</h4>
            <p>หากมีข้อสงสัยเกี่ยวกับการจัดส่ง กรุณาติดต่อ:</p>
            <ul style="margin: 0;">
              <li>อีเมล: <a href="mailto:alumni2@it.udvc.ac.th">alumni2@it.udvc.ac.th</a></li>
              <li>โทรศัพท์: 042-123-456</li>
            </ul>
          </div>

          <p>ขอแสดงความนับถือ,<br>สมาคมศิษย์เก่า<br>วิทยาลัยอาชีวศึกษาอุดรธานี</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Shipping notification email sent to ${alumni.email}: ${oldStatus} -> ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error sending shipping notification email:', error);
    return false;
  }
};

// 🚀 ส่งอีเมลแจ้ง Admin เกี่ยวกับการจัดส่ง
export const sendAdminShippingUpdateEmail = async (alumni, oldStatus, newStatus, adminUser) => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: '[แจ้งเตือนระบบ] อัปเดตสถานะการจัดส่งบัตรสมาชิก',
      html: `
        <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #3b5998;">📦 แจ้งเตือน: อัปเดตสถานะการจัดส่ง</h2>
          <p>มีการอัปเดตสถานะการจัดส่งบัตรสมาชิกในระบบ</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">รายละเอียดการอัปเดต:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>ชื่อสมาชิก:</strong> ${alumni.firstName} ${alumni.lastName}</li>
              <li><strong>เลขบัตรประชาชน:</strong> ${alumni.idCard}</li>
              <li><strong>สถานะเดิม:</strong> ${oldStatus}</li>
              <li><strong>สถานะใหม่:</strong> ${newStatus}</li>
              <li><strong>เลขติดตาม:</strong> ${alumni.trackingNumber || 'ไม่มี'}</li>
              <li><strong>ผู้อัปเดต:</strong> ${adminUser?.username || 'ระบบ'}</li>
              <li><strong>วันเวลา:</strong> ${new Date().toLocaleString('th-TH')}</li>
            </ul>
          </div>

          <p><a href="${FRONTEND_URL}/admin/shipping" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">🚚 จัดการการจัดส่ง</a></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin shipping notification email sent: ${alumni.fullName} ${oldStatus} -> ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error sending admin shipping notification email:', error);
    return false;
  }
};

export default {
  sendRegistrationEmail,
  sendAdminNotificationEmail,
  sendStatusUpdateEmail,
  sendShippingNotificationEmail,      // 🚀 ใหม่
  sendAdminShippingUpdateEmail        // 🚀 ใหม่
};