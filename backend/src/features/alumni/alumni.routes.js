// src/features/alumni/alumni.routes.js
import express from 'express';
import {
  registerAlumni,
  checkRegistrationStatusController,
  uploadPaymentProofController,
  getAllAlumniController,
  getAlumniByIdController,
  updateAlumniStatusController,
  getStatisticsController
} from './alumni.controller.js';
import { upload } from '../../utils/upload.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes สำหรับผู้ใช้ทั่วไป
router.post('/register', upload.single('paymentProof'), registerAlumni);
router.post('/check-status', checkRegistrationStatusController);
router.post('/upload-payment', upload.single('paymentProof'), uploadPaymentProofController);

// Routes สำหรับ Admin (ต้องยืนยันตัวตนก่อน)
router.get('/', authMiddleware, adminMiddleware, getAllAlumniController);
router.get('/statistics', authMiddleware, adminMiddleware, getStatisticsController);
router.get('/:id', authMiddleware, adminMiddleware, getAlumniByIdController);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateAlumniStatusController);

export default router;