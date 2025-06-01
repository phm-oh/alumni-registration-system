// src/config/env.js
import dotenv from 'dotenv';

// โหลดตัวแปรจากไฟล์ .env
dotenv.config();

export const PORT = process.env.PORT || 5500;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://alumnni:Alumni1234@cluster0.cqpvkla.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
export const JWT_SECRET = process.env.JWT_SECRET || "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc0Nzk5NjYyMCwiaWF0IjoxNzQ3OTk2NjIwfQ.PCkB9U6zzvAhBa7Mu1dKrxlGgRj67KTLtBGKlcqa-B8";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
export const EMAIL_USER = process.env.EMAIL_USER || "alumni2@it.udvc.ac.th";
export const EMAIL_PASS = process.env.EMAIL_PASS || "jngnywezdpspflnq";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "alumni2@it.udvc.ac.th";
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "djnhoz1vm";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "695137725626495";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "0AdwqZLvqn7y57c7M-bhR_1CKHQ";

export const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fontend-alumni.onrender.com';