// Path: src/utils/financial.helpers.js
// ไฟล์: financial.helpers.js - Helper Functions สำหรับระบบการเงิน

import { formatDate } from './helpers.js';

// ===============================================
// 💰 CURRENCY & NUMBER FORMATTING
// ===============================================

/**
 * ฟอร์แมตเงินแบบภาษาไทย
 * @param {number} amount - จำนวนเงิน
 * @param {object} options - ตัวเลือกการฟอร์แมต
 * @returns {string} - เงินที่ฟอร์แมตแล้ว
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    locale = 'th-TH',
    currency = 'THB',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '฿0.00' : '0.00';
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits
  });

  return formatter.format(Number(amount));
};

/**
 * ฟอร์แมตเปอร์เซ็นต์
 * @param {number} value - ค่าที่ต้องการแปลง
 * @param {number} total - ค่ารวม
 * @param {object} options - ตัวเลือก
 * @returns {string} - เปอร์เซ็นต์ที่ฟอร์แมตแล้ว
 */
export const formatPercentage = (value, total, options = {}) => {
  const { decimals = 1, showSymbol = true } = options;
  
  if (!total || total === 0) {
    return showSymbol ? '0.0%' : '0.0';
  }
  
  const percentage = (value / total) * 100;
  const formatted = percentage.toFixed(decimals);
  
  return showSymbol ? `${formatted}%` : formatted;
};

/**
 * ฟอร์แมตตัวเลขแบบย่อ (K, M, B)
 * @param {number} number - ตัวเลข
 * @returns {string} - ตัวเลขที่ย่อแล้ว
 */
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  const absNumber = Math.abs(number);
  
  if (absNumber >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'B';
  } else if (absNumber >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (absNumber >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  
  return number.toString();
};

// ===============================================
// 📊 CALCULATION HELPERS
// ===============================================

/**
 * คำนวณกำไรสุทธิ
 * @param {number} revenue - รายรับ
 * @param {number} expenses - รายจ่าย
 * @returns {object} - ข้อมูลกำไรสุทธิ
 */
export const calculateNetProfit = (revenue, expenses) => {
  const netProfit = (revenue || 0) - (expenses || 0);
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  return {
    netProfit,
    margin,
    isProfit: netProfit >= 0,
    formattedNetProfit: formatCurrency(netProfit),
    formattedMargin: `${margin.toFixed(2)}%`
  };
};

/**
 * คำนวณการเติบโต (Growth Rate)
 * @param {number} current - ค่าปัจจุบัน
 * @param {number} previous - ค่าก่อนหน้า
 * @returns {object} - ข้อมูลการเติบโต
 */
export const calculateGrowthRate = (current, previous) => {
  if (!previous || previous === 0) {
    return {
      growthRate: current > 0 ? 100 : 0,
      isGrowth: current > 0,
      formattedGrowthRate: current > 0 ? '+100%' : '0%'
    };
  }
  
  const growthRate = ((current - previous) / previous) * 100;
  const isGrowth = growthRate >= 0;
  
  return {
    growthRate,
    isGrowth,
    formattedGrowthRate: `${isGrowth ? '+' : ''}${growthRate.toFixed(2)}%`
  };
};

/**
 * คำนวณค่าเฉลี่ย
 * @param {array} values - อาร์เรย์ของตัวเลข
 * @returns {number} - ค่าเฉลี่ย
 */
export const calculateAverage = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }
  
  const validValues = values.filter(val => !isNaN(val) && val !== null && val !== undefined);
  if (validValues.length === 0) {
    return 0;
  }
  
  const sum = validValues.reduce((acc, val) => acc + Number(val), 0);
  return sum / validValues.length;
};

/**
 * หาค่ามากที่สุดและน้อยที่สุด
 * @param {array} values - อาร์เรย์ของตัวเลข
 * @returns {object} - ค่า min, max
 */
export const findMinMax = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const validValues = values.filter(val => !isNaN(val) && val !== null && val !== undefined);
  if (validValues.length === 0) {
    return { min: 0, max: 0 };
  }
  
  return {
    min: Math.min(...validValues),
    max: Math.max(...validValues)
  };
};

// ===============================================
// 📅 DATE & PERIOD HELPERS
// ===============================================

