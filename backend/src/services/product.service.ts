import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// DTO สำหรับข้อมูล Product ที่รับมาจาก Frontend เพื่อสร้างหรืออัปเดต
export type ProductCreateInput = {
  name: string;
  brand?: string; // Brand เป็น optional ใน schema
  barcode: string;
  ingredients: string[];
  image?: string; // Frontend ส่งมาเป็น 'image'
  allergenWarnings: string[]; // Frontend ส่งชื่อสารก่อภูมิแพ้มาเป็น array ของ string
};

// สำหรับการอัปเดต เราจะใช้ Type เดียวกับตอนสร้าง แต่ทุกฟิลด์จะเป็น optional
export type ProductUpdateInput = Partial<ProductCreateInput>;


export const ProductService = {
  async getAll() {
    return prisma.product.findMany({
      include: {
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  },

  async getById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });
  },

  async create(data: ProductCreateInput) {
    // แปลง 'image' ที่รับมาจาก Frontend เป็น 'imageUrl' สำหรับ Prisma
    // และตรวจสอบให้แน่ใจว่าไม่มี id ปะปนเข้ามาในข้อมูลที่จะสร้าง
    const { allergenWarnings, image: imageUrl, ...productData } = data as any;

    // ค้นหา ID ของสารก่อภูมิแพ้จากชื่อหรือชื่ออื่น ๆ ที่ Frontend ส่งมา
    const allergenIds = await prisma.allergen.findMany({
      where: {
        OR: [
          { name: { in: allergenWarnings, mode: 'insensitive' } }, // ค้นหาจากชื่อหลัก
          { altNames: { hasSome: allergenWarnings } }, // ค้นหาจากชื่ออื่น ๆ
        ],
      },
      select: { id: true },
    });

    // สร้าง object สำหรับเชื่อมโยง Product กับ Allergen
    const connectAllergens = allergenIds.map(allergen => ({
      allergen: { connect: { id: allergen.id } },
    }));

    return prisma.product.create({
     data: {
        ...productData,
        imageUrl, // ใช้ imageUrl ที่แปลงแล้ว
        allergens: {
          create: connectAllergens,
        },
      },
      include: {
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });
  },
  
  async update(id: number, data: ProductUpdateInput) {
    // แปลง 'image' ที่รับมาจาก Frontend เป็น 'imageUrl' สำหรับ Prisma
    // และแยก barcode ออกไป เพราะเราไม่อนุญาตให้อัปเดต barcode
    const { allergenWarnings, image: imageUrl, barcode, ...productData } = data;

    // หากมีการส่ง allergenWarnings มา ให้ทำการอัปเดตความสัมพันธ์ของสารก่อภูมิแพ้
    // เราจะตรวจสอบว่าเป็น array จริงๆ ไม่ใช่ undefined เพื่อป้องกันการลบโดยไม่จำเป็น
    if (allergenWarnings !== undefined) {
      // 1. ลบความสัมพันธ์ ProductAllergen เดิมทั้งหมดของ Product นี้
      await prisma.productAllergen.deleteMany({
        where: { productId: id },
      });

      // 2. ค้นหา ID ของสารก่อภูมิแพ้ใหม่
      const newAllergenIds = await prisma.allergen.findMany({
        where: {
          OR: [
            { name: { in: allergenWarnings, mode: 'insensitive' } },
            { altNames: { hasSome: allergenWarnings } },
          ],
        },
        select: { id: true },
      });

      // 3. สร้างความสัมพันธ์ ProductAllergen ใหม่
      const connectAllergens = newAllergenIds.map(allergen => ({
        allergen: { connect: { id: allergen.id } },
      }));

      return prisma.product.update({
        where: { id },
        data: {
          ...productData,
          imageUrl, // ใช้ imageUrl ที่แปลงแล้ว
          allergens: { create: connectAllergens },
        },
        include: { allergens: { include: { allergen: true } } },
      });
    } else {
      // หากไม่มีการส่ง allergenWarnings มา ให้อัปเดตเฉพาะข้อมูล Product หลัก
      return prisma.product.update({
        where: { id },
        data: {
          ...productData,
          imageUrl, // ยังคงต้องอัปเดต imageUrl หากมีการส่งมา
        },
        include: { allergens: { include: { allergen: true } } }, // ยังคง include allergens เพื่อให้ return type เหมือนเดิม
      });
    }
  },

  async remove(id: number) {
    // เนื่องจากมีการตั้งค่า onDelete: Cascade ใน Prisma schema สำหรับ ProductAllergen
    // เมื่อ Product ถูกลบ ProductAllergen ที่เกี่ยวข้องจะถูกลบโดยอัตโนมัติ
    return prisma.product.delete({
      where: { id },
    });
  },
};
