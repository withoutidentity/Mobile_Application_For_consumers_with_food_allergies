import { Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

/**
 * @desc    Get user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: User not found in request' });
  }

  const userWithAllergies = await prisma.user.findUnique({
  where: { id: user.id },
  include: {
    allergies: {
      select: {
        severity: true,
        allergen: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
});

  if (!userWithAllergies) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(userWithAllergies);
};

/**
 * @desc    Update user allergens
 * @route   PUT /api/users/me/allergies
 * @access  Private
 */
export const updateUserAllergies = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { allergies } = req.body as {
    allergies: { allergenId: number; severity: 'LOW' | 'MEDIUM' | 'HIGH' }[];
  };

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: User not found in request' });
  }

  // เพิ่มการตรวจสอบข้อมูลด้วย Zod เพื่อความปลอดภัย
  if (!Array.isArray(allergies)) {
    return res.status(400).json({ message: 'Invalid request: allergies must be an array' });
  }

  await prisma.$transaction(async (tx) => {
    // 1. ลบข้อมูลการแพ้เดิมของผู้ใช้ออกทั้งหมด (วิธีที่ง่ายและตรงไปตรงมา)
    await tx.userAllergy.deleteMany({ where: { userId: user.id } });

    // 2. สร้างข้อมูลการแพ้ใหม่จากข้อมูลที่ส่งมา
    // ถ้า allergies ที่ส่งมาเป็น array ว่าง, ก็จะไม่มีการสร้างข้อมูลใหม่ ซึ่งถูกต้องแล้ว
    if (allergies.length > 0) {
      await tx.userAllergy.createMany({
        data: allergies.map((allergy) => ({
          userId: user.id,
          allergenId: allergy.allergenId,
          severity: allergy.severity,
        })),
      });
    }
  });

  return res.status(200).json({ message: 'Allergies updated successfully' });
};

/**
 * @desc    Add a product to scan history
 * @route   POST /api/users/me/history
 * @access  Private
 */
export const addScanHistory = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { productId } = req.body as { productId: number };

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: User not found in request' });
  }

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const historyEntry = await prisma.scanHistory.create({
      data: {
        userId: user.id,
        productId: productId,
      },
    });
    return res.status(201).json(historyEntry);
  } catch (error) {
    console.error('Failed to add scan history:', error);
    return res.status(500).json({ message: 'Internal server error while adding scan history' });
  }
};

/**
 * @desc    Get user's scan history
 * @route   GET /api/users/me/scanHistory
 * @access  Private
 */
export const getScanHistory = async (req: AuthRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: User not found in request' });
  }

  try {
    const history = await prisma.scanHistory.findMany({
      where: { userId: user.id },
      orderBy: { scannedAt: 'desc' },
      // ดึงประวัติมาเผื่อ สำหรับการกรองรายการซ้ำ (เช่น 20 รายการล่าสุด)
      take: 20,
      include: {
        product: {
          include: {
            allergens: {
              include: {
                allergen: {
                  select: { altNames: true },
                },
              },
            },
          },
        },
      },
    });

    // สร้าง Logic สำหรับกรองสินค้าที่ไม่ซ้ำกัน
    const uniqueProducts = [];
    const seenProductIds = new Set<number>();

    for (const entry of history) {
      if (entry.product && !seenProductIds.has(entry.product.id)) {
        seenProductIds.add(entry.product.id);
        uniqueProducts.push(entry.product);
      }
      // หยุดเมื่อได้สินค้าครบ 5 ชิ้น
      if (uniqueProducts.length >= 5) {
        break;
      }
    }

    res.json(uniqueProducts);
  } catch (error) {
    console.error('Failed to get scan history:', error);
    return res.status(500).json({ message: 'Internal server error while getting scan history' });
  }
};
