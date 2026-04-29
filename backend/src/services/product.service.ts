import { PrismaClient } from '../generated/prisma';
import { deleteProductImageFile } from '../utils/productImage';

const prisma = new PrismaClient();

export type ProductCreateInput = {
  name: string;
  brand?: string;
  barcode: string;
  ingredients: string[];
  image?: string;
  removeImage?: boolean;
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
    const { image: imageUrl, allergenWarnings, allergenWarningIds, removeImage, ...productData } = data;
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
    const { image: imageUrl, barcode, allergenWarnings, allergenWarningIds, removeImage, ...productData } = data;
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!currentProduct) {
      return null;
    }

    const nextImageUrl = imageUrl !== undefined ? imageUrl : removeImage ? null : undefined;

    if (allergenWarnings !== undefined || allergenWarningIds !== undefined) {
      const resolvedAllergenIds = await resolveAllergenIds({ allergenWarnings, allergenWarningIds });

      await prisma.productAllergen.deleteMany({
        where: { productId: id },
      });

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...productData,
          ...(nextImageUrl !== undefined ? { imageUrl: nextImageUrl } : {}),
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

      if (
        currentProduct.imageUrl &&
        (removeImage || (imageUrl !== undefined && imageUrl !== currentProduct.imageUrl))
      ) {
        await deleteProductImageFile(currentProduct.imageUrl);
      }

      return updatedProduct;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(nextImageUrl !== undefined ? { imageUrl: nextImageUrl } : {}),
      },
      include: {
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });

    if (
      currentProduct.imageUrl &&
      (removeImage || (imageUrl !== undefined && imageUrl !== currentProduct.imageUrl))
    ) {
      await deleteProductImageFile(currentProduct.imageUrl);
    }

    return updatedProduct;
  },

  async remove(id: number) {
    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    await deleteProductImageFile(deletedProduct.imageUrl);
    return deletedProduct;
  },
};
