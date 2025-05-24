// src/features/alumni/alumni.routes.js
import express from 'express';
import {
  registerAlumni,
  checkRegistrationStatusController,
  uploadPaymentProofController,
  getAllAlumniController,
  getAlumniByIdController,
  updateAlumniStatusController,
  updateAlumniPositionController,
  getStatisticsController,
  getDepartmentsController,
  getGraduationYearsController
} from './alumni.controller.js';
import { upload } from '../../utils/upload.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes สำหรับผู้ใช้ทั่วไป
//router.post('/register', upload.single('paymentProof'), registerAlumni);
router.post('/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 }
]), registerAlumni);




router.post('/check-status', checkRegistrationStatusController);
router.post('/upload-payment', upload.single('paymentProof'), uploadPaymentProofController);

// Routes สำหรับ Admin (ต้องยืนยันตัวตนก่อน)
router.get('/', authMiddleware, adminMiddleware, getAllAlumniController);
router.get('/statistics', authMiddleware, adminMiddleware, getStatisticsController);
router.get('/departments', authMiddleware, adminMiddleware, getDepartmentsController);
router.get('/graduation-years', authMiddleware, adminMiddleware, getGraduationYearsController);
router.get('/:id', authMiddleware, adminMiddleware, getAlumniByIdController);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateAlumniStatusController);
router.patch('/:id/position', authMiddleware, adminMiddleware, updateAlumniPositionController);

export default router;