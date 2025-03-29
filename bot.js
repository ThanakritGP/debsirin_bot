import express from 'express';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Events,
  EmbedBuilder,
  GatewayIntentBits,
  REST,
  Routes
} from 'discord.js';
import dotenv from 'dotenv';
import './verify.js';  // เชื่อม verify.js เข้ามา

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Bot is Working!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Define the commands
const commands = [{
    name: 'room-number',
    description: 'Room number🔢',
  },
  {
    name: 'menu',
    description: 'Random Food🍕',
  },
  {
    name: 'dessert-menu',
    description: 'Random Dessert🥞',
  },
  {
    name: 'about-debsirin-bot',
    description: 'Information about DS-BOT',
  },
  {
    name: 'contact',
    description: 'Get our contact information',
  },
  {
    name: 'debmedia',
    description: 'Download pictures here📷',
  },
  {
    name: 'verify',
    description: 'Verify student ID',
    options: [
      {
        name: 'student_id',
        description: 'Enter student ID to verify',
        type: 3, // TYPE_STRING
        required: true
      }
    ]
  },
];

// Register commands using REST API
const rest = new REST({
  version: '10'
}).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Register commands to the Discord API
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Initialize the client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Define the menus
const menu = [
  "ข้าวผัด", "ผัดกะเพรา", "ผัดกะเพรากุ้ง", "ผัดผักบุ้ง", "ไข่เจียว",
  "ลาบหมู", "น้ำตกหมู", "ไข่พะโล้", "เบอร์เกอร์", "พิซซ่า",
  "หมูกรอบผัดพริกเกลือ", "ไก่ทอด", "ราเมง", "ไข่ดาว", "นม",
  "KFC", "McDonalds", "Nobicha", "กุ้งอบวุ้นเส้น", "ไข่กระทะ",
  "ข้าวมันไก่", "พาสต้า", "สปาเก็ตตี้คาโบนารา", "สปาเก็ตตี้ผัดขี้เมา",
  "ส้มตำ", "คัตสึด้ง", "ลาซานญ่า", "ทงคัตสึ", "เกี้ยวซ่า",
  "ทาโกะยากิ", "กุ้งเทมปุระ", "ยากิโทริ", "ข้าวขาหมู", "ข้าวแกงกะหรี่",
  "ข้าวหมูแดง", "บะหมี่เกี๊ยว", "ยำวุ้นเส้น", "ปูผัดผงกระหรี่",
  "ต้มยำกุ้ง", "หมูสะเต๊ะ", "ขนมจีน", "ข้าวเหนียวหมูปิ้ง", "ข้าวเกรียบปากหม้อ",
  "ก๋วยเตี๋ยวเรือ", "ข้าวต้ม", "ข้าวพัซซ่า", "ทาร์ตไข่", "ขนมเบื้อง",
  "พิซซ่าหน้าปู", "ข้าวสวย", "กุ้งอบซอส", "ทอดมันปลากราย", "ข้าวผัดปู",
  "สเต๊กเนื้อ", "ชาบู", "ไก่ผัดพริกขี้หนู", "เกาเหลา", "ข้าวผัดกุ้ง",
  "เนื้อย่าง", "หมูย่าง", "ไส้กรอก", "เกาเหลาหมู", "ข้าวคลุกกะปิ",
  "สลัด", "สเต๊กหมู", "แฮมเบอร์เกอร์", "ไก่กรอบ", "แซนด์วิช",
  "คาโบนาร่า", "กุ้งเผา", "ขนมจีนน้ำยา", "ข้าวเกรียบ", "ไข่เจียวหมูสับ",
  "กะเพราหมู", "กะเพราหมูสับ", "ข้าวขาหมู", "ก๋วยจั๊บ", "ผัดไท",
  "หมูชุปแป้งทอด", "กุ้งผัดพริกขี้หนู", "หมูย่างเกาหลี", "สลัดผลไม้",
  "ข้าวผัดสับปะรด", "หมูหัน", "แกงเขียวหวาน", "ข้าวหมูปิ้ง", "ปีกไก่ทอด",
  "ข้าวซอย", "ข้าวต้มปลา", "หมูกรอบ", "ข้าวมันไก่ทอด", "ต้มข่าไก่",
  "ต้มยำปลากระพง", "ข้าวแช่", "ข้าวหมูหยอง", "หมูปิ้ง", "เนื้อย่าง",
  "ข้าวพะแนง", "ข้าวราดแกง", "ก๋วยเตี๋ยวคั่วไก่", "ก๋วยเตี๋ยวหมู", "ผัดเส้นหมี่",
  "ส้มตำปูปลาร้า", "ข้าวห่อใบบัว", "ยำกุ้งสด", "ไก่ย่าง", "ทอดมันกุ้ง",
  "ข้าวกล่อง", "ข้าวขาหมูโบราณ", "บาร์บีคิว", "หมูตุ๋น", "ไก่ทอดกรอบ",
  "ก๋วยเตี๋ยวต้มยำ", "น้ำพริกปลาทู", "แกงเผ็ดไก่",
  "น้ำตกเนื้อ", "สตูว์เนื้อ", "ไข่ต้ม", "สลัดกุ้ง", "ข้าวผัดกุ้ง",
  "ข้าวปลา", "สตูว์ไก่", "ผัดซีอิ๊ว", "ข้าวพริกหยวก",
  "สลัดปลาแซลมอน", "บะหมี่ไข่", "ข้าวมันไก่ทอดเกาหลี", "ข้าวผัดไข่เค็ม"
];

