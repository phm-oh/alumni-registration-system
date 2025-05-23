// src/app.js
import express from 'express';
import cors from 'cors';
import { PORT, CLIENT_URL } from './config/env.js';
import connectDB from './config/db.js';
import alumniRoutes from './features/alumni/alumni.routes.js';
import authRoutes from './features/auth/auth.routes.js';
import statusRoutes from './features/status/status.routes.js';
import notificationRoutes from './features/notification/notification.routes.js';
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

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// สร้าง API สถานะ
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date()
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
  console.log(`Server is running on port ${PORT || 5500}`);
});