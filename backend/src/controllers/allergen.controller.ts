import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// GET /api/allergens - ดึงสารก่อภูมิแพ้ทั้งหมด
export const getAllAllergens = async (req: Request, res: Response) => {
  try {
    const allergens = await prisma.allergen.findMany({
      include: { symptoms: true, products: true },
    });
    res.json(allergens);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch allergens', error });
  }
};

// GET /api/allergens/:id - ดึงข้อมูลสารก่อภูมิแพ้ตาม ID
export const getAllergenById = async (req: Request, res: Response) => {
  try {
    const allergen = await prisma.allergen.findUnique({
      where: { id: Number(req.params.id) },
      include: { symptoms: true, products: true },
    });
    if (!allergen) return res.status(404).json({ message: 'Allergen not found' });
    res.json(allergen);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch allergen', error });
  }
};

// POST /api/allergens - เพิ่มสารก่อภูมิแพ้ใหม่
export const createAllergen = async (req: Request, res: Response) => {
  try {
    const { name, altNames, description, defaultLevel } = req.body;

    const newAllergen = await prisma.allergen.create({
      data: {
        name,
        altNames,
        description,
        defaultLevel: defaultLevel?.toUpperCase(), // เช่น 'HIGH'
      },
    });

    res.status(201).json(newAllergen);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create allergen', error });
  }
};

// PUT /api/allergens/:id - อัปเดตข้อมูลสารก่อภูมิแพ้
export const updateAllergen = async (req: Request, res: Response) => {
  try {
    const { name, altNames, description, defaultLevel } = req.body;

    const updated = await prisma.allergen.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        altNames,
        description,
        defaultLevel: defaultLevel?.toUpperCase(),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update allergen', error });
  }
};

// DELETE /api/allergens/:id - ลบข้อมูลสารก่อภูมิแพ้
export const deleteAllergen = async (req: Request, res: Response) => {
  try {
    await prisma.allergen.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: 'Allergen deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete allergen', error });
  }
};
