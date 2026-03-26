import { Request, Response } from 'express';
import { PrismaClient, Severity } from '../generated/prisma';

const prisma = new PrismaClient();

type AllergenSymptomInput = {
  defaultLevel: Severity | string;
  symptoms?: string[];
  firstAid?: string[];
  whenToSeekHelp?: string[];
};

type AllergenPayload = {
  name?: string;
  altNames?: string[];
  description?: string;
  symptoms?: AllergenSymptomInput[];
  whenToSeekHelp?: string[];
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
};

const normalizeSeverity = (value: unknown): Severity | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const upper = value.trim().toUpperCase();
  return ['LOW', 'MEDIUM', 'HIGH'].includes(upper) ? (upper as Severity) : null;
};

const normalizeSymptomPayload = (
  symptoms: unknown,
  sharedWhenToSeekHelp: unknown,
): Array<{
  defaultLevel: Severity;
  symptoms: string[];
  firstAid: string[];
  whenToSeekHelp: string[];
}> => {
  if (!Array.isArray(symptoms)) {
    return [];
  }

  const fallbackWhenToSeekHelp = normalizeStringArray(sharedWhenToSeekHelp);

  return symptoms
    .map((entry) => {
      const symptom = entry as AllergenSymptomInput;
      const defaultLevel = normalizeSeverity(symptom?.defaultLevel);

      if (!defaultLevel) {
        return null;
      }

      return {
        defaultLevel,
        symptoms: normalizeStringArray(symptom.symptoms),
        firstAid: normalizeStringArray(symptom.firstAid),
        whenToSeekHelp: fallbackWhenToSeekHelp.length
          ? fallbackWhenToSeekHelp
          : normalizeStringArray(symptom.whenToSeekHelp),
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        defaultLevel: Severity;
        symptoms: string[];
        firstAid: string[];
        whenToSeekHelp: string[];
      } => entry !== null,
    );
};

const validateAllergenPayload = (payload: AllergenPayload, requireName = true) => {
  if (requireName && !payload.name?.trim()) {
    return 'Name is required';
  }

  if (payload.altNames !== undefined && !Array.isArray(payload.altNames)) {
    return 'altNames must be an array of strings';
  }

  const normalizedSymptoms = normalizeSymptomPayload(payload.symptoms, payload.whenToSeekHelp);
  const severityKeys = normalizedSymptoms.map((entry) => entry.defaultLevel);
  const duplicateSeverity = severityKeys.find(
    (severity, index) => severityKeys.indexOf(severity) !== index,
  );

  if (duplicateSeverity) {
    return `Duplicate symptom entry for severity ${duplicateSeverity}`;
  }

  return null;
};

const allergenInclude: any = {
  symptoms: {
    orderBy: {
      defaultLevel: 'asc' as const,
    },
  },
  products: true,
};

export const getAllAllergens = async (req: Request, res: Response) => {
  try {
    const allergens = await prisma.allergen.findMany({
      include: allergenInclude,
      orderBy: { id: 'asc' },
    });
    res.json(allergens);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch allergens', error });
  }
};

export const getAllergenById = async (req: Request, res: Response) => {
  try {
    const allergen = await prisma.allergen.findUnique({
      where: { id: Number(req.params.id) },
      include: allergenInclude,
    });
    if (!allergen) {
      return res.status(404).json({ message: 'Allergen not found' });
    }
    res.json(allergen);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch allergen', error });
  }
};

export const createAllergen = async (req: Request, res: Response) => {
  try {
    const payload = req.body as AllergenPayload;
    const validationError = validateAllergenPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const symptoms = normalizeSymptomPayload(payload.symptoms, payload.whenToSeekHelp);
    const newAllergen = await prisma.allergen.create({
      data: {
        name: payload.name!.trim(),
        altNames: normalizeStringArray(payload.altNames),
        description: payload.description?.trim(),
        symptoms: symptoms.length
          ? {
              create: symptoms,
            }
          : undefined,
      } as any,
      include: allergenInclude,
    });

    res.status(201).json(newAllergen);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create allergen', error });
  }
};

export const updateAllergen = async (req: Request, res: Response) => {
  try {
    const allergenId = Number(req.params.id);
    const payload = req.body as AllergenPayload;
    const validationError = validateAllergenPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const symptoms = normalizeSymptomPayload(payload.symptoms, payload.whenToSeekHelp);
    const updated = await prisma.$transaction(async (tx) => {
      await tx.allergenSymptom.deleteMany({
        where: { allergenId },
      });

      return tx.allergen.update({
        where: { id: allergenId },
        data: {
          name: payload.name!.trim(),
          altNames: normalizeStringArray(payload.altNames),
          description: payload.description?.trim(),
          symptoms: symptoms.length
            ? {
                create: symptoms,
              }
            : undefined,
        } as any,
        include: allergenInclude,
      });
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update allergen', error });
  }
};

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
