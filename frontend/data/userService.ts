import { UserProfile } from '@/types';
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
  if (!token){
    console.log("No auth token found in storage.");
  }
  return config;
});
 
// Backend user data might look different
type BackendUser = {
  id: number;
  name: string;
  email: string;
  emergencyContact: string | null;
  dietaryRestrictions: string[];
  // ปรับ Type ให้ตรงกับข้อมูลใหม่จาก Backend
  allergies: {
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    allergen: {
      id: number;
      name: string;
    };
  }[];
};

export const getMyProfile = async (): Promise<UserProfile> => { 
  const response = await apiClient.get<BackendUser>('/users/me');
  const user = response.data;

  // Transform backend data to frontend UserProfile
  return {
    name: user.name,
    emergencyContact: user.emergencyContact || undefined,
    dietaryRestrictions: user.dietaryRestrictions,
    // เปลี่ยนการ map ข้อมูลให้ถูกต้อง
    allergens: user.allergies.map(a => ({ allergenId: a.allergen.id, severity: a.severity })),
  };
};
 
export const updateUserAllergens = async (
  allergies: { allergenId: number; severity: 'LOW' | 'MEDIUM' | 'HIGH' }[]
): Promise<void> => {
  if (!Array.isArray(allergies)) {
    console.error("Invalid allergies format:", allergies);
    return;
  }

  console.log("Sending updated allergies:", JSON.stringify(allergies, null, 2));

  await apiClient.put('/users/me/allergies', { allergies });
};