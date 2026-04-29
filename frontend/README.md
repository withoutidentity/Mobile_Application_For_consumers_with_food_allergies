# Frontend - Mobile Application For Consumers With Food Allergies

## 1. อธิบายโปรเจคนี้

Frontend เป็นแอปพลิเคชันมือถือสำหรับผู้บริโภคที่มีอาการแพ้อาหาร ใช้สำหรับค้นหา/สแกนสินค้า ตรวจสอบส่วนผสมและสารก่อภูมิแพ้ ดูข้อมูลอาการแพ้ จัดการโปรไฟล์ผู้ใช้ และพูดคุยกับระบบแชทเพื่อช่วยประเมินความปลอดภัยของอาหารเบื้องต้น

## 2. Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS
- Axios
- TanStack React Query
- AsyncStorage
- Expo Camera / Image Picker

## 3. Feature

- สมัครสมาชิกและเข้าสู่ระบบ
- รีเซ็ตรหัสผ่านและเปลี่ยนรหัสผ่าน
- จัดการโปรไฟล์ผู้ใช้และข้อมูลการแพ้อาหาร
- แสดงรายการสารก่อภูมิแพ้และคำแนะนำอาการเบื้องต้น
- ค้นหาและดูรายละเอียดสินค้า
- สแกนสินค้าและบันทึกประวัติการสแกน
- แชทช่วยประเมินความปลอดภัยของอาหาร
- หน้าสำหรับผู้ดูแลระบบในการจัดการข้อมูลสินค้า/สารก่อภูมิแพ้

## 4. Installation & Setup

ติดตั้ง dependencies

```bash
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend`

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

ถ้ารันบนมือถือจริง ให้เปลี่ยน `localhost` เป็น IP ของเครื่องที่รัน backend เช่น

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

เริ่มรันแอป

```bash
npm run start
```

รันบน Android

```bash
npm run android
```

รันบน iOS

```bash
npm run ios
```

รันบน Web

```bash
npm run web
```

ตรวจสอบ lint

```bash
npm run lint
```
