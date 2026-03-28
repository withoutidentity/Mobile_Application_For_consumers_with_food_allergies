import { AllergenSymptom } from '@/types';
import { fetchAllergens } from './allergenService';
import { getAllergenDisplayName } from './allergens';

let allergenSymptoms: AllergenSymptom[] = [];

export const fetchSymptoms = async (): Promise<AllergenSymptom[]> => {
  try {
    const allergens = await fetchAllergens();
    allergenSymptoms = allergens.flatMap((allergen) =>
      allergen.symptoms.map((symptom) => ({
        ...symptom,
        allergenName: getAllergenDisplayName(allergen),
      })),
    );
    return allergenSymptoms;
  } catch (error) {
    console.error('Failed to fetch allergen symptoms:', error);
    return [];
  }
};

fetchSymptoms();

export default allergenSymptoms;
