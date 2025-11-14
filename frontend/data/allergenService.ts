import { Allergen, Severity } from '@/types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Type สำหรับข้อมูลที่ส่งไปสร้างหรืออัปเดต
export type AllergenPayload = {
  name: string;
  description: string;
  altNames: string[];
  defaultLevel: Severity;
};

/**
 * ดึงข้อมูลสารก่อภูมิแพ้ทั้งหมด
 */
export const fetchAllergens = async (): Promise<Allergen[]> => {
  try {
    const response = await apiClient.get<Allergen[]>('/allergens');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch allergens:', error);
    return [];
  }
};

/**
 * สร้างสารก่อภูมิแพ้ใหม่
 */
export const createAllergen = async (allergenData: AllergenPayload): Promise<Allergen> => {
  const response = await apiClient.post<Allergen>('/allergens', allergenData);
  return response.data;
};

/**
 * อัปเดตข้อมูลสารก่อภูมิแพ้
 */
export const updateAllergen = async (id: number, allergenData: AllergenPayload): Promise<Allergen> => {
  const response = await apiClient.put<Allergen>(`/allergens/${id}`, allergenData);
  return response.data;
};

/**
 * ลบสารก่อภูมิแพ้
 */
export const deleteAllergen = async (id: number): Promise<void> => {
  await apiClient.delete(`/allergens/${id}`);
};