import { google } from "googleapis";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library"; // ใช้งาน OAuth2Client

dotenv.config();

// ตั้งค่า OAuth2 Client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID, // ใช้ CLIENT_ID ของ Google
  process.env.GOOGLE_CLIENT_SECRET, // ใช้ CLIENT_SECRET ของ Google
  process.env.REDIRECT_URI // URL redirect ที่ได้ตั้งใน Google Cloud Console
);

// ตั้งค่า Credentials ด้วย Refresh Token
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

// ฟังก์ชันอัปเดต Access Token อัตโนมัติ
const getAccessToken = async () => {
  try {
    const { token } = await oauth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};

// ฟังก์ชันตรวจสอบหมายเลขประจำตัวนักเรียน
export const verifyStudentID = async (studentID) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return "ไม่สามารถรับ Access Token ได้";
    }

    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // ดึงข้อมูลของทุกชีตใน Spreadsheet
    const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetNames = sheetMetadata.data.sheets.map(
      (sheet) => sheet.properties.title
    );

    // ค้นหาหมายเลขนักเรียนในทุกชีต
    for (const sheetName of sheetNames) {
      const range = `${sheetName}!A:D`; // ค้นหาในคอลัมน์ A ถึง D
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values || [];

      // ค้นหาหมายเลขนักเรียนในคอลัมน์ที่ 4 (D)
      for (const row of rows) {
        if (row.length >= 4 && row[3] === studentID) {
          return {
            found: true,
            message: `เลขประจำตัว ${studentID} มีในระบบ และยืนยันตัวตนเรียบร้อย`,
          };
        }
      }
    }

    return {
      found: false,
      message: "ไม่พบเลขประจำตัวในระบบ",
    };
  } catch (error) {
    console.error("Error accessing Google Sheets:", error);
    return {
      found: false,
      message: "ไม่สามารถตรวจสอบหมายเลขประจำตัวได้",
    };
  }
};
