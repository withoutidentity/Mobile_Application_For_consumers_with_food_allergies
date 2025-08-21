export interface Allergen {
  id: string;
  name: string;
  description: string;
  aliases: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  allergens: string[]; // IDs of allergens
  dietaryRestrictions: string[];
  name?: string;
  emergencyContact?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  ingredients: string[];
  allergenWarnings: string[];
  image?: string;
}

export interface AllergenSymptom {
  allergenId: string;
  allergenName: string;
  symptoms: string[];
  firstAid: string[];
  whenToSeekHelp: string[];
}