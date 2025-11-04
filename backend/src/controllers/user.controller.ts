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
          allergenId: true,
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
  const { allergenIds } = req.body as { allergenIds: number[] };

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: User not found in request' });
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete existing allergies for the user
    await tx.userAllergy.deleteMany({ where: { userId: user.id } });

    // 2. Create new allergies
    if (allergenIds && allergenIds.length > 0) {
      await tx.userAllergy.createMany({
        data: allergenIds.map((id) => ({ userId: user.id, allergenId: id, severity: 'HIGH' })),
      });
    }
  });

  return res.status(200).json({ message: 'Allergies updated successfully' });
};