/**
 * สร้างรายการปีสำหรับ dropdown
 * @param {number} startYear - ปีเริ่มต้น
 * @param {number} yearRange - จำนวนปีที่ต้องการ
 * @returns {array} - รายการปี
 */
export const generateYearOptions = (startYear = null, yearRange = 5) => {
  const currentYear = new Date().getFullYear();
  const start = startYear || (currentYear - yearRange + 1);
  
  return Array.from({ length: yearRange }, (_, i) => {
    const year = start + i;
    return {
      value: year,
      label: `${year}`,
      labelThai: `${year + 543}` // ปี พ.ศ.
    };
  }).reverse(); // ปีล่าสุดก่อน
};

/**
 * สร้างรายการเดือนสำหรับ dropdown
 * @returns {array} - รายการเดือน
 */
export const generateMonthOptions = () => {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  return months.map((month, index) => ({
    value: index + 1,
    label: month,
    shortLabel: month.substring(0, 3) // ม.ค., ก.พ., เป็นต้น
  }));
};

/**
 * แปลงชื่อเดือนเป็นภาษาไทย
 * @param {number} month - เดือน (1-12)
 * @returns {string} - ชื่อเดือนภาษาไทย
 */
export const getThaiMonthName = (month) => {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  return months[month - 1] || 'ไม่ระบุ';
};

/**
 * สร้างช่วงวันที่สำหรับเดือน
 * @param {number} year - ปี
 * @param {number} month - เดือน
 * @returns {object} - วันที่เริ่มต้นและสิ้นสุด
 */
export const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return {
    startDate,
    endDate,
    formattedStart: formatDate(startDate),
    formattedEnd: formatDate(endDate)
  };
};

/**
 * ตรวจสอบว่าเป็นเดือนปัจจุบันหรือไม่
 * @param {number} year - ปี
 * @param {number} month - เดือน
 * @returns {boolean} - true ถ้าเป็นเดือนปัจจุบัน
 */
export const isCurrentMonth = (year, month) => {
  const now = new Date();
  return year === now.getFullYear() && month === (now.getMonth() + 1);
};

// ===============================================
// 🎨 COLOR & CHART HELPERS
// ===============================================

/**
 * สีสำหรับกราฟตามสถานะ
 * @param {string} status - สถานะ
 * @returns {string} - สีในรูปแบบ hex
 */
export const getStatusColor = (status) => {
  const colors = {
    // Expense statuses
    'รอดำเนินการ': '#ffc107', // เหลือง
    'อนุมัติ': '#28a745',      // เขียว
    'ปฏิเสธ': '#dc3545',       // แดง
    'ชำระแล้ว': '#17a2b8',     // ฟ้า
    
    // Financial statuses
    'กำไร': '#28a745',         // เขียว
    'ขาดทุน': '#dc3545',       // แดง
    'เท่าทุน': '#6c757d',      // เทา
    
    // General
    'สูง': '#dc3545',          // แดง
    'กลาง': '#ffc107',         // เหลือง
    'ต่ำ': '#28a745',          // เขียว
    
    // Default
    'default': '#6c757d'       // เทา
  };
  
  return colors[status] || colors.default;
};

/**
 * สร้างชุดสีสำหรับกราฟ
 * @param {number} count - จำนวนสีที่ต้องการ
 * @returns {array} - อาร์เรย์ของสี
 */
export const generateChartColors = (count) => {
  const baseColors = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // สร้างสีเพิ่มเติมถ้าต้องการมากกว่า base colors
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 360) / count;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return colors;
};

// ===============================================
// 📋 VALIDATION HELPERS
// ===============================================

/**
 * ตรวจสอบว่าเป็นตัวเลขที่ถูกต้องหรือไม่
 * @param {any} value - ค่าที่ต้องการตรวจสอบ
 * @param {object} options - ตัวเลือกการตรวจสอบ
 * @returns {object} - ผลการตรวจสอบ
 */
