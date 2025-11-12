import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

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
};
