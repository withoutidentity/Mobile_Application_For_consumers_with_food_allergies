export interface Allergen {
  id: number;
  name: string;
  altNames: string[];
  description: string;
  defaultLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UserProfile {
  allergens: number[]; // IDs of allergens
  dietaryRestrictions: string[];
  name?: string;
  emergencyContact?: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  barcode: string;
  ingredients: string[];
  allergenWarnings: string[];
  image?: string;
}

export interface AllergenSymptom {
  allergenId: number;
  allergenName: string;
  symptoms: string[];
  firstAid: string[];
  whenToSeekHelp: string[];
}