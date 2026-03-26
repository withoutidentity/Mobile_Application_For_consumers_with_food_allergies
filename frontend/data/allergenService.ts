import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Allergen, AllergenSymptom, Severity } from '@/types';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type BackendAllergenSymptom = {
  id: number;
  allergenId: number;
  defaultLevel: Severity;
  symptoms: string[];
  firstAid: string[];
  whenToSeekHelp: string[];
};

type BackendAllergen = {
  id: number;
  name: string;
  description: string | null;
  altNames: string[];
  symptoms: BackendAllergenSymptom[];
};

export type AllergenPayload = {
  name: string;
  description: string;
  altNames: string[];
  symptoms: Array<{
    defaultLevel: Severity;
    symptoms: string[];
    firstAid: string[];
  }>;
  whenToSeekHelp: string[];
};

const severityOrder: Record<Severity, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

const mapAllergen = (allergen: BackendAllergen): Allergen => ({
  id: allergen.id,
  name: allergen.name,
  description: allergen.description || '',
  altNames: allergen.altNames,
  symptoms: [...allergen.symptoms]
    .sort((a, b) => severityOrder[a.defaultLevel] - severityOrder[b.defaultLevel])
    .map(
      (symptom): AllergenSymptom => ({
        id: symptom.id,
        allergenId: symptom.allergenId,
        allergenName: allergen.name,
        defaultLevel: symptom.defaultLevel,
        symptoms: symptom.symptoms,
        firstAid: symptom.firstAid,
        whenToSeekHelp: symptom.whenToSeekHelp,
      }),
    ),
});

export const fetchAllergens = async (): Promise<Allergen[]> => {
  try {
    const response = await apiClient.get<BackendAllergen[]>('/allergens');
    return response.data.map(mapAllergen);
  } catch (error) {
    console.error('Failed to fetch allergens:', error);
    return [];
  }
};

export const createAllergen = async (allergenData: AllergenPayload): Promise<Allergen> => {
  try {
    const response = await apiClient.post<BackendAllergen>('/allergens', allergenData);
    return mapAllergen(response.data);
  } catch (error) {
    console.error('Failed to create allergen:', error);
    throw error;
  }
};

export const updateAllergen = async (id: number, allergenData: AllergenPayload): Promise<Allergen> => {
  try {
    const response = await apiClient.put<BackendAllergen>(`/allergens/${id}`, allergenData);
    return mapAllergen(response.data);
  } catch (error) {
    console.error('Failed to update allergen:', error);
    throw error;
  }
};

export const deleteAllergen = async (id: number): Promise<void> => {
  await apiClient.delete(`/allergens/${id}`);
};
