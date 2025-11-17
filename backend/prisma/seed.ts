/// <reference types="node" />
import { PrismaClient, Severity } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // ข้อมูลที่คุณ Backup ไว้
  const allergenData: { productId: number; allergenId: number; }[] = [
    {
      productId: 5,
      allergenId: 1,
    },
    {
      productId: 2,
      allergenId: 1,
    },
    {
      productId: 3,
      allergenId: 1,
    },
    {
      productId: 3,
      allergenId: 3,
    },
    {
      productId: 3,
      allergenId: 4,
    },
    {
      productId: 4,
      allergenId: 1,
    },
    {
      productId: 4,
      allergenId: 3,
    },
    {
      productId: 1,
      allergenId: 1,
    },
    {
      productId: 1,
      allergenId: 2,
    },
    {
      productId: 1,
      allergenId: 3,
    },
    {
      productId: 1,
      allergenId: 4,
    },
    
    // --- เพิ่มข้อมูลอื่นๆ ที่คุณมีที่นี่ ---
  ];

  for (const data of allergenData) {
    const products = await prisma.productAllergen.create({
      data: data,
    });
    console.log(`Created productAllergen with id: ${products.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
