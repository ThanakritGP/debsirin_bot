// ในไฟล์ code.gs:

// ===================================================
// GLOBAL CONSTANTS & IDENTIFIERS
// ===================================================

const VERIFY_SHEET_NAME = "verify"; 
const TEMPLATE_SHEET_IDENTIFIER = "TEMPLATE"; 

const ADMIN_USERS_SHEET = "admin_users"; 
const TOKEN_SECRET = "DSSC68_01";
const SPREADSHEET_ID = "1XlfEN7lHfuCVJYRL7HMSEH98AkQmUutBD7DSphmLTWw";
// หมายเหตุ: ตัวแปร ALL_STUDENT_SHEET_NAMES ถูกลบออกแล้ว ตามคำขอให้วนลูปหาทุกชีต

// ===================================================
// CLIENT FUNCTIONS (FRONTEND)
// ===================================================

function revokeAdminToken(token) {
  if (!token) return;

  const SCRIPT_PROPS = PropertiesService.getScriptProperties();
  SCRIPT_PROPS.deleteProperty(`admin_token_${token}`);
}

function doGet() {
  return HtmlService.createTemplateFromFile('index') // Serve the main shell
    .evaluate()
    .setTitle("ยืนยันตัวตน DS COMMUNITY DISCORD")
    .setFaviconUrl("https://raw.githubusercontent.com/ThanakritGP/images/refs/heads/main/DCAS_LOGO_DEBSIRIN_COMMUNITY_DISCORD_LOGO_TU.png")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getMainContent() {
  return HtmlService.createHtmlOutputFromFile('main_content').getContent();
}

function getHowToContent() {
  return HtmlService.createHtmlOutputFromFile('how_to').getContent();
}

function submitData(studentIdFromClient) {
  const studentId = String(studentIdFromClient).trim();
  const spreadsheetId = SPREADSHEET_ID; 

  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const verifySheet = ss.getSheetByName(VERIFY_SHEET_NAME);

    // 1. ตรวจสอบในชีต "verify" ก่อน
    if (verifySheet) {
      const verifyData = verifySheet.getDataRange().getValues();
      for (let i = 1; i < verifyData.length; i++) {
        if (verifyData[i][1] && String(verifyData[i][1]).trim() === studentId) { 
          return {
            status: "verified",
            message: "คุณได้ยืนยันตัวตนเรียบร้อยแล้ว",
            action: "คุณสามารถเข้าใช้งาน Debsirin Community Discord🔰",
            id: studentId
          };
        }
      }
    } else {
      Logger.log("Warning: ไม่พบชีต 'verify'");
    }

    // 2. ค้นหาข้อมูลนักเรียนในชีตอื่นๆ ทั้งหมด
    const allSheets = ss.getSheets();
    let studentFound = false;
    let studentInfo = {};

    const DATA_ID_COL = 3; 
    const DATA_CLASS_LEVEL_COL = 0;
    const DATA_ROOM_COL = 1; 
    const DATA_FULL_NAME_COL = 4;

    for (const currentSheet of allSheets) {
      const currentSheetName = currentSheet.getName();

      if (currentSheetName === VERIFY_SHEET_NAME) continue; 

      const sheetData = currentSheet.getDataRange().getValues();
      
      // การวนลูป: ถ้าชีตมีหัวตาราง ควรเริ่มที่ j=1 แต่โค้ดเดิมใช้ j=0 เราจะคง j=0 เพื่อให้ทำงานได้ถ้าข้อมูลไม่มีหัวตาราง
      for (let j = 0; j < sheetData.length; j++) {
        const row = sheetData[j];
        if (row[DATA_ID_COL] && String(row[DATA_ID_COL]).trim() === studentId) {
          studentFound = true;
          studentInfo = {
            id: String(row[DATA_ID_COL]).trim(),
            fullName: (row[DATA_FULL_NAME_COL] || "").toString().trim(),
            classLevel: (row[DATA_CLASS_LEVEL_COL] || "").toString().trim(), 
            room: (row[DATA_ROOM_COL] || "").toString().trim()
          };
          break; 
        }
      }
      if (studentFound) break; 
    }

    // 3. คืนค่าผลลัพธ์
    if (studentFound) {
      let tableHtml = `
        <table>
          <tr><th colspan=2>ข้อมูลนักเรียน</th></tr>
          <tr><td>เลขประจำตัว:</td><td>${studentInfo.id}</td></tr>
          <tr><td>ชื่อ-สกุล:</td><td>${studentInfo.fullName}</td></tr>
          <tr><td>ชั้น:</td><td>ม.${studentInfo.classLevel}</td></tr>
          <tr><td>ห้อง:</td><td>${studentInfo.room}</td></tr>
        </table>`;
      return { 
        status: "found_not_verified", 
        message: "พบข้อมูลในระบบ", 
        action: "กรุณาตรวจสอบข้อมูลแล้วทำการยืนยันตัวตน", 
        data: tableHtml,
        id: studentInfo.id,
        fullName: studentInfo.fullName,
        classLevel: studentInfo.classLevel,
        room: studentInfo.room 
      };
    } else {
      return { 
        status: "not_found", 
        message: "ไม่พบข้อมูลในระบบ", 
        action: "โปรดตรวจสอบเลขประจำตัวอีกครั้ง หรือติดต่อ STAFF" 
      };
    }

  } catch (e) {
    Logger.log("Error in submitData: " + e.message + " Stack: " + e.stack);
    return { status: "error", message: "เกิดข้อผิดพลาดในการค้นหาข้อมูล", action: "Server error: " + e.message };
  }
}


