export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface AllergenSymptom {
  id?: number;
  allergenId: number;
  allergenName: string;
  defaultLevel: Severity;
  symptoms: string[];
  firstAid: string[];
  whenToSeekHelp: string[];
}

export interface Allergen {
  id: number;
  name: string;
  altNames: string[];
  description: string;
  symptoms: AllergenSymptom[];
}

export interface UserAllergy {
  allergenId: number;
  severity: Severity;
}

export interface UserProfile {
  allergens: UserAllergy[];
  dietaryRestrictions: string[];
  name?: string;
  emergencyContact?: string;
  role: 'USER' | 'ADMIN';
  email?: string;
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
