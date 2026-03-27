import { Allergen, Product, UserProfile } from '@/types';
import {
  getAllergenCanonicalKey,
  getAllergenSearchTerms,
  normalizeAllergenTerm,
} from './allergenLocalization';

const normalizeStringArray = (values: unknown): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => normalizeAllergenTerm(value))
    .filter((value): value is string => Boolean(value));
};

export function analyzeProduct(
  product: Product,
  userProfile: UserProfile,
  allAllergens: Allergen[],
) {
  const userAllergenIds = Array.isArray(userProfile?.allergens)
    ? userProfile.allergens.map((ua) => ua.allergenId)
    : [];
  const productAllergenWarnings = normalizeStringArray(product?.allergenWarnings);
  const ingredientsText = normalizeStringArray(product?.ingredients).join(', ');

  const userAllergenDetails = Array.isArray(allAllergens)
    ? allAllergens.filter((allergen) => userAllergenIds.includes(allergen.id))
    : [];

  const productWarningKeys = productAllergenWarnings
    .map((warning) => getAllergenCanonicalKey(warning))
    .filter((value): value is string => Boolean(value));
  const directMatches: Allergen[] = [];
  const potentialMatches: Allergen[] = [];

  userAllergenDetails.forEach((allergen) => {
    const namesToCheck = getAllergenSearchTerms(allergen);
    const allergenKey = getAllergenCanonicalKey(allergen.name);

    if (namesToCheck.length === 0) {
      return;
    }

    const isDirectWarning =
      productAllergenWarnings.some((warning) => namesToCheck.includes(warning)) ||
      (allergenKey ? productWarningKeys.includes(allergenKey) : false);

    if (isDirectWarning && !directMatches.some((match) => match.id === allergen.id)) {
      directMatches.push(allergen);
      return;
    }

    const isIngredientMatch = namesToCheck.some((name) => ingredientsText.includes(name));
    if (!isIngredientMatch) {
      return;
    }

    if (
      !directMatches.some((match) => match.id === allergen.id) &&
      !potentialMatches.some((match) => match.id === allergen.id)
    ) {
      potentialMatches.push(allergen);
    }
  });

  let safetyStatus: 'safe' | 'caution' | 'unsafe' = 'safe';

  if (directMatches.length > 0) {
    safetyStatus = 'unsafe';
  } else if (potentialMatches.length > 0) {
    safetyStatus = 'caution';
  }

  return {
    safetyStatus,
    directMatches,
    potentialMatches,
  };
}

export function findProductByBarcode(barcode: string, products: Product[]): Product | undefined {
  return products.find((product) => product.barcode === barcode);
}
