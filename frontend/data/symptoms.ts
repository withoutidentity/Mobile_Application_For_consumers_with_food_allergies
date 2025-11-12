import { AllergenSymptom } from '@/types';
import axios from 'axios';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ประเภทข้อมูลที่ได้รับจาก Backend
type BackendAllergen = {
  id: number;
  name: string;
  symptoms: {
    allergenId: number;
    symptoms: string[];
    firstAid: string[];
    whenToSeekHelp: string[];
  } | null;
};

let allergenSymptoms: AllergenSymptom[] = [];

export const fetchSymptoms = async (): Promise<AllergenSymptom[]> => {
  try {
    const response = await apiClient.get<BackendAllergen[]>('/allergens');
    const backendAllergens = response.data;

    // แปลงข้อมูลจาก Backend ให้ตรงกับ Type AllergenSymptom ของ Frontend
    const frontendSymptoms: AllergenSymptom[] = backendAllergens
      .filter(allergen => allergen.symptoms) // กรองเอาเฉพาะรายการที่มีข้อมูล symptoms
      .map(allergen => ({
        allergenId: allergen.id, // ใช้ ID ที่เป็น number จาก API
        allergenName: allergen.name,
        symptoms: allergen.symptoms!.symptoms,
        firstAid: allergen.symptoms!.firstAid,
        whenToSeekHelp: allergen.symptoms!.whenToSeekHelp,
      }));

    allergenSymptoms = frontendSymptoms;
    return allergenSymptoms;
  } catch (error) {
    console.error('Failed to fetch allergen symptoms:', error);
    return []; // คืนค่า array ว่างในกรณีที่เกิดข้อผิดพลาด
  }
};

// เรียกใช้ฟังก์ชันเพื่อดึงข้อมูลเมื่อแอปเริ่มทำงาน
fetchSymptoms();

export default allergenSymptoms;