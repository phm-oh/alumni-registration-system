// Path: src/utils/minimalShippingLabel.js
// ไฟล์: minimalShippingLabel.js - เวอร์ชันสมบูรณ์แก้ไขแล้ว

import { formatDate, generateReferenceCode } from './helpers.js';

/**
 * 🚀 สร้าง Minimal Shipping Label - เวอร์ชันสมบูรณ์
 * ขนาด A6 (105mm x 148mm) พร้อมเส้นตัด
 * ✅ ชื่อองค์กรถูกต้อง: ชมรมศิษย์เก่าวิทยาลัยอาชีวศึกษาอุดรธานี
 * ✅ ไม่มี QR Code
 * ✅ เฉพาะ ผู้ส่ง → ผู้รับ
 * ✅ มีเส้นขอบสำหรับตัด
 */
export const generateMinimalShippingLabelHTML = (alumni, options = {}) => {
  const {
    companyName = 'ชมรมศิษย์เก่าวิทยาลัยอาชีวศึกษาอุดรธานี',
    companyAddress = 'เลขที่ 8 วิทยาลัยอาชีวศึกษาอุดรธานี ถนนโพธิศรี ตำบลหมากแข้ง อำเภอเมือง จังหวัดอุดรธานี 41000',
    companyPhone = '042-224-6690',
    coordinator = 'น.ส.ชุติภัทร ชวาลไชย',
    coordinatorPhone = '088-931-7849'
  } = options;

  const today = new Date();
  const labelId = generateReferenceCode('LBL');
  
  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shipping Label - ${alumni.fullName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Prompt', sans-serif;
          background: #f0f0f0;
          padding: 15mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
        }
        
        .print-controls {
          margin-bottom: 15mm;
          text-align: center;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .print-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-family: 'Prompt', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
          transition: all 0.2s;
        }
        
        .print-btn:hover {
          background: #218838;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
        }
        
        .page-container {
          width: 210mm;
          height: 297mm;
          background: white;
          padding: 15mm;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        
        /* เส้นขอบสำหรับตัด A6 */
        .cut-guidelines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .cut-line {
          position: absolute;
          border: 1px dashed #999;
        }
        
        .cut-line.horizontal {
          left: 15mm;
          right: 15mm;
          height: 0;
        }
        
        .cut-line.vertical {
          top: 15mm;
          bottom: 15mm;
          width: 0;
        }
        
        .cut-line.top { top: 74.5mm; }
        .cut-line.bottom { bottom: 74.5mm; }
        .cut-line.left { left: 52.5mm; }
        .cut-line.right { right: 52.5mm; }
        
        .label-container {
          width: 105mm;
          height: 148mm;
          background: white;
          border: 2px solid #333;
          padding: 6mm;
          font-size: 12px;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 3mm;
          margin-bottom: 4mm;
        }
        
        .company-name {
          font-size: 11px;
          font-weight: 700;
          color: #2c5aa0;
          margin-bottom: 2mm;
          line-height: 1.3;
        }
        
        .label-title {
          font-size: 10px;
          font-weight: 600;
          color: #d32f2f;
        }
        
        .pdpa-notice {
          background: #fff3cd;
          padding: 2mm;
          border-radius: 3mm;
          font-size: 8px;
          color: #856404;
          text-align: center;
          border: 1px solid #ffeaa7;
          margin-bottom: 4mm;
        }
        
        .from-section {
          background: #e3f2fd;
          padding: 4mm;
          border-radius: 3mm;
          margin-bottom: 5mm;
          border-left: 3px solid #2196f3;
        }
        
        .section-title {
          font-size: 10px;
          font-weight: 700;
          color: #1976d2;
          margin-bottom: 3mm;
          text-transform: uppercase;
        }
        
        .company-info {
          font-size: 10px;
          line-height: 1.4;
          color: #333;
        }
        
        .to-section {
          background: #e8f5e8;
          padding: 4mm;
          border-radius: 3mm;
          margin-bottom: 5mm;
          border-left: 3px solid #4caf50;
          flex: 1;
        }
        
        .to-title {
          font-size: 10px;
          font-weight: 700;
          color: #2e7d32;
          margin-bottom: 3mm;
          text-transform: uppercase;
        }
        
        .recipient-name {
          font-size: 16px;
          font-weight: 700;
          color: #333;
          margin-bottom: 3mm;
        }
        
        .graduation-info {
          font-size: 10px;
          color: #666;
          background: #f0f0f0;
          padding: 2mm 3mm;
          border-radius: 3mm;
          display: inline-block;
          margin-bottom: 3mm;
        }
        
        .address-box {
          background: white;
          border: 1px solid #ccc;
          padding: 3mm;
          border-radius: 3mm;
          min-height: 25mm;
          margin-bottom: 3mm;
          font-size: 11px;
          line-height: 1.4;
        }
        
        .contact-info {
          font-size: 11px;
          color: #666;
        }
        

        
        .footer {
          position: absolute;
          bottom: 6mm;
          left: 6mm;
          right: 6mm;
          text-align: center;
          font-size: 8px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 3mm;
        }
        
        /* Print Styles */
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .print-controls {
            display: none;
          }
          
          .page-container {
            box-shadow: none;
            margin: 0;
            width: 210mm;
            height: 297mm;
          }
          
          .cut-guidelines {
            display: block;
          }
        }
        
        /* Responsive */
        @media screen and (max-width: 800px) {
          body {
            padding: 5mm;
          }
          
          .page-container {
            transform: scale(0.7);
            transform-origin: top center;
          }
        }
      </style>
    </head>
    <body>
      <!-- Print Controls -->
      <div class="print-controls">
        <button class="print-btn" onclick="window.print()">🖨️ ปริ้น Label</button>
        <div style="margin-top: 8px; font-size: 14px; color: #666;">
          ขนาด A6 (105×148mm) • ปริ้นแล้วตัดตามเส้นประ
        </div>
      </div>
      
      <!-- A4 Page with A6 Label -->
      <div class="page-container">
        <!-- Cut Guidelines -->
        <div class="cut-guidelines">
          <div class="cut-line horizontal top"></div>
          <div class="cut-line horizontal bottom"></div>
          <div class="cut-line vertical left"></div>
          <div class="cut-line vertical right"></div>
        </div>
        
        <!-- A6 Shipping Label -->
        <div class="label-container">
          <!-- Header -->
          <div class="header">
            <div class="company-name">${companyName}</div>
            <div class="label-title">📦 ของที่ระลึก</div>
          </div>
          
        
          
          <!-- From Section -->
          <div class="from-section">
            <div class="section-title">📤 ผู้ส่ง (FROM)</div>
            <div class="company-info">
              <strong>${companyName}</strong><br>
              ${companyAddress}<br>
              📞 ${companyPhone}<br>
              👤 ${coordinator} ${coordinatorPhone}
            </div>
          </div>
          
          <!-- To Section -->
          <div class="to-section">
            <div class="to-title">📥 ผู้รับ (TO)</div>
            <div class="recipient-name">${alumni.firstName} ${alumni.lastName}</div>
            <div class="graduation-info">🎓 รุ่น ${alumni.graduationYear} • ${alumni.department}</div>
            <div style="margin-bottom: 1mm; font-size: 8px; font-weight: 600;">ที่อยู่จัดส่ง:</div>
            <div class="address-box">${alumni.address}</div>
            <div class="contact-info">📞 ${alumni.phone}</div>
          </div>
          

          
          <!-- Footer -->
          <div class="footer">
            Label ID: ${labelId} | วันที่: ${formatDate(today)}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * 🚀 สร้าง 4 Labels ใน A4 เดียว - แนวนอน (Landscape)
 * กระดาษวางแนวนอน, เนื้อหาแนวตั้ง, มีเส้นขอบชัดเจน
 */
export const generate4UpShippingLabelsHTML = (alumniList, options = {}) => {
  // ถ้ามีมากกว่า 4 คน เอาแค่ 4 คนแรก
  const limitedList = alumniList.slice(0, 4);
  
  // เติมให้ครบ 4 ช่อง (ถ้าไม่ครบ)
  while (limitedList.length < 4) {
    limitedList.push(null);
  }
  
  const {
    companyName = 'ชมรมศิษย์เก่าวิทยาลัยอาชีวศึกษาอุดรธานี',
    companyAddress = 'เลขที่ 8 วิทยาลัยอาชีวศึกษาอุดรธานี ถนนโพธิศรี ตำบลหมากแข้ง อำเภอเมือง จังหวัดอุดรธานี 41000',
    companyPhone = '042-224-6690',
    coordinator = 'น.ส.ชุติภัทร ชวาลไชย',
    coordinatorPhone = '088-931-7849'
  } = options;

  const today = new Date();
  
  // สร้าง HTML สำหรับแต่ละ label
  const createSingleLabel = (alumni, index) => {
    if (!alumni) {
      return `
        <div class="label-slot">
          <div class="empty-label">
            <div style="font-size: 14px; color: #999;">ช่องว่าง</div>
            <div style="font-size: 10px; color: #ccc;">สำหรับตัดทิ้ง</div>
          </div>
        </div>
      `;
    }
    
    const labelId = generateReferenceCode('LBL');
    
    return `
      <div class="label-slot">
        <div class="mini-label">
          <!-- Header -->
          <div class="mini-header">
            <div class="mini-company">${companyName}</div>
            <div class="mini-title">📦 ของที่ระลึก</div>
          </div>
          
         
          
          <!-- From (Compact) -->
          <div class="mini-from">
            <div class="mini-section-title">📤 ผู้ส่ง:</div>
            <div class="mini-company-name">${companyName}</div>
            <div class="mini-contact">📞 ${companyPhone}</div>
            <div class="mini-coordinator">👤 ${coordinator}</div>
          </div>
          
          <!-- To -->
          <div class="mini-to">
            <div class="mini-section-title">📥 ผู้รับ:</div>
            <div class="mini-name">${alumni.firstName} ${alumni.lastName}</div>
            <div class="mini-grad">🎓 รุ่น ${alumni.graduationYear} • ${alumni.department}</div>
            <div class="mini-address-label">ที่อยู่จัดส่ง:</div>
            <div class="mini-address">${alumni.address}</div>
            <div class="mini-phone">📞 ${alumni.phone}</div>
          </div>
          
          <!-- Footer -->
          <div class="mini-footer">
            ${labelId} | ${formatDate(today)}
          </div>
        </div>
      </div>
    `;
  };
  
  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>4-Up Shipping Labels</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Prompt', sans-serif;
          background: #f0f0f0;
          padding: 10mm;
        }
        
        .print-controls {
          text-align: center;
          margin-bottom: 10mm;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .print-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-family: 'Prompt', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
          transition: all 0.2s;
        }
        
        .print-btn:hover {
          background: #218838;
          transform: translateY(-1px);
        }
        
        .page-container {
          width: 297mm;  /* A4 แนวนอน */
          height: 210mm;
          background: white;
          margin: 0 auto;
          padding: 10mm;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          position: relative;
        }
        
        .labels-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8mm;
          width: 100%;
          height: 100%;
        }
        
        .label-slot {
          border: 2px dashed #999;
          background: #fafafa;
          border-radius: 3mm;
          position: relative;
        }
        
        .label-slot::before {
          content: '✂️ ตัดตามเส้นนี้';
          position: absolute;
          top: -6mm;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: #666;
          background: white;
          padding: 1mm 2mm;
          border-radius: 2mm;
        }
        
        .mini-label {
          width: 100%;
          height: 100%;
          border: 2px solid #333;
          padding: 4mm;
          font-size: 9px;
          line-height: 1.3;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 2mm;
        }
        
        .empty-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #999;
          background: #f8f8f8;
          border-radius: 2mm;
        }
        
        .mini-header {
          text-align: center;
          border-bottom: 1px solid #333;
          padding-bottom: 2mm;
          margin-bottom: 2mm;
        }
        
        .mini-company {
          font-size: 8px;
          font-weight: 700;
          color: #2c5aa0;
          line-height: 1.2;
        }
        
        .mini-title {
          font-size: 7px;
          font-weight: 600;
          color: #d32f2f;
          margin-top: 1mm;
        }
        
        .mini-pdpa {
          background: #fff3cd;
          padding: 1.5mm;
          border-radius: 1mm;
          font-size: 6px;
          color: #856404;
          text-align: center;
          margin-bottom: 2mm;
        }
        
        .mini-from {
          background: #e3f2fd;
          padding: 2mm;
          border-radius: 1mm;
          margin-bottom: 2mm;
          font-size: 7px;
          border-left: 2px solid #2196f3;
        }
        
        .mini-to {
          background: #e8f5e8;
          padding: 2mm;
          border-radius: 1mm;
          margin-bottom: 2mm;
          flex: 1;
          border-left: 2px solid #4caf50;
        }
        
        .mini-section-title {
          font-weight: 700;
          margin-bottom: 1.5mm;
          font-size: 7px;
          text-transform: uppercase;
        }
        
        .mini-company-name {
          font-weight: 600;
          font-size: 7px;
          line-height: 1.2;
          margin-bottom: 1mm;
        }
        
        .mini-contact, .mini-coordinator {
          font-size: 6px;
          color: #666;
          margin-bottom: 0.5mm;
        }
        
        .mini-name {
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 1.5mm;
          color: #333;
        }
        
        .mini-grad {
          font-size: 6px;
          color: #666;
          background: #f0f0f0;
          padding: 1mm 1.5mm;
          border-radius: 1mm;
          display: inline-block;
          margin-bottom: 1.5mm;
        }
        
        .mini-address-label {
          font-size: 6px;
          font-weight: 600;
          margin-bottom: 1mm;
        }
        
        .mini-address {
          font-size: 8px;
          line-height: 1.3;
          margin-bottom: 1.5mm;
          background: white;
          padding: 1.5mm;
          border-radius: 1mm;
          border: 1px solid #ddd;
          min-height: 12mm;
        }
        
        .mini-phone {
          font-size: 7px;
          color: #666;
        }
        
        .mini-footer {
          font-size: 6px;
          color: #666;
          text-align: center;
          border-top: 1px solid #ddd;
          padding-top: 1.5mm;
        }
        
        /* Print Styles */
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .print-controls {
            display: none;
          }
          
          .page-container {
            box-shadow: none;
            margin: 0;
          }
          
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      </style>
    </head>
    <body>
      <!-- Print Controls -->
      <div class="print-controls">
        <button class="print-btn" onclick="window.print()">🖨️ ปริ้น 4 Labels (A4 แนวนอน)</button>
        <div style="margin-top: 8px; font-size: 14px; color: #666;">
          กระดาษวางแนวนอน • ปริ้นแล้วตัดตามเส้นประเป็น 4 ชิ้น
        </div>
      </div>
      
      <!-- A4 Landscape Page with 4 Labels -->
      <div class="page-container">
        <div class="labels-grid">
          ${limitedList.map((alumni, index) => createSingleLabel(alumni, index)).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
};

export default {
  generateMinimalShippingLabelHTML,
  generate4UpShippingLabelsHTML
};