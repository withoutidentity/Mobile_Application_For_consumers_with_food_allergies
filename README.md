# Mobile Application For Consumers With Food Allergies

แอปพลิเคชันสำหรับผู้บริโภคที่มีอาการแพ้อาหาร ช่วยให้ผู้ใช้ตรวจสอบสินค้าและส่วนผสมที่อาจมีสารก่อภูมิแพ้ จัดการข้อมูลการแพ้อาหารของตนเอง ดูคำแนะนำเบื้องต้นเกี่ยวกับอาการแพ้ และใช้งานระบบแชทเพื่อช่วยประเมินความปลอดภัยของอาหาร

โปรเจคนี้แบ่งออกเป็น 2 ส่วนหลัก

- `frontend` แอปมือถือที่พัฒนาด้วย Expo และ React Native
- `backend` REST API สำหรับจัดการข้อมูลผู้ใช้ สินค้า สารก่อภูมิแพ้ ประวัติการสแกน และระบบแชท

## Tech Stack

**Frontend**

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS
- Axios
- TanStack React Query

**Backend**

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Nodemailer
- Gemini API

## Features

- สมัครสมาชิกและเข้าสู่ระบบ
- จัดการโปรไฟล์ผู้ใช้และข้อมูลการแพ้อาหาร
- ค้นหาและดูรายละเอียดสินค้า
- สแกนสินค้าและบันทึกประวัติการสแกน
- ตรวจสอบสารก่อภูมิแพ้จากข้อมูลสินค้า
- แสดงข้อมูลอาการแพ้และคำแนะนำเบื้องต้น
- แชทช่วยประเมินความปลอดภัยของอาหาร
- ระบบผู้ดูแลสำหรับจัดการข้อมูลสินค้าและสารก่อภูมิแพ้
- รีเซ็ตรหัสผ่านและเปลี่ยนรหัสผ่าน

## Project Structure

```text
.
├── backend/     # Express API, Prisma, PostgreSQL
└── frontend/    # Expo React Native mobile app
```

## Installation & Setup

### 1. Clone project

```bash
git clone <repository-url>
cd Mobile_Application_For_consumers_with_food_allergies
```

### 2. Setup backend

```bash
cd backend
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
```

รัน Prisma และเริ่ม backend

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend จะทำงานที่

```text
http://localhost:3000
```

### 3. Setup frontend

เปิด terminal อีกหน้าหนึ่ง

```bash
cd frontend
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend`

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

ถ้ารันบนมือถือจริง ให้เปลี่ยน `localhost` เป็น IP ของเครื่องที่รัน backend

```bash
npm run start
```

## More Details

อ่านรายละเอียดเพิ่มเติมของแต่ละส่วนได้ที่

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
