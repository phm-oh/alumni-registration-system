// src/utils/upload.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET 
} from '../config/env.js';
import fs from 'fs';
import path from 'path';

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

// ตั้งค่า Storage สำหรับ multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alumni_payment_proofs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    transformation: [{ width: 1000, crop: 'limit' }]
  }
});

// สร้าง multer middleware
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // จำกัดขนาดไฟล์ไม่เกิน 5 MB
});

// อัปโหลดไฟล์ไปยัง Cloudinary โดยตรง
export const uploadToCloudinary = async (file) => {
  try {
    // ถ้าเป็น buffer ให้อัปโหลดโดยตรง
    if (file.buffer) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'alumni_payment_proofs',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        
        uploadStream.write(file.buffer);
        uploadStream.end();
      });
    }
    
    // ถ้าเป็น path ให้อัปโหลดโดยตรง (ไม่ใช้ fs.createReadStream)
    if (file.path) {
      return await cloudinary.uploader.upload(file.path, {
        folder: 'alumni_payment_proofs',
        resource_type: 'auto'
      });
    }

    // กรณีที่เป็น URL ของ Cloudinary อยู่แล้ว
    if (typeof file === 'string' && file.startsWith('http')) {
      return { secure_url: file };
    }
    
    throw new Error('Invalid file format');
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export default {
  upload,
  uploadToCloudinary
};