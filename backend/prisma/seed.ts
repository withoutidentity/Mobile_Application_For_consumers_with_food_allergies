import { PrismaClient } from '../src/generated/prisma'
import * as bcrypt from 'bcrypt' // <--- 1. เพิ่มการ import bcrypt

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // 2. สร้าง Hash ของรหัสผ่านเตรียมไว้
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. สร้าง/อัปเดต Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { 
        password: hashedPassword, // <--- ถ้ามี User อยู่แล้ว ให้แก้รหัสใหม่ด้วย
        role: 'ADMIN' 
    },
    create: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: hashedPassword, // <--- ใช้รหัสที่ Hash แล้ว
      role: 'ADMIN',
    },
  })

  // 4. สร้าง/อัปเดต User ธรรมดา
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { 
        password: hashedPassword,
        role: 'USER' 
    },
    create: {
      email: 'user@example.com',
      name: 'Normal User',
      password: hashedPassword, // <--- ใช้รหัสที่ Hash แล้ว
      role: 'USER',
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })