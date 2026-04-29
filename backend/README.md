# Backend - Mobile Application For Consumers With Food Allergies

## 1. อธิบายโปรเจคนี้

Backend เป็น REST API สำหรับแอปผู้บริโภคที่มีอาการแพ้อาหาร ทำหน้าที่จัดการผู้ใช้ การยืนยันตัวตน ข้อมูลสารก่อภูมิแพ้ ข้อมูลสินค้า ประวัติการสแกน รูปภาพสินค้า ระบบรีเซ็ตรหัสผ่าน และระบบแชทช่วยตอบคำถามเกี่ยวกับความปลอดภัยของอาหาร

## 2. Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Multer
- Nodemailer
- Gemini API

## 3. Feature

- สมัครสมาชิก เข้าสู่ระบบ และออก token สำหรับใช้งาน API
- เปลี่ยนรหัสผ่านและรีเซ็ตรหัสผ่านผ่านรหัสยืนยัน
- จัดการข้อมูลผู้ใช้และข้อมูลการแพ้อาหาร
- CRUD ข้อมูลสารก่อภูมิแพ้
- CRUD ข้อมูลสินค้า พร้อมอัปโหลดรูปภาพสินค้า
- บันทึกและดึงประวัติการสแกนสินค้า
- บันทึก consent logs สำหรับข้อมูลที่เกี่ยวข้องกับผู้ใช้
- แชทและบันทึกประวัติการสนทนา
- Middleware สำหรับตรวจสอบ JWT และจัดการ error

## 4. Installation & Setup

ติดตั้ง dependencies

```bash
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend`

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# Optional: สำหรับส่งอีเมลรีเซ็ตรหัสผ่าน
SMTP_HOST=""
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

สร้าง Prisma Client และอัปเดตฐานข้อมูล

```bash
npx prisma generate
npx prisma migrate dev
```

ถ้าต้องการ seed ข้อมูลตัวอย่าง

```bash
npx ts-node prisma/seed.ts
```

รัน backend แบบ development

```bash
npm run dev
```

Build โปรเจค

```bash
npm run build
```

รันหลัง build

```bash
npm run start
```

รัน tests

```bash
npm run test
```

API จะเริ่มทำงานที่

```text
http://localhost:3000
```