const dessertMenu = [
  "บิงซูสตรอว์เบอรรี", "บิงซูมะม่วง", "บิงซูแตงโม", "บิงซูเมลอน",
  "บิงซูชาเขียว", "บราวนี่", "คุ้กกี้", "เค้กส้ม", "เค้กช็อกโกแลต",
  "เค้กกาแฟ", "เค้กสตรอว์เบอร์รี", "ขนมจีบ", "ทาร์ตไข่", "ครัวซองต์",
  "โดนัท", "คัพเค้ก", "ไอศกรีม", "ขนมเบื้อง", "ช็อกโกแลตฟองดู",
  "พายแอปเปิ้ล", "ชีสเค้ก", "คุกกี้ช็อกโกแลตชิป", "พุดดิ้ง",
  "มูสมะม่วง", "เครปเค้ก", "มัฟฟิน", "ช็อกโกแลตมูส", "ไอศกรีมชาเขียว",
  "วาฟเฟิล", "เครป", "ไอศกรีมสตรอว์เบอร์รี", "คัสตาร์ด", "พายเลมอน",
  "พายสตรอว์เบอร์รี", "คัพเค้กช็อกโกแลต", "บานอฟฟี่พาย", "พายมะพร้าว",
  "พายฟักทอง", "ชีสเค้กสตรอว์เบอร์รี", "เบเกอรี่", "เค้กมะพร้าว",
  "เค้กบลูเบอร์รี", "เค้กวนิลลา", "พายส้ม", "โรลเค้ก", "ไอศกรีมผลไม้",
  "พัฟแป้ง", "ครีมบรูเล่", "โฟลต", "มิลค์เชค", "ฮันนี่โทสต์", "ทาร์ตมะพร้าว",
  "ช็อกโกแลตเค้ก", "เค้กมะม่วง", "คุ้กกี้เนย", "เค้กมะพร้าวน้ำหอม",
  "บัตเตอร์เค้ก", "บราวนี่ช็อกโกแลต", "คุกกี้โอ๊ต", "เค้กส้มโอ",
  "ไอศกรีมโกโก้", "เค้กมะนาว", "เค้กกาแฟมอคค่า",
  "ทองหยอด", "ลอยแก้ว", "บัวลอย",
  "กล้วยทอด", "เผือกทอด", "ทับทิมกรอบ", "ฝอยทอง",
  "ขนมปังเนย", "เค้กงาดำ", "คุกกี้ข้าวโอ๊ต", "สตรอว์เบอร์รีชีสเค้ก",
  "ไอศกรีมกะทิ", "ลูกชุบ", "เค้กฟรุ๊ตเค้ก",
  "เค้กนมสด", "ขนมปังสังขยา",
];

