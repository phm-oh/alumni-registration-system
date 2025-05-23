// src/features/status/status.service.js
import { 
  checkRegistrationStatus,
  updateAlumniStatus,
  getRegistrationStatistics,
  getAllAlumni
} from '../alumni/alumni.service.js';

/**
 * ตรวจสอบสถานะการลงทะเบียนโดยใช้เลขบัตรประชาชน
 * (ใช้ alumni service)
 */
export const checkStatusByIdCard = async (idCard) => {
  return await checkRegistrationStatus(idCard);
};

/**
 * อัปเดตสถานะการลงทะเบียน
 * (ใช้ alumni service)
 */
export const updateStatus = async (id, status, note, userId) => {
  return await updateAlumniStatus(id, status, note, userId);
};

/**
 * ดึงข้อมูลสถิติการลงทะเบียน
 * (ใช้ alumni service)
 */
export const getStatistics = async () => {
  return await getRegistrationStatistics();
};

/**
 * ค้นหาข้อมูลศิษย์เก่าตามเงื่อนไขต่างๆ
 * (ใช้ alumni service)
 */
export const searchAlumni = async (filters, options = {}) => {
  return await getAllAlumni(filters, options);
};

export default {
  checkStatusByIdCard,
  updateStatus,
  getStatistics,
  searchAlumni
};