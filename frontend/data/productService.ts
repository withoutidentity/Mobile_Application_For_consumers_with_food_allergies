import { Product } from '@/types';
import axios from 'axios';

// ประเภทข้อมูลที่ได้รับจาก Backend โดยตรง
type BackendProduct = Omit<Product, 'allergenWarnings' | 'id' | 'image'> & {
  id: number; // id จาก DB เป็น number
  imageUrl?: string;
  allergens: { allergen: { altNames: string[] } }[];
};

// ใช้ IP Address ของเครื่องคอมพิวเตอร์ของคุณแทน 'localhost'
// เนื่องจาก Emulator/Device ไม่รู้จัก 'localhost'
// คุณสามารถหา IP ของคุณได้โดยใช้คำสั่ง 'ipconfig' (Windows) หรือ 'ifconfig' (macOS/Linux)
const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<BackendProduct[]>('/products');
  const backendProducts = response.data;

  // แปลงข้อมูลจาก Backend ให้ตรงกับ Type ของ Frontend
  const frontendProducts: Product[] = backendProducts.map((product) => {
    // แปลง allergens ที่เป็น object array ให้เป็น allergenWarnings ที่เป็น string array
    // โดยดึงค่าจาก altNames ของแต่ละ allergen
    const allergenWarnings = product.allergens.flatMap(
      (pa) => pa.allergen.altNames
    );

    return {
      ...product,
      id: product.id, //
      image: product.imageUrl, // เปลี่ยนชื่อ property จาก imageUrl เป็น image
      allergenWarnings: allergenWarnings,
    };
  });

  return frontendProducts;
};

export default getProducts;