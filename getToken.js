import readline from "readline";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// สร้าง readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getAccessToken = async () => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent", // บังคับให้ขอ refresh_token เสมอ
    });

    console.log("\n🔗 ไปที่ลิงก์นี้เพื่อรับโค้ดยืนยัน:");
    console.log(authUrl);

    rl.question("\n📌 กรุณาใส่โค้ดที่ได้รับจากลิงก์: ", async (code) => {
      try {
        const { tokens } = await oauth2Client.getToken(code);

        console.log("\n✅ ได้รับ Token สำเร็จ!");
        console.log("🔑 Access Token:", tokens.access_token);
        console.log("🔄 Refresh Token:", tokens.refresh_token || "ไม่มี (อาจเป็นเพราะไม่ได้เลือก 'offline' หรือเคยให้สิทธิ์แล้ว)");

        console.log("\n📌 เพิ่มค่าเหล่านี้ลงในไฟล์ .env เพื่อใช้งานต่อไป:");
        console.log(`OAUTH_ACCESS_TOKEN=${tokens.access_token}`);
        console.log(`OAUTH_REFRESH_TOKEN=${tokens.refresh_token || ""}`);

      } catch (error) {
        console.error("\n❌ เกิดข้อผิดพลาดในการรับ Access Token:", error.response?.data || error.message);
      }
      rl.close();
    });

  } catch (error) {
    console.error("\n❌ ไม่สามารถสร้างลิงก์ยืนยัน:", error.message);
    rl.close();
  }
};

getAccessToken();
