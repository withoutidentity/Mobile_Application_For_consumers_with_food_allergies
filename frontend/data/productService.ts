import { Product } from '@/types';
import axios from 'axios';

// ประเภทข้อมูลที่ได้รับจาก Backend โดยตรง
type BackendProduct = Omit<Product, 'allergenWarnings' | 'id' | 'image'> & {
  id: number; // id จาก DB เป็น number
  barcode: string;
  imageUrl?: string;
  allergens: { allergen: { altNames: string[] } }[];
};

// ใช้ IP Address ของเครื่องคอมพิวเตอร์ของคุณแทน 'localhost'
// เนื่องจาก Emulator/Device ไม่รู้จัก 'localhost'
// คุณสามารถหา IP ของคุณได้โดยใช้คำสั่ง 'ipconfig' (Windows) หรือ 'ifconfig' (macOS/Linux)

export type ProductPayload = {
  name: string;
  brand: string;
  barcode: string;
  ingredients: string[];
  allergenWarnings: string[]; // เพิ่มฟิลด์นี้เพื่อให้ตรงกับ payload ที่ Frontend ส่งไป
  image?: string; // เพิ่มฟิลด์นี้เพื่อให้ตรงกับ payload ที่ Frontend ส่งไป
}
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

export const createProduct = async (productData: ProductPayload): Promise<Product> => {
  const response = await apiClient.post<Product>('/products', productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: ProductPayload): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

export const findProductByBarcode = (barcode: string, products: Product[]): Product | undefined => {
  return products.find((product) => product.barcode === barcode);
};




export default getProducts;