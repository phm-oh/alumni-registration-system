// Path: src/app.js (อัปเดต - เพิ่ม Financial Routes)
// เพิ่มการ import financial routes

import express from 'express';
import cors from 'cors';
import { PORT, CLIENT_URL } from './config/env.js';
import connectDB from './config/db.js';
import alumniRoutes from './features/alumni/alumni.routes.js';
import authRoutes from './features/auth/auth.routes.js';
import statusRoutes from './features/status/status.routes.js';
import notificationRoutes from './features/notification/notification.routes.js';
import shippingRoutes from './features/alumni/shipping.routes.js';
import financialRoutes from './features/financial/financial.routes.js'; // 🚀 เพิ่มใหม่
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
app.use('/api/shipping', shippingRoutes);
app.use('/api/financial', financialRoutes); // 🚀 เพิ่มใหม่

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// สร้าง API สถานะ
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Alumni Registration System API is running',
    timestamp: new Date(),
    version: '2.0.0', // 🚀 อัปเดตเวอร์ชัน
    features: [
      'Alumni Registration',
      'Payment Management', 
      'Status Tracking',
      'Notifications',
      'Shipping Management',
      'Label Generation',
      'Minimal Labels',
      '4-Up Labels',
      'Financial Management', // 🚀 เพิ่มใหม่
      'Expense Tracking',     // 🚀 เพิ่มใหม่
      'Revenue Analytics',    // 🚀 เพิ่มใหม่
      'Financial Reports'     // 🚀 เพิ่มใหม่
    ],
    modules: {
      alumni: {
        description: 'Alumni registration and management',
        endpoints: '/api/alumni/*'
      },
      auth: {
        description: 'Authentication and user management',
        endpoints: '/api/auth/*'
      },
      status: {
        description: 'Status checking and updates',
        endpoints: '/api/status/*'
      },
      notifications: {
        description: 'Notification system',
        endpoints: '/api/notifications/*'
      },
      shipping: {
        description: 'Shipping and label management',
        endpoints: '/api/shipping/*'
      },
      financial: { // 🚀 เพิ่มใหม่
        description: 'Financial management and reporting',
        endpoints: '/api/financial/*',
        features: [
          'Expense Management',
          'Revenue Tracking',
          'Financial Periods',
          'Dashboard & Analytics',
          'Export & Reports'
        ]
      }
    }
  });
});

// 🚀 เพิ่ม API overview endpoint
app.get('/api/overview', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Overview - Alumni Registration System',
    timestamp: new Date(),
    apiVersion: '2.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        description: 'Authentication & User Management',
        routes: [
          'POST /api/auth/login',
          'POST /api/auth/register',
          'GET /api/auth/me',
          'PUT /api/auth/change-password'
        ]
      },
      alumni: {
        base: '/api/alumni',
        description: 'Alumni Management',
        routes: [
          'POST /api/alumni/register',
          'POST /api/alumni/check-status',
          'GET /api/alumni/',
          'GET /api/alumni/:id',
          'PATCH /api/alumni/:id/status'
        ]
      },
      shipping: {
        base: '/api/shipping',
        description: 'Shipping & Labels',
        routes: [
          'GET /api/shipping/labels/minimal/:id',
          'POST /api/shipping/labels/4up',
          'GET /api/shipping/labels/single/:id'
        ]
      },
      financial: { // 🚀 เพิ่มใหม่
        base: '/api/financial',
        description: 'Financial Management',
        routes: [
          'GET /api/financial/dashboard',
          'GET /api/financial/expenses',
          'POST /api/financial/expenses',
          'GET /api/financial/statistics/revenue',
          'GET /api/financial/reports'
        ]
      },
      notifications: {
        base: '/api/notifications',
        description: 'Notification System',
        routes: [
          'GET /api/notifications/',
          'PATCH /api/notifications/:id/read',
          'GET /api/notifications/unread-count'
        ]
      },
      status: {
        base: '/api/status',
        description: 'Status Management',
        routes: [
          'POST /api/status/check',
          'GET /api/status/statistics'
        ]
      }
    },
    systemInfo: {
      database: 'MongoDB Atlas',
      fileStorage: 'Cloudinary',
      emailService: 'Gmail SMTP',
      authentication: 'JWT',
      cors: CLIENT_URL
    }
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
  console.log(`   • 💰 Financial Management: /api/financial`); // 🚀 เพิ่มใหม่
  console.log(`   • Health Check: /api/health`);
  console.log(`   • API Overview: /api/overview`); // 🚀 เพิ่มใหม่
  
  console.log(`📦 Shipping Label APIs:`);
  console.log(`   • Minimal Label: GET /api/shipping/labels/minimal/:id`);
  console.log(`   • 4-Up Labels: POST /api/shipping/labels/4up`);
  console.log(`   • Full Label: GET /api/shipping/labels/single/:id`);
  console.log(`   • Bulk Labels: POST /api/shipping/labels/bulk`);
  
  console.log(`💰 Financial APIs:`); // 🚀 เพิ่มใหม่
  console.log(`   • Dashboard: GET /api/financial/dashboard`);
  console.log(`   • Create Expense: POST /api/financial/expenses`);
  console.log(`   • Get Expenses: GET /api/financial/expenses`);
  console.log(`   • Revenue Stats: GET /api/financial/statistics/revenue`);
  console.log(`   • Expense Stats: GET /api/financial/statistics/expenses`);
  console.log(`   • Financial Reports: GET /api/financial/reports`);
  console.log(`   • Export Data: GET /api/financial/export`);
  console.log(`   • Pending Payments: GET /api/financial/pending-payments`);
  console.log(`   • Test API: GET /api/financial/test`);
  
  console.log(`🎯 Quick Start URLs:`);
  console.log(`   • API Health: http://localhost:${PORT || 5500}/api/health`);
  console.log(`   • API Overview: http://localhost:${PORT || 5500}/api/overview`);
  console.log(`   • Financial Test: http://localhost:${PORT || 5500}/api/financial/test`);
});