// src/features/status/status.routes.js
import express from 'express';
import {
  checkStatus,
  updateStatusController,
  getStatisticsController,
  searchAlumniRecords
} from './status.controller.js';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes สำหรับผู้ใช้ทั่วไป
router.post('/check', checkStatus);

// Routes สำหรับ Admin (ต้องยืนยันตัวตนก่อน)
router.patch('/:id', authMiddleware, adminMiddleware, updateStatusController);
router.get('/statistics', authMiddleware, adminMiddleware, getStatisticsController);
router.get('/search', authMiddleware, adminMiddleware, searchAlumniRecords);

export default router;