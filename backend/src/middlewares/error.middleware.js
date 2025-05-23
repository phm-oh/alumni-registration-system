// Error handling middleware 
// src/middlewares/error.middleware.js

// จัดการกับข้อผิดพลาดที่ถูกส่งต่อมาจาก controllers
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      success: false,
      message,
      error: 'ValidationError'
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} นี้ถูกใช้งานแล้ว กรุณาใช้ ${field} อื่น`;
    return res.status(400).json({
      success: false,
      message,
      error: 'DuplicateKeyError'
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `ไม่พบข้อมูลที่ต้องการ`;
    return res.status(404).json({
      success: false,
      message,
      error: 'CastError'
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่';
    return res.status(401).json({
      success: false,
      message,
      error: 'JsonWebTokenError'
    });
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่';
    return res.status(401).json({
      success: false,
      message,
      error: 'TokenExpiredError'
    });
  }

  // Default error
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'เกิดข้อผิดพลาดในระบบ',
    error: 'ServerError'
  });
};

// จัดการกับ route ที่ไม่มีอยู่
export const notFound = (req, res, next) => {
  const error = new Error(`ไม่พบ API: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default {
  errorHandler,
  notFound
};