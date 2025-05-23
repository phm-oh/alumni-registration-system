// Helper functions 
// src/utils/helpers.js

// ฟอร์แมตเงิน เช่น 1234.56 -> 1,234.56 บาท
export const formatMoney = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount);
};

// ฟอร์แมตวันที่ เช่น 2023-05-18 -> 18/05/2566
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const thaiYear = date.getFullYear() + 543;
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${day}/${month}/${thaiYear}`;
};

// แปลงชื่อสถานะเป็นข้อความภาษาไทย
export const translateStatus = (status) => {
  const statusMap = {
    'pending': 'รอตรวจสอบ',
    'approved': 'อนุมัติแล้ว',
    'waiting_payment': 'รอการชำระเงิน',
    'cancelled': 'ยกเลิก'
  };
  
  return statusMap[status] || status;
};

// สร้างรหัสอ้างอิงสำหรับการชำระเงิน
export const generateReferenceCode = (prefix = 'ALM', length = 8) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 2 + (length - 6));
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// ตรวจสอบความถูกต้องของเลขบัตรประชาชน
export const validateThaiID = (id) => {
  if (id.length !== 13) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i);
  }
  
  const checkDigit = (11 - (sum % 11)) % 10;
  return parseInt(id[12]) === checkDigit;
};

export default {
  formatMoney,
  formatDate,
  translateStatus,
  generateReferenceCode,
  validateThaiID
};