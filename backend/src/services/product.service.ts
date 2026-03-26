import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export type ProductCreateInput = {
  name: string;
  brand?: string;
  barcode: string;
  ingredients: string[];
  image?: string;
  allergenWarnings?: string[];
  allergenWarningIds?: number[];
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

const resolveAllergenIds = async (data: ProductCreateInput | ProductUpdateInput) => {
  if (Array.isArray(data.allergenWarningIds)) {
    return Array.from(
      new Set(
        data.allergenWarningIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );
  }

  const allergenWarnings = Array.isArray(data.allergenWarnings)
    ? data.allergenWarnings.map((item) => item.trim()).filter(Boolean)
    : [];

  if (!allergenWarnings.length) {
    return [];
  }

  const allergens = await prisma.allergen.findMany({
    where: {
      OR: [
        { name: { in: allergenWarnings, mode: 'insensitive' } },
        { altNames: { hasSome: allergenWarnings } },
      ],
    },
    select: { id: true },
  });

  return allergens.map((allergen) => allergen.id);
};

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
    const { image: imageUrl, allergenWarnings, allergenWarningIds, ...productData } = data;
    const resolvedAllergenIds = await resolveAllergenIds({ allergenWarnings, allergenWarningIds });

    return prisma.product.create({
      data: {
        ...productData,
        imageUrl,
        allergens: {
          create: resolvedAllergenIds.map((allergenId) => ({
            allergen: { connect: { id: allergenId } },
          })),
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
    const { image: imageUrl, barcode, allergenWarnings, allergenWarningIds, ...productData } = data;

    if (allergenWarnings !== undefined || allergenWarningIds !== undefined) {
      const resolvedAllergenIds = await resolveAllergenIds({ allergenWarnings, allergenWarningIds });

      await prisma.productAllergen.deleteMany({
        where: { productId: id },
      });

      return prisma.product.update({
        where: { id },
        data: {
          ...productData,
          imageUrl,
          allergens: {
            create: resolvedAllergenIds.map((allergenId) => ({
              allergen: { connect: { id: allergenId } },
            })),
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
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...productData,
        imageUrl,
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

  async remove(id: number) {
    return prisma.product.delete({
      where: { id },
    });
  },
};