function logVerification(studentId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(VERIFY_SHEET_NAME);
    if (!sheet) throw new Error("Sheet '" + VERIFY_SHEET_NAME + "' not found.");
    sheet.appendRow([new Date(), studentId]);
    return { status: "success", message: "Verification logged."};
  } catch (e) {
    Logger.log("Error in logVerification: " + e.toString());
    return { status: "error", message: "Failed to log verification: " + e.toString()};
  }
}

function sendToDiscord(studentId, fullName, classLevel, room) {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty('DISCORD_WEBHOOK_URL');
  if (!webhookUrl) {
    Logger.log("Discord webhook URL is not configured in Script Properties.");
    return { status: "error", message: "Discord webhook not configured." };
  }
  
  const message = `✅ **ยืนยันตัวตนสำเร็จ**\n` +
                  `เลขประจำตัว: \`${studentId}\`\n` +
                  `ชื่อ-สกุล: ${fullName}\n` +
                  `ชั้น: ${classLevel}/${room}\n` +
                  `เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;
  const payload = { content: message };
  const options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload) };

  try {
    UrlFetchApp.fetch(webhookUrl, options);
    return { status: "success", message: "Sent to Discord." };
  } catch (e) {
    Logger.log("Error sending to Discord: " + e.toString());
    return { status: "error", message: "Failed to send to Discord: " + e.toString() };
  }
}

// ===================================================
// ADMIN FUNCTIONS (BACKEND)
// ===================================================

/**
 * ฟังก์ชันสำหรับโหลดเนื้อหาของหน้า Admin Dashboard (Content)
 */
function getAdminContent() {
  return HtmlService.createHtmlOutputFromFile('admin_content').getContent(); 
}

/**
 * Helper function สำหรับสร้างตารางแสดงผลการค้นหาข้อมูลนักเรียน (5 คอลัมน์)
 * *สำคัญ: ฟังก์ชันนี้ถูกใช้โดย searchStudentData()
 */
function createSearchDataTable(data, headers, isVerified) {
    if (!data || data.length === 0) {
        return '<div class="alert alert-info text-center">ไม่พบข้อมูลนักเรียน</div>';
    }
    
    const verifyStatus = isVerified ? 
        '<span class="badge bg-success">✅ ยืนยันแล้ว</span>' : 
        '<span class="badge bg-warning text-dark">❌ ยังไม่ยืนยัน</span>';

    let html = `
    <h6 class="mb-3">สถานะ: ${verifyStatus}</h6>
    <div class="table-responsive">
    <table class="table table-bordered table-striped table-hover text-start">
    <thead class="table-info"><tr>`;
    
    headers.forEach(header => { html += `<th>${header}</th>`; });
    html += '</tr></thead><tbody>';
    
    // Data Rows (จะมีแค่แถวเดียว)
    data.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${cell || ''}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    return html;
}

function getAdminMetrics() {
    const spreadsheetId = SPREADSHEET_ID;
    let totalStudents = 0;
    let verifiedStudents = 0;

    // แถวเริ่มต้นของข้อมูลนักเรียนจริง (แถวที่ 6 = Index 5)
    const DATA_START_ROW = 6; 

    try {
        const ss = SpreadsheetApp.openById(spreadsheetId);
        const allSheets = ss.getSheets();
        
        // 1. นับจำนวนนักเรียนทั้งหมด (จากทุกชีตย่อย)
        for (const studentSheet of allSheets) {
            const sheetName = studentSheet.getName();

            // ข้ามชีตที่ไม่ต้องการนับ (verify หรือ template)
            if (sheetName === VERIFY_SHEET_NAME || sheetName.toUpperCase().includes(TEMPLATE_SHEET_IDENTIFIER)) {
                continue;
            }
            
            const lastRow = studentSheet.getLastRow();
            
            // คำนวณจำนวนแถวข้อมูล: (แถวสุดท้าย) - (แถวก่อนเริ่มข้อมูล)
            if (lastRow >= DATA_START_ROW) {
                totalStudents += lastRow - DATA_START_ROW + 1;
            }
        }

        // 2. นับจำนวนนักเรียนที่ยืนยันตัวตนแล้ว (จากชีต verify)
        // เนื่องจากชีต verify มีแค่ Date และ Student ID มักจะมีหัวตารางแค่ 1 แถว (หรือไม่มี)
        // เราจะคง logic เดิม: getLastRow() - 1
        const verifySheet = ss.getSheetByName(VERIFY_SHEET_NAME);
        if (verifySheet && verifySheet.getLastRow() > 1) {
            verifiedStudents = verifySheet.getLastRow() - 1;
        }

        return {
            total: totalStudents,
            verified: verifiedStudents,
            unverified: totalStudents - verifiedStudents
        };
    } catch (e) {
        Logger.log("Error fetching metrics: " + e.message);
        return { total: 'N/A', verified: 'N/A', unverified: 'N/A' };
    }
}

/**
 * 1. ตรวจสอบสิทธิ์ผู้ดูแลระบบจากชีต admin_users
 */
function checkAdminCredentials(username, password) {
  const spreadsheetId = SPREADSHEET_ID; 
  const SCRIPT_PROPS = PropertiesService.getScriptProperties();

  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(ADMIN_USERS_SHEET);

    if (!sheet) {
      Logger.log(`Sheet not found: ${ADMIN_USERS_SHEET}`);
      return { success: false, message: "Server error: Admin configuration missing." };
    }

    const data = sheet.getDataRange().getValues();

    // Col Index: 0=Username, 1=Password, 2=Name
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (
        row[0] && String(row[0]).trim() === username &&
        row[1] && String(row[1]).trim() === password
      ) {
        const adminName = row[2] ? String(row[2]).trim() : "ผู้ดูแลระบบ";

        // ⭐ START: การสร้าง Token ที่มีวันหมดอายุ 7 วัน ⭐
        const token = Utilities.getUuid(); // สร้าง Token แบบสุ่ม (UUID)
        
        // กำหนดวันหมดอายุ: 7 วัน (7 * 24 * 60 * 60 * 1000 มิลลิวินาที)
        const EXPIRY_TIME = Date.now() + (7 * 24 * 60 * 60 * 1000); 
        
        // บันทึก Key: admin_token_UUID, Value: username|expiry_timestamp
        SCRIPT_PROPS.setProperty(
          `admin_token_${token}`, 
          `${username}|${EXPIRY_TIME}` 
        );
        // ⭐ END: การสร้าง Token ที่มีวันหมดอายุ 7 วัน ⭐

        return {
          success: true,
          name: adminName,
          token: token
        };
      }
    }

    return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };

  } catch (e) {
    Logger.log("Error in checkAdminCredentials: " + e.message);
    return { success: false, message: "เกิดข้อผิดพลาดของ Server: " + e.message };
  }
}

function getAdminPage() {
  const spreadsheetId = SPREADSHEET_ID;
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const allSheets = ss.getSheets();
  
  const studentSheetNames = allSheets
      .map(sheet => sheet.getName())
      .filter(name => name !== VERIFY_SHEET_NAME && !name.toUpperCase().includes(TEMPLATE_SHEET_IDENTIFIER));
  
  const template = HtmlService.createTemplateFromFile('admin_page');
  
  // *** ส่งรายชื่อชีตทั้งหมด (Student Sheet Names) เข้าไปใน HTML ***
  template.ALL_STUDENT_SHEET_NAMES_JSON = JSON.stringify(studentSheetNames);
  
  return template.evaluate().getContent();
}

// ===================================================
// NEW ADMIN FUNCTION: GET ALL STUDENTS DATA
// ===================================================

/**
 * ดึงข้อมูลนักเรียนทั้งหมดจากทุกชีต (แก้ไขให้เริ่มอ่านจากแถวที่ 6)
 */
function getAllStudentData() {
    const spreadsheetId = SPREADSHEET_ID;
    let allStudentData = [];
    
    // Index ในชีตย่อย (A, B, C, D, E) - คงค่าเดิมตามโครงสร้างข้อมูล
    const D_CLASS_LEVEL = 0; 
    const D_ROOM = 1;         
    const D_STUDENT_NO = 2; 
    const D_ID = 3;             
    const D_FULL_NAME = 4; 
    
    // หัวตารางสำหรับ DataTables
    const HEADERS = ["ชั้น", "ห้อง", "เลขที่", "เลขประจำตัว", "ชื่อ-นามสกุล", "สถานะยืนยัน"];
    
    let verifiedIds = new Set();
    
    // แถวเริ่มต้นของข้อมูลนักเรียนจริง (แถวที่ 6)
    const DATA_START_ROW = 6; 

    try {
        const ss = SpreadsheetApp.openById(spreadsheetId);
        
        // 1. ดึง ID นักเรียนที่ยืนยันแล้ว (เหมือนเดิม)
        const verifySheet = ss.getSheetByName(VERIFY_SHEET_NAME);
        if (verifySheet && verifySheet.getLastRow() > 1) {
            const verifyData = verifySheet.getRange(2, 2, verifySheet.getLastRow() - 1, 1).getValues(); // ดึงเฉพาะคอลัมน์ B (ID) เริ่มจากแถว 2
            verifyData.flat().forEach(id => {
                 if (id) verifiedIds.add(String(id).trim());
            });
        }
        
        // 2. วนลูปอ่านข้อมูลนักเรียนจากทุกชีตย่อย
        const allSheets = ss.getSheets();
        for (const currentSheet of allSheets) {
            const sheetName = currentSheet.getName();

            // ข้ามชีตที่ไม่ต้องการ
            if (sheetName === VERIFY_SHEET_NAME || 
                sheetName === ADMIN_USERS_SHEET || 
                sheetName.toUpperCase().includes(TEMPLATE_SHEET_IDENTIFIER)) {
                continue;
            }

            const lastRow = currentSheet.getLastRow();
            const lastColumn = currentSheet.getLastColumn();
            
            if (lastRow < DATA_START_ROW) continue; 
            
            // *** ใช้ getRange() เพื่ออ่านข้อมูล เริ่มจากแถวที่ 6 (DATA_START_ROW) ***
            const numRows = lastRow - DATA_START_ROW + 1;
            const sheetData = currentSheet.getRange(DATA_START_ROW, 1, numRows, lastColumn).getValues();

            // วนลูปข้อมูลที่ได้มา (ตอนนี้ j=0 คือแถวที่ 6 ของชีตแล้ว)
            for (let j = 0; j < sheetData.length; j++) { 
                const row = sheetData[j];
                const studentId = String(row[D_ID] || "").trim();
                
                if (studentId) {
                    const isVerified = verifiedIds.has(studentId);
                    const statusHtml = isVerified ? 
                        '<span class="badge bg-success">✅ ยืนยันแล้ว</span>' : 
                        '<span class="badge bg-warning text-dark">❌ ยังไม่ยืนยัน</span>';
                    
                    const rowData = [
                        (row[D_CLASS_LEVEL] || "").toString().trim(), 
                        (row[D_ROOM] || "").toString().trim(),          
                        (row[D_STUDENT_NO] || "").toString().trim(), 
                        studentId,                                                    
                        (row[D_FULL_NAME] || "").toString().trim(),   
                        statusHtml
                    ];
                    allStudentData.push(rowData);
                }
            }
        }

        // 3. ส่งข้อมูลกลับ
        if (allStudentData.length === 0) {
            return { error: 'ไม่พบข้อมูลนักเรียนที่สามารถแสดงได้' };
        }
        
        return { 
            headers: HEADERS,
            data: allStudentData
        };

    } catch (e) {
        Logger.log("Error in getAllStudentData: " + e.message);
        return { error: `เกิดข้อผิดพลาดของเซิร์ฟเวอร์: ${e.message}` };
    }
}

function checkAdminToken(token) {
  if (!token) {
    return { success: false, message: "Token is missing." };
  }
  
  const SCRIPT_PROPS = PropertiesService.getScriptProperties(); 

  try {
    // 1. ดึงข้อมูล Token จาก Properties Service
    const tokenData = SCRIPT_PROPS.getProperty(`admin_token_${token}`); 

    if (!tokenData) {
      return { success: false, message: "Token ไม่ถูกต้องหรือไม่พบในระบบ" };
    }
    
    // tokenData คือ "username|expiry_timestamp"
    const parts = tokenData.split('|');
    const username = parts[0];
    const expiryTimestamp = parseInt(parts[1], 10);
    const currentTime = Date.now();

    // 2. ตรวจสอบวันหมดอายุ (สำคัญ)
    if (currentTime > expiryTimestamp) {
      // หมดอายุ: ลบ Token ทิ้ง
      SCRIPT_PROPS.deleteProperty(`admin_token_${token}`);
      return { success: false, message: "เซสชันหมดอายุ" };
    }
    
    // 3. ตรวจสอบ Username ใน Google Sheet ว่ายังมีสิทธิ์อยู่จริงหรือไม่
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(ADMIN_USERS_SHEET);
    
    if (!sheet) {
      return { success: false, message: "Admin configuration sheet missing." };
    }

    const data = sheet.getDataRange().getValues(); 
    let adminName = "ผู้ดูแลระบบ";
    let userFound = false;

    // Col Index: 0=Username, 1=Password, 2=Name
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && String(row[0]).trim() === username) {
        adminName = row[2] ? String(row[2]).trim() : "ผู้ดูแลระบบ";
        userFound = true;
        break;
      }
    }
    
    if (!userFound) {
       SCRIPT_PROPS.deleteProperty(`admin_token_${token}`); 
       return { success: false, message: "User associated with token no longer exists." };
    }

    // 4. Token ถูกต้องและผู้ใช้ยังมีสิทธิ์
    return {
      success: true,
      name: adminName,
      username: username
    };

  } catch (e) {
    Logger.log("Error in checkAdminToken: " + e.message);
    return { success: false, message: "Server error during token validation: " + e.message };
  }
}

/**
 * Helper function สำหรับสร้างตารางแสดงผลรายการนักเรียนทั้งหมด
 * *สำคัญ: ฟังก์ชันนี้ถูกใช้โดย getAllStudentData()
 */
function createStudentListTable(data, headers) {
    let html = `
    <div class="table-responsive">
    <table class="table table-bordered table-striped table-hover text-start">
    <thead class="table-dark"><tr>`;
    
    headers.forEach(header => { html += `<th>${header}</th>`; });
    html += '</tr></thead><tbody>';
    
    data.forEach(row => {
        html += '<tr>';
        row.forEach((cell, index) => {
            // คอลัมน์สถานะ (index 5) ถูกจัดรูปแบบเป็น HTML แล้ว
            html += `<td class="${index === 5 ? 'text-center' : ''}">${cell}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    return html;
}