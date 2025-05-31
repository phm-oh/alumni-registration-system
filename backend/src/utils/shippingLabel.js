// Path: src/utils/shippingLabel.js
// ไฟล์: shippingLabel.js - อัปเดทให้ปลอดภัยและใช้งานจริงได้

import { formatDate, generateReferenceCode } from './helpers.js';

/**
 * 🚀 สร้าง HTML template สำหรับ shipping label - เวอร์ชันปรับปรุงใหม่
 * ขนาด A6 (105mm x 148mm) เหมาะสำหรับแปะกล่องพัสดุ
 * ✅ ปลอดภัย: ไม่แสดงมูลค่าสินค้า
 * ✅ ปฏิบัติได้จริง: ไม่มีเลขติดตาม (จะได้ทีหลัง)
 * ✅ PDPA Compliant: ซ่อนข้อมูลส่วนตัว
 */
export const generateShippingLabelHTML = (alumni, options = {}) => {
  const {
    logoUrl = '',
    companyName = 'สมาคมศิษย์เก่า วิทยาลัยการอาชีพอุดรธานี',
    companyAddress = 'เลขที่ 8 วิทยาลัยอาชีวศึกษาอุดรธานี ถนนโพธิศรี ตำบลหมากแข้ง อำเภอเมือง จังหวัดอุดรธานี 41000',
    companyPhone = '042-224-6690',
    coordinator = 'น.ส.ชุติภัทร ชวาลไชย',
    coordinatorPhone = '088-931-7849',
    batchNumber = null
  } = options;

  const today = new Date();
  const labelId = generateReferenceCode('LBL');
  
  // 🔒 PDPA Compliant: ซ่อนเลขบัตรประชาชนบางส่วน
  const maskedIdCard = alumni.idCard ? 
    alumni.idCard.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-****-*****-**-$5') : 
    'ไม่ระบุ';
  
  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shipping Label - ${alumni.fullName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Prompt', sans-serif;
          font-size: 11px;
          line-height: 1.3;
          color: #333;
          background: white;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 5mm;
        }
        
        .label-container {
          width: 105mm;
          height: 148mm;
          padding: 4mm;
          border: 2px solid #333;
          background: white;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          page-break-inside: avoid;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 3mm;
          margin-bottom: 3mm;
        }
        
        .logo {
          max-width: 15mm;
          max-height: 10mm;
          margin-bottom: 1mm;
        }
        
        .company-name {
          font-size: 9px;
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 1mm;
          line-height: 1.2;
        }
        
        .label-title {
          font-size: 11px;
          font-weight: 700;
          color: #d32f2f;
          margin-bottom: 1mm;
        }
        
        .section {
          margin-bottom: 3mm;
        }
        
        .section-title {
          font-size: 8px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          border-bottom: 1px solid #ddd;
          padding-bottom: 1mm;
          margin-bottom: 2mm;
        }
        
        .recipient-info {
          background: #f8f9fa;
          padding: 2mm;
          border-radius: 2mm;
          border-left: 3px solid #28a745;
        }
        
        .recipient-name {
          font-size: 13px;
          font-weight: 700;
          color: #333;
          margin-bottom: 2mm;
        }
        
        .recipient-details {
          font-size: 10px;
          line-height: 1.4;
        }
        
        .address-box {
          margin-bottom: 2mm;
          padding: 1mm;
          background: white;
          border: 1px solid #ddd;
          border-radius: 1mm;
          min-height: 12mm;
        }
        
        .tracking-section {
          background: #e3f2fd;
          padding: 3mm;
          border-radius: 2mm;
          text-align: center;
          border: 2px dashed #2196f3;
          margin-bottom: 3mm;
        }
        
        .tracking-placeholder {
          font-size: 11px;
          font-weight: 600;
          color: #1976d2;
          margin-bottom: 1mm;
        }
        
        .tracking-note {
          font-size: 8px;
          color: #666;
          font-style: italic;
        }
        
        .footer {
          position: absolute;
          bottom: 4mm;
          left: 4mm;
          right: 4mm;
          border-top: 1px solid #ddd;
          padding-top: 2mm;
          font-size: 7px;
          color: #666;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2mm;
          align-items: center;
        }
        
        .company-contact {
          line-height: 1.3;
        }
        
        .qr-placeholder {
          width: 12mm;
          height: 12mm;
          border: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6px;
          color: #999;
          text-align: center;
          background: #f5f5f5;
        }
        
        .batch-info {
          background: #fff3cd;
          padding: 1mm;
          border-radius: 1mm;
          border-left: 3px solid #ffc107;
          font-size: 8px;
          margin-bottom: 2mm;
        }
        
        .ready-flag {
          position: absolute;
          top: 2mm;
          right: 2mm;
          background: #28a745;
          color: white;
          padding: 1mm 2mm;
          border-radius: 1mm;
          font-size: 7px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .content-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1mm;
          font-size: 9px;
        }
        
        .content-item strong {
          color: #333;
          min-width: 15mm;
          flex-shrink: 0;
        }
        
        .graduation-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1mm 2mm;
          border-radius: 4px;
          font-size: 8px;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 1mm;
        }
        
        .privacy-notice {
          background: #fff3cd;
          padding: 1mm;
          border-radius: 1mm;
          font-size: 7px;
          color: #856404;
          text-align: center;
          border: 1px solid #ffeaa7;
          margin-bottom: 2mm;
        }
        
        .package-contents {
          background: #f8f9fa;
          padding: 2mm;
          border-radius: 1mm;
          font-size: 9px;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 0;
            min-height: auto;
          }
          .label-container { 
            margin: 0; 
            border: 2px solid #333;
            box-shadow: none;
          }
        }
        
        /* Responsive adjustments */
        @media screen and (max-width: 400px) {
          body {
            padding: 2mm;
          }
          .label-container {
            transform: scale(0.8);
            transform-origin: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="label-container">
        <!-- Ready flag -->
        <div class="ready-flag">พร้อมส่ง</div>
        
        <!-- Header Section -->
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
          <div class="company-name">${companyName}</div>
          <div class="label-title">📦 บัตรสมาชิกศิษย์เก่า</div>
        </div>
        
        <!-- Privacy Notice -->
        <div class="privacy-notice">
          🔒 ข้อมูลส่วนบุคคลได้รับการคุ้มครองตาม PDPA
        </div>
        
        <!-- Batch Information -->
        ${batchNumber ? `
          <div class="batch-info">
            <strong>Batch:</strong> ${batchNumber} | <strong>วันที่:</strong> ${formatDate(today)}
          </div>
        ` : ''}
        
        <!-- Recipient Information -->
        <div class="section">
          <div class="section-title">📍 ผู้รับ (Recipient)</div>
          <div class="recipient-info">
            <div class="recipient-name">${alumni.firstName} ${alumni.lastName}</div>
            <div class="graduation-badge">🎓 รุ่น ${alumni.graduationYear} • ${alumni.department}</div>
            <div class="recipient-details">
              <div style="margin-bottom: 1mm;"><strong>ที่อยู่จัดส่ง:</strong></div>
              <div class="address-box">${alumni.address}</div>
              <div class="content-item">
                <strong>📞 โทร:</strong>
                <span>${alumni.phone}</span>
              </div>
              <div class="content-item">
                <strong>🆔 รหัส:</strong>
                <span>${maskedIdCard}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tracking Number Placeholder -->
       <!-- <div class="section">
          <div class="section-title">📦 เลขติดตาม (Tracking)</div>
          <div class="tracking-section">
            <div class="tracking-placeholder">[ ช่องสำหรับเลขติดตาม ]</div>
            <div class="tracking-note">เจ้าหน้าที่จะกรอกหลังจัดส่ง</div>
          </div>
        </div>  -->
        
        <!-- Package Contents (Simplified & Secure) -->
        <div class="section">
          <div class="section-title">📋 เนื้อหาพัสดุ</div>
          <div class="package-contents">
            <div class="content-item">
              <strong>สินค้า:</strong>
              <span>บัตรสมาชิกศิษย์เก่า</span>
            </div>
            <div class="content-item">
              <strong>จำนวน:</strong>
              <span>1 ชุด</span>
            </div>
            <div class="content-item">
              <strong>สถานะ:</strong>
              <span style="color: #28a745; font-weight: 600;">พร้อมจัดส่ง</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-grid">
            <div class="company-contact">
              <div style="font-weight: 600; margin-bottom: 1mm;">${companyName}</div>
              <div>${companyAddress}</div>
              <div>📞 ${companyPhone}</div>
              <div>👤 ${coordinator} ${coordinatorPhone}</div>
            </div>
            <div class="qr-placeholder">
              QR<br>CODE
            </div>
          </div>
          <div style="text-align: center; margin-top: 1mm; font-size: 6px; color: #999;">
            Label ID: ${labelId} | วันที่สร้าง: ${formatDate(today)}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * 🚀 สร้าง HTML สำหรับหลาย labels (สำหรับ bulk printing)
 */
export const generateBulkShippingLabelsHTML = (alumniList, options = {}) => {
  const { batchNumber = `BATCH-${Date.now()}` } = options;
  
  const labelHTMLs = alumniList.map((alumni, index) => {
    return generateShippingLabelHTML(alumni, {
      ...options,
      batchNumber: `${batchNumber}-${String(index + 1).padStart(3, '0')}`
    });
  });
  
  // รวม HTML ทั้งหมดโดยแยก page breaks
  const combinedHTML = labelHTMLs.map(html => {
    // Extract only the label-container content
    const bodyMatch = html.match(/<body>(.*?)<\/body>/s);
    return bodyMatch ? bodyMatch[1] : html;
  }).join('<div style="page-break-before: always;"></div>\n');
  
  // สร้าง HTML หลักที่มี header และ styles
  const firstLabelHTML = labelHTMLs[0];
  const headMatch = firstLabelHTML.match(/<head>(.*?)<\/head>/s);
  const headContent = headMatch ? headMatch[1] : '';
  
  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      ${headContent}
      <style>
        .page-break { page-break-before: always; }
        @media print {
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      ${combinedHTML}
    </body>
    </html>
  `;
};

/**
 * 🚀 สร้าง shipping label พร้อม QR Code data (ถ้าต้องการ)
 */
export const generateLabelWithQRData = (alumni, options = {}) => {
  // ข้อมูลสำหรับ QR Code - ไม่รวมเลขบัตรประชาชน
  const qrData = {
    id: alumni._id,
    name: alumni.fullName,
    department: alumni.department,
    year: alumni.graduationYear,
    generated: new Date().toISOString()
  };
  
  const qrDataString = JSON.stringify(qrData);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrDataString)}`;
  
  // แทนที่ QR code section ใน HTML
  let html = generateShippingLabelHTML(alumni, options);
  html = html.replace(
    '<div class="qr-placeholder">',
    `<div class="qr-placeholder"><img src="${qrCodeUrl}" alt="QR Code" style="width: 12mm; height: 12mm;">`
  );
  
  return html;
};

/**
 * 🚀 สร้าง summary sheet สำหรับ batch shipping - PDPA Compliant
 */
export const generateShippingSummaryHTML = (alumniList, batchInfo = {}) => {
  const {
    batchNumber = `BATCH-${Date.now()}`,
    preparedBy = 'Admin',
    notes = ''
  } = batchInfo;
  
  const today = new Date();
  const totalItems = alumniList.length;
  const totalValue = alumniList.reduce((sum, alumni) => sum + alumni.totalAmount, 0);
  
  // แยกตามแผนกวิชา
  const byDepartment = alumniList.reduce((acc, alumni) => {
    acc[alumni.department] = (acc[alumni.department] || 0) + 1;
    return acc;
  }, {});
  
  // แยกตามปีที่สำเร็จการศึกษา
  const byYear = alumniList.reduce((acc, alumni) => {
    acc[alumni.graduationYear] = (acc[alumni.graduationYear] || 0) + 1;
    return acc;
  }, {});
  
  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shipping Summary - ${batchNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Prompt', sans-serif;
          margin: 20px;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #2c5aa0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #2c5aa0;
          margin-bottom: 10px;
        }
        
        .batch-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #28a745;
          margin-bottom: 30px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }
        
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 15px;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 5px;
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 5px 0;
          border-bottom: 1px dotted #ddd;
        }
        
        .alumni-list {
          margin-top: 30px;
        }
        
        .alumni-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 12px;
        }
        
        .alumni-table th,
        .alumni-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        .alumni-table th {
          background: #2c5aa0;
          color: white;
          font-weight: 600;
        }
        
        .alumni-table tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .total-row {
          background: #e8f4f8 !important;
          font-weight: 600;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #ddd;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        
        .signature-box {
          border: 1px solid #ddd;
          padding: 20px;
          text-align: center;
          border-radius: 4px;
        }
        
        .privacy-notice {
          background: #fff3cd;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
          margin-bottom: 20px;
          font-size: 12px;
          color: #856404;
        }
        
        @media print {
          body { margin: 0; }
          .summary-grid { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">📦 ใบสรุปการจัดส่งบัตรสมาชิกศิษย์เก่า</div>
        <div>สมาคมศิษย์เก่า วิทยาลัยการอาชีพอุดรธานี</div>
      </div>
      
      <!-- Privacy Notice -->
      <div class="privacy-notice">
        🔒 <strong>ข้อมูลความเป็นส่วนตัว:</strong> เอกสารนี้มีข้อมูลส่วนบุคคลที่ได้รับการคุ้มครองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) 
        กรุณาเก็บรักษาให้ปลอดภัยและไม่เปิดเผยแก่บุคคลที่สาม
      </div>
      
      <div class="batch-info">
        <h3 style="margin-top: 0; color: #28a745;">📋 ข้อมูล Batch</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <strong>Batch Number:</strong> ${batchNumber}<br>
            <strong>วันที่เตรียม:</strong> ${formatDate(today)}<br>
            <strong>ผู้เตรียม:</strong> ${preparedBy}
          </div>
          <div>
            <strong>จำนวนทั้งหมด:</strong> ${totalItems} รายการ<br>
            <strong>มูลค่ารวม:</strong> ฿${totalValue.toLocaleString()}<br>
            <strong>สถานะ:</strong> <span style="color: #dc3545; font-weight: 600;">พร้อมจัดส่ง</span>
          </div>
        </div>
        ${notes ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;"><strong>หมายเหตุ:</strong> ${notes}</div>` : ''}
      </div>
      
      <div class="summary-grid">
        <div class="summary-card">
          <div class="card-title">📊 สรุปตามแผนกวิชา</div>
          ${Object.entries(byDepartment).map(([dept, count]) => 
            `<div class="stat-item"><span>${dept}</span><span>${count} คน</span></div>`
          ).join('')}
        </div>
        
        <div class="summary-card">
          <div class="card-title">🎓 สรุปตามปีที่สำเร็จการศึกษา</div>
          ${Object.entries(byYear).sort(([a], [b]) => b - a).map(([year, count]) => 
            `<div class="stat-item"><span>รุ่น ${year}</span><span>${count} คน</span></div>`
          ).join('')}
        </div>
      </div>
      
      <div class="alumni-list">
        <h3 style="color: #2c5aa0;">📝 รายชื่อสมาชิกที่จัดส่ง</h3>
        <table class="alumni-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>ชื่อ-นามสกุล</th>
              <th>แผนกวิชา</th>
              <th style="width: 60px;">รุ่น</th>
              <th>เบอร์โทร</th>
              <th>ที่อยู่</th>
              <th style="width: 80px;">มูลค่า</th>
            </tr>
          </thead>
          <tbody>
            ${alumniList.map((alumni, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${alumni.firstName} ${alumni.lastName}</strong></td>
                <td>${alumni.department}</td>
                <td>${alumni.graduationYear}</td>
                <td>${alumni.phone}</td>
                <td>${alumni.address.length > 50 ? alumni.address.substring(0, 50) + '...' : alumni.address}</td>
                <td>฿${alumni.totalAmount}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="6"><strong>รวมทั้งหมด</strong></td>
              <td><strong>฿${totalValue.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <div class="signature-box">
          <div style="margin-bottom: 40px;"><strong>ผู้เตรียม</strong></div>
          <div style="border-top: 1px solid #333; padding-top: 5px;">
            ${preparedBy}<br>
            วันที่: ${formatDate(today)}
          </div>
        </div>
        <div class="signature-box">
          <div style="margin-bottom: 40px;"><strong>ผู้ตรวจสอบ</strong></div>
          <div style="border-top: 1px solid #333; padding-top: 5px;">
            ลายเซ็น: ________________<br>
            วันที่: ________________
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default {
  generateShippingLabelHTML,
  generateBulkShippingLabelsHTML,
  generateLabelWithQRData,
  generateShippingSummaryHTML
};