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
