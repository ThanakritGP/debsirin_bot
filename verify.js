import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

// ฟังก์ชันตรวจสอบหมายเลขประจำตัวนักเรียน
export const verifyStudentID = async (studentID) => {
  // เชื่อมต่อกับ Google Sheets API
  const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });

  // ตั้งค่า Spreadsheet ID และ Range ที่จะค้นหา
  const spreadsheetId = 'your_spreadsheet_id';
  const range = 'Sheet1!A:D';  // กำหนดช่วงข้อมูลที่ต้องการค้นหา

  try {
    // ดึงข้อมูลจาก Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    // ค้นหาหมายเลขนักเรียนในคอลัมน์ที่ 4
    for (const row of rows) {
      if (row[3] === studentID) {
        return `เลขประจำตัว ${studentID} มีในระบบ และยืนยันตัวตนเรียบร้อย`;
      }
    }

    return 'ไม่พบเลขประจำตัวในระบบ';
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    return 'ไม่สามารถตรวจสอบหมายเลขประจำตัวได้';
  }
};