export const validateAmount = (value, options = {}) => {
  const { min = 0, max = null, allowZero = false } = options;
  
  const errors = [];
  const amount = Number(value);
  
  if (isNaN(amount)) {
    errors.push('กรุณากรอกตัวเลขที่ถูกต้อง');
  } else {
    if (!allowZero && amount <= 0) {
      errors.push('จำนวนเงินต้องมากกว่า 0');
    }
    
    if (amount < min) {
      errors.push(`จำนวนเงินต้องไม่น้อยกว่า ${formatCurrency(min)}`);
    }
    
    if (max !== null && amount > max) {
      errors.push(`จำนวนเงินต้องไม่เกิน ${formatCurrency(max)}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    amount: isNaN(amount) ? 0 : amount
  };
};

/**
 * ตรวจสอบช่วงวันที่
 * @param {string|Date} startDate - วันที่เริ่มต้น
 * @param {string|Date} endDate - วันที่สิ้นสุด
 * @returns {object} - ผลการตรวจสอบ
 */
export const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    errors.push('วันที่เริ่มต้นไม่ถูกต้อง');
  }
  
  if (isNaN(end.getTime())) {
    errors.push('วันที่สิ้นสุดไม่ถูกต้อง');
  }
  
  if (errors.length === 0 && start > end) {
    errors.push('วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด');
  }
  
  // ตรวจสอบว่าช่วงวันที่ไม่เกิน 1 ปี
  if (errors.length === 0) {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) {
      errors.push('ช่วงวันที่ต้องไม่เกิน 1 ปี');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    startDate: start,
    endDate: end
  };
};

// ===============================================
// 📊 EXPORT HELPERS
// ===============================================

/**
 * แปลงข้อมูลสำหรับ CSV export
 * @param {array} data - ข้อมูล
 * @param {array} headers - หัวข้อคอลัมน์
 * @returns {string} - ข้อมูล CSV
 */
export const convertToCSV = (data, headers) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  // สร้างหัวข้อ
  const csvHeaders = headers.join(',');
  
  // สร้างข้อมูล
  const csvData = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // Escape quotes และ wrap ด้วย quotes ถ้าจำเป็น
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvData].join('\n');
};

/**
 * สร้างชื่อไฟล์สำหรับ export
 * @param {string} type - ประเภทข้อมูล
 * @param {string} format - รูปแบบไฟล์
 * @param {object} options - ตัวเลือกเพิ่มเติม
 * @returns {string} - ชื่อไฟล์
 */
export const generateExportFilename = (type, format, options = {}) => {
  const { startDate, endDate, prefix = 'financial' } = options;
  
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let filename = `${prefix}-${type}-${timestamp}`;
  
  if (startDate && endDate) {
    const start = new Date(startDate).toISOString().split('T')[0];
    const end = new Date(endDate).toISOString().split('T')[0];
    filename += `-${start}_to_${end}`;
  }
  
  return `${filename}.${format}`;
};

// ===============================================
// 🔢 SUMMARY HELPERS
// ===============================================

/**
 * สร้างสรุปข้อมูลทางการเงิน
 * @param {array} data - ข้อมูลการเงิน
 * @param {string} amountField - ชื่อฟิลด์ที่เก็บจำนวนเงิน
 * @returns {object} - ข้อมูลสรุป
 */
export const createFinancialSummary = (data, amountField = 'amount') => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      total: 0,
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      formattedTotal: formatCurrency(0),
      formattedAverage: formatCurrency(0)
    };
  }
  
  const amounts = data.map(item => Number(item[amountField] || 0));
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  const average = total / amounts.length;
  const { min, max } = findMinMax(amounts);
  
  return {
    total,
    count: data.length,
    average,
    min,
    max,
    formattedTotal: formatCurrency(total),
    formattedAverage: formatCurrency(average),
    formattedMin: formatCurrency(min),
    formattedMax: formatCurrency(max)
  };
};

export default {
  // Currency & Number Formatting
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  
  // Calculation Helpers
  calculateNetProfit,
  calculateGrowthRate,
  calculateAverage,
  findMinMax,
  
  // Date & Period Helpers
  generateYearOptions,
  generateMonthOptions,
  getThaiMonthName,
  getMonthDateRange,
  isCurrentMonth,
  
  // Color & Chart Helpers
  getStatusColor,
  generateChartColors,
  
  // Validation Helpers
  validateAmount,
  validateDateRange,
  
  // Export Helpers
  convertToCSV,
  generateExportFilename,
  
  // Summary Helpers
  createFinancialSummary
};