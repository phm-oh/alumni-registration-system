// Path: src/app.js (แก้ไขเฉพาะส่วน routes)
// เพิ่มการ import shipping routes ใหม่

import express from 'express';
import cors from 'cors';
import { PORT, CLIENT_URL } from './config/env.js';
import connectDB from './config/db.js';
import alumniRoutes from './features/alumni/alumni.routes.js';
import authRoutes from './features/auth/auth.routes.js';
import statusRoutes from './features/status/status.routes.js';
import notificationRoutes from './features/notification/notification.routes.js';
import shippingRoutes from './features/alumni/shipping.routes.js'; // 🚀 ต้องมีบรรทัดนี้
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

// สำหรับ ES Module เพื่อให้ใช้ __dirname ได้
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// เชื่อมต่อกับฐานข้อมูล MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/alumni', alumniRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/shipping', shippingRoutes); // 🚀 ต้องมีบรรทัดนี้

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// สร้าง API สถานะ
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Alumni Registration System API is running',
    timestamp: new Date(),
    features: [
      'Alumni Registration',
      'Payment Management', 
      'Status Tracking',
      'Notifications',
      'Shipping Management', // 🚀 เพิ่มใหม่
      'Label Generation',     // 🚀 เพิ่มใหม่
      'Minimal Labels',       // 🚀 เพิ่มใหม่
      '4-Up Labels'          // 🚀 เพิ่มใหม่
    ]
  });
});

// รองรับ SPA Routing - ใช้ middleware แทน wildcard route
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (req.path.includes('.')) {
    return next();
  }
  
  res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT || 5500, () => {
  console.log(`🚀 Alumni Registration System Server is running on port ${PORT || 5500}`);
  console.log(`📋 Available APIs:`);
  console.log(`   • Alumni Management: /api/alumni`);
  console.log(`   • Authentication: /api/auth`);
  console.log(`   • Status Tracking: /api/status`);
  console.log(`   • Notifications: /api/notifications`);
  console.log(`   • 🚀 Shipping Management: /api/shipping`);
  console.log(`   • 🏷️ Label Generation: /api/shipping/labels/*`);
  console.log(`   • Health Check: /api/health`);
  console.log(`📦 Shipping Label APIs:`);
  console.log(`   • Minimal Label: GET /api/shipping/labels/minimal/:id`);
  console.log(`   • 4-Up Labels: POST /api/shipping/labels/4up`);
  console.log(`   • Full Label: GET /api/shipping/labels/single/:id`);
  console.log(`   • Bulk Labels: POST /api/shipping/labels/bulk`);
});