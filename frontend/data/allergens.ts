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

// Dictionary สำหรับแปลชื่อสารก่อภูมิแพ้จากอังกฤษเป็นไทย (ใช้ key เป็นตัวพิมพ์เล็กเพื่อให้ค้นหาง่าย)
export const allergenTranslations: Record<string, string> = {
  'milk': 'นม',
  'eggs': 'ไข่',
  'fish': 'ปลา',
  'crustacean shellfish': 'สัตว์น้ำที่มีเปลือกแข็ง',
  'shellfish': 'สัตว์น้ำที่มีเปลือกแข็ง',
  'tree nuts': 'ถั่วที่มีเปลือกแข็ง',
  'peanuts': 'ถั่วลิสง',
  'peanut': 'ถั่วลิสง',
  'wheat': 'ข้าวสาลี',
  'soy': 'ถั่วเหลือง',
  'soybeans': 'ถั่วเหลือง',
  'sesame': 'งา',
  'gluten': 'กลูเตน',
  // เพิ่มคำแปลอื่นๆ ให้ตรงกับข้อมูลที่มีในฐานข้อมูลของคุณได้เลยครับ
};

export const fetchAllergens = async (): Promise<Allergen[]> => {
  try {
    const response = await apiClient.get<BackendAllergen[]>('/api/allergens');
    const backendAllergens = response.data;

    // แปลงข้อมูลจาก Backend ให้ตรงกับ Type ของ Frontend
    const frontendAllergens: Allergen[] = backendAllergens.map((allergen) => ({
      id: allergen.id,
      // แปลงชื่อให้เป็นตัวเล็กก่อนไปหาใน Dictionary ถ้าไม่เจอให้ใช้ชื่อต้นฉบับ
      name: allergenTranslations[allergen.name.toLowerCase()] || allergen.name,
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