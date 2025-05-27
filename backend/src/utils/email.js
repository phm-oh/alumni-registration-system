// src/utils/email.js
import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS, ADMIN_EMAIL } from '../config/env.js';

// Frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fontend-alumni.onrender.com';

// สร้าง transporter สำหรับส่งอีเมล
const transporter = nodemailer.createTransporter({
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
              <li><strong>วันที่ชำระเงิน:</strong> ${alumni.paymentDate ? new Date(alumni.paymentDate).toLocaleDateString('th-TH') : 'รอการชำระเงิน'}</li>
            </ul>
          </div>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>สถานะการลงทะเบียน:</strong> ${alumni.status}</p>
          </div>
          <p>เจ้าหน้าที่จะตรวจสอบข้อมูลและหลักฐานการชำระเงินของท่าน และจะส่งอีเมลยืนยันการเป็นสมาชิกให้ท่านในภายหลัง</p>
          <p><strong>*** บัตรสมาชิกสำหรับสมาชิกจะจัดส่งไปตามที่อยู่ที่ท่านแจ้งไว้ภายใน 7 วันทำการหลังจากได้รับการอนุมัติ ***</strong></p>
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
          <p><a href="${FRONTEND_URL || 'https://fontend-alumni.onrender.com'}/admin" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">🔧 เข้าระบบ Admin</a></p>
          <p><a href="${FRONTEND_URL || 'https://fontend-alumni.onrender.com'}/?idCard=${alumni.idCard}" style="background-color: #2196F3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">👀 ดูข้อมูลผู้สมัคร</a></p>
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
          <div style="background-color: ${alumni.status === 'อนุมัติแล้ว' ? '#d4edda' : '#fff3cd'}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${alumni.status === 'อนุมัติแล้ว' ? '#28a745' : '#ffc107'};">
            <p style="margin: 0; font-size: 18px;"><strong>สถานะปัจจุบัน:</strong> ${alumni.status}</p>
          </div>
          ${alumni.status === 'อนุมัติแล้ว' ? `
          <p>🎉 ขอแสดงความยินดี! ท่านได้เป็นสมาชิกศิษย์เก่าอย่างเป็นทางการแล้ว</p>
          <p><strong>การจัดส่งบัตรสมาชิก:</strong> ${alumni.deliveryOption === 'จัดส่งทางไปรษณีย์' ? 'บัตรสมาชิกจะถูกจัดส่งไปยังที่อยู่ที่ท่านให้ไว้ภายใน 7 วันทำการ' : 'ท่านสามารถมารับบัตรสมาชิกได้ที่สำนักงานสมาคมศิษย์เก่า ในวันและเวลาทำการ'}</p>
          ` : ''}
          ${alumni.status === 'รอการชำระเงิน' ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">💰 ข้อมูลการชำระเงิน:</h3>
            <p><strong>จำนวนเงิน:</strong> ${alumni.totalAmount} บาท</p>
            <p><strong>ธนาคาร:</strong> ธนาคารกรุงไทย</p>
            <p><strong>เลขที่บัญชี:</strong> 443-3-40313-5</p>
            <p><strong>ชื่อบัญชี:</strong> ม.จ.จุฑารส รชนีกุล</p>
            <p><strong>สาขา:</strong> เซนทรัลพลาซา อุดรธานี</p>
            <p>หลังจากชำระเงินเรียบร้อยแล้ว กรุณาอัปโหลดหลักฐานการชำระเงินในระบบ หรือส่งมาที่อีเมล alumni@gsuite.udvc.ac.th</p>
          </div>
          ` : ''}
          <div style="text-align: center; margin: 20px 0;">
            <a href="${FRONTEND_URL || 'https://alumni-registration-system-1.onrender.com'}/?idCard=${alumni.idCard}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">🔍 ตรวจสอบสถานะการลงทะเบียน</a>
          </div>
          <p>หากมีข้อสงสัยประการใด กรุณาติดต่อ <a href="mailto:alumni@gsuite.udvc.ac.th">alumni@gsuite.udvc.ac.th</a></p>
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

export default {
  sendRegistrationEmail,
  sendAdminNotificationEmail,
  sendStatusUpdateEmail
};