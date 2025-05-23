// src/features/payment/payment.routes.js
import express from 'express';
import {
  createPayment,
  uploadPaymentProof,
  verifyPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByAlumniId
} from './payment.controller.js';
import { upload } from '../../utils/upload.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes สำหรับผู้ใช้ทั่วไป
router.post('/', upload.single('paymentProof'), createPayment);
router.post('/:paymentId/upload', upload.single('paymentProof'), uploadPaymentProof);

// Routes สำหรับ Admin (ต้องยืนยันตัวตนก่อน)
router.get('/', authMiddleware, adminMiddleware, getAllPayments);
router.get('/:id', authMiddleware, adminMiddleware, getPaymentById);
router.get('/alumni/:alumniId', authMiddleware, adminMiddleware, getPaymentsByAlumniId);
router.patch('/:paymentId/verify', authMiddleware, adminMiddleware, verifyPayment);

export default router;