// Client Ready Event
client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

// Interaction Create Event
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'menu') {
    await interaction.reply(menu[Math.floor(Math.random() * menu.length)]);
  }

  if (interaction.commandName === 'dessert-menu') {
    await interaction.reply(dessertMenu[Math.floor(Math.random() * dessertMenu.length)]);
  }

  if (interaction.commandName === 'about-debsirin-bot') {
    await interaction.reply('บอตเทพศิรินทร์ พัฒนาโดย PingzGP DSA139 IEP💚💛');
  }

  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'room-number') {
    await interaction.deferReply();
    const embed = new EmbedBuilder()
      .setTitle('🔢 หมายเลขห้องเรียนโรงเรียนเทพศิรินทร์')
      .setDescription(
        'หมายเลขห้องภายในโรงเรียนเทพศิรินทร์นั้นประกอบไปด้วยเลข 3 – 4 หลัก ซึ่งมีความหมายดังนี้:\n\n' +
        '📌 **เลขหลักแรก** หมายถึง หมายเลขตึก/อาคาร\n' +
        '📌 **เลขหลักสอง** หมายถึง หมายเลขชั้น\n' +
        '📌 **เลขหลักที่สามและสี่** หมายถึง ลำดับห้อง\n\n' +
        '---\n\n' +
        '🏢 **หมายเลขอาคาร:**\n' +
        '🔹 **1** - ตึกเยาวมาลย์อุทิศ – ปิยราชบพิตรปดิวรัดา\n' +
        '🔹 **2** - ตึกนิภานภดล\n' +
        '🔹 **3** - ตึกแม้นศึกษาสถาน\n' +
        '🔹 **4** - ตึกโชฎึกเลาหะเศรษฐี (พิพิธภัณฑ์เพื่อการศึกษาฯ)\n' +
        '🔹 **5** - ตึกภาณุรังษีสว่างวงศ์ (อาคาร 100 ปี เทพศิรินทร์)\n' +
        '🔹 **6** - ตึกเทิดพระเกียรติ'
      )
      .setColor(0x00ae86);

    await interaction.reply({
      embeds: [embed]
    });
  }

  if (interaction.commandName === 'contact') {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setLabel('งานประชาสัมพันธ์ โรงเรียนเทพศิรินทร์')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.facebook.com/PRdebsirin')
        .setEmoji('<:Facebook:1354294377911947274>'),

        new ButtonBuilder()
        .setLabel('คณะกรรมการบริหารนักเรียนเทพศิรินทร์ - Debsirin Student Committee')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.facebook.com/DebsirinSC')
        .setEmoji('<:Facebook:1354294377911947274>'),

        new ButtonBuilder()
        .setLabel('งานประชาสัมพันธ์ โรงเรียนเทพศิรินทร์')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.instagram.com/pr.debsirin_official/')
        .setEmoji('<:Instagram:1354294380684513382>'),

        new ButtonBuilder()
        .setLabel('คณะกรรมการบริหารนักเรียนเทพศิรินทร์ - Debsirin Student Committee')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.instagram.com/debsirinsc/')
        .setEmoji('<:Instagram:1354294380684513382>')
      );

    await interaction.reply({
      content: '📩 **Contact Us!**',
      components: [row]
    });
  }

  if (interaction.commandName === 'debmedia') {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
        .setLabel('Debmedia')
        .setStyle(ButtonStyle.Link)
        .setURL('https://sites.google.com/debsirin.ac.th/debmedia/debmedia')
        .setEmoji('<:debmedia:1354297615105134766> '),
      );

    await interaction.reply({
      content: '📩 **Download pictures here!**',
      components: [row]
    });
  }
  
  if (interaction.commandName === 'verify') {
    const studentID = interaction.options.getString('student_id'); // รับ ID จากคำสั่ง
    const response = await verifyStudentID(studentID); // ใช้ฟังก์ชันใน verify.js
    
    await interaction.reply({ content: response });
  }
});

// Login the bot
client.login(process.env.TOKEN);