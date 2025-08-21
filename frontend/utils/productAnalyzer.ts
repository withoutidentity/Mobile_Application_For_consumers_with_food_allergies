import allergens from '@/data/allergens';
import { Product, UserProfile } from '@/types';

export function analyzeProduct(product: Product, userProfile: UserProfile) {
  const userAllergens = userProfile.allergens;
  const productAllergenWarnings = product.allergenWarnings;
  
  // Check for direct allergen matches
  const directMatches = userAllergens.filter(allergenId => 
    productAllergenWarnings.includes(allergenId)
  );
  
  // Check for potential allergen matches in ingredients
  const potentialMatches: string[] = [];
  
  // Get all allergen aliases for the user's allergens
  const userAllergenDetails = allergens.filter(allergen => 
    userAllergens.includes(allergen.id)
  );
  
  const allUserAllergenAliases = userAllergenDetails.flatMap(allergen => 
    [allergen.name.toLowerCase(), ...allergen.aliases.map(alias => alias.toLowerCase())]
  );
  
  // Check each ingredient against all aliases
  product.ingredients.forEach(ingredient => {
    const lowerIngredient = ingredient.toLowerCase();
    
    allUserAllergenAliases.forEach(alias => {
      if (lowerIngredient.includes(alias) && 
          !directMatches.includes(alias) && 
          !potentialMatches.includes(alias)) {
        potentialMatches.push(alias);
      }
    });
  });
  
  // Determine safety status
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
    matchedAllergens: directMatches.map(id => 
      allergens.find(allergen => allergen.id === id)
    ).filter(Boolean),
  };
}

export function findProductByBarcode(barcode: string, products: Product[]): Product | undefined {
  return products.find(product => product.barcode === barcode);
}