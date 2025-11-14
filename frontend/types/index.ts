export interface Allergen {
  id: number;
  name: string;
  altNames: string[];
  description: string;
  defaultLevel: Severity;
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserAllergy {
  allergenId: number;
  severity: Severity;
}

export interface UserProfile {
  // เปลี่ยนจาก number[] เป็น UserAllergy[]
  allergens: UserAllergy[];
  dietaryRestrictions: string[];
  name?: string;
  emergencyContact?: string;
  role: 'USER' | 'ADMIN';
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