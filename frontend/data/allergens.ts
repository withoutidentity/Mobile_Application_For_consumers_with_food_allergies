import { Allergen } from '@/types';
import axios from 'axios';

// ประเภทข้อมูล Allergen ที่ได้รับจาก Backend
type BackendAllergen = {
  id: number;
  name: string;
  altNames: string[];
  description: string | null;
  defaultLevel: 'LOW' | 'MEDIUM' | 'HIGH';
};

// API Client (ควรจะแยกไปไฟล์กลางถ้ามีการใช้งานหลายที่)
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let allergens: Allergen[] = [];

export const fetchAllergens = async (): Promise<Allergen[]> => {
  try {
    const response = await apiClient.get<BackendAllergen[]>('/api/allergens');
    const backendAllergens = response.data;

    // แปลงข้อมูลจาก Backend ให้ตรงกับ Type ของ Frontend
    const frontendAllergens: Allergen[] = backendAllergens.map((allergen) => ({
      id: allergen.id,
      name: allergen.name,
      description: allergen.description || '',
      altNames: allergen.altNames,
      defaultLevel: allergen.defaultLevel,
    }));

    allergens = frontendAllergens;
    return allergens;
  } catch (error) {
    console.error('Failed to fetch allergens:', error);
    return []; // คืนค่า array ว่างในกรณีที่เกิดข้อผิดพลาด
  }
};

// เรียกใช้ฟังก์ชันเพื่อดึงข้อมูลเมื่อแอปเริ่มทำงาน
fetchAllergens();

export default allergens;