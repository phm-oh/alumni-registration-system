// Alumni routes 
// src/features/alumni/alumni.routes.js
import express from 'express';
import {
  registerAlumni,
  checkRegistrationStatus,
  uploadPaymentProof,
  getAllAlumni,
  getAlumniById,
  updateAlumniStatus
} from './alumni.controller.js';
import { upload } from '../../utils/upload.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes สำหรับผู้ใช้ทั่วไป
router.post('/register', upload.single('paymentProof'), registerAlumni);
router.post('/check-status', checkRegistrationStatus);
router.post('/upload-payment', upload.single('paymentProof'), uploadPaymentProof);

// Routes สำหรับ Admin (ต้องยืนยันตัวตนก่อน)
router.get('/', authMiddleware, adminMiddleware, getAllAlumni);
router.get('/:id', authMiddleware, adminMiddleware, getAlumniById);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateAlumniStatus);

export default router;