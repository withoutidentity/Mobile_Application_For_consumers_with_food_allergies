import { Product } from '@/types';
import axios from 'axios';

type BackendProduct = Omit<Product, 'allergenWarnings' | 'id' | 'image'> & {
  id: number;
  barcode: string;
  imageUrl?: string;
  allergens: { allergen: { id: number; name: string; altNames: string[] } }[];
};

export type ProductPayload = {
  name: string;
  brand: string;
  barcode: string;
  ingredients: string[];
  allergenWarningIds: number[];
  image?: string;
};

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

  return backendProducts.map((product) => ({
    ...product,
    id: product.id,
    image: product.imageUrl,
    allergenWarnings: product.allergens.map((item) => item.allergen.name),
  }));
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
