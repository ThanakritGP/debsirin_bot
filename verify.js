import { google } from 'googleapis';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library'; // นำเข้า OAuth2Client
dotenv.config();

// สร้างตัวแปร OAuth2Client สำหรับยืนยันตัวตน
const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// ฟังก์ชันตรวจสอบหมายเลขประจำตัวนักเรียน
export const verifyStudentID = async (studentID) => {
  // ใช้ OAuth 2.0 token สำหรับการเชื่อมต่อกับ Google Sheets API
  const apiKey = process.env.GOOGLE_API_KEY;  // อาจจะยังต้องการ API key สำหรับการเข้าถึงบางฟังก์ชัน
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  try {
    // ตรวจสอบว่า oauth2Client มี token แล้วหรือไม่
    const tokens = oauth2Client.credentials;
    if (!tokens.access_token) {
      throw new Error('Missing OAuth2 access token');
    }

    // ดึงข้อมูลของทุกชีตใน Spreadsheet
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetNames = sheetMetadata.data.sheets.map(sheet => sheet.properties.title); // ดึงชื่อทุกชีตในไฟล์

    // ค้นหาหมายเลขนักเรียนในทุกชีต
    for (const sheetName of sheetNames) {
      const range = `${sheetName}!A:D`;  // ค้นหาช่วงข้อมูลในแต่ละชีต (คอลัมน์ A ถึง D)
      
      // ดึงข้อมูลจาก Google Sheets ของแต่ละชีต
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;

      // ค้นหาหมายเลขนักเรียนในคอลัมน์ที่ 4 (คอลัมน์ D)
      for (const row of rows) {
        if (row[3] === studentID) {
          return `เลขประจำตัว ${studentID} มีในระบบ และยืนยันตัวตนเรียบร้อย`;
        }
      }
    }

    return 'ไม่พบเลขประจำตัวในระบบ';
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    return 'ไม่สามารถตรวจสอบหมายเลขประจำตัวได้';
  }
};
