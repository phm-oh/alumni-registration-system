// src/config/db.js
import mongoose from 'mongoose';
import { MONGODB_URI } from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Atlas connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;