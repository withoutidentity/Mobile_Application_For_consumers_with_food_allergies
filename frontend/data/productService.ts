import { Product } from '@/types';
import { resolveProductImageUri } from '@/utils/productImage';
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
  imageFile?: {
    uri: string;
    name: string;
    type: string;
  } | null;
  removeImage?: boolean;
};

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mapBackendProduct = (product: BackendProduct): Product => ({
  ...product,
  id: product.id,
  image: resolveProductImageUri(product.imageUrl),
  allergenWarnings: product.allergens.map((item) => item.allergen.name),
});

const buildProductFormData = (productData: ProductPayload) => {
  const formData = new FormData();

  formData.append('name', productData.name);
  formData.append('brand', productData.brand);
  formData.append('barcode', productData.barcode);
  formData.append('ingredients', JSON.stringify(productData.ingredients));
  formData.append('allergenWarningIds', JSON.stringify(productData.allergenWarningIds));

  if (productData.removeImage) {
    formData.append('removeImage', 'true');
  }

  if (productData.imageFile) {
    formData.append('image', productData.imageFile as any);
  }

  return formData;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<BackendProduct[]>('/products');
  return response.data.map(mapBackendProduct);
};

export const createProduct = async (productData: ProductPayload): Promise<Product> => {
  const response = await apiClient.post<BackendProduct>('/products', buildProductFormData(productData), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return mapBackendProduct(response.data);
};

export const updateProduct = async (id: number, productData: ProductPayload): Promise<Product> => {
  const response = await apiClient.put<BackendProduct>(`/products/${id}`, buildProductFormData(productData), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return mapBackendProduct(response.data);
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

export const findProductByBarcode = (barcode: string, products: Product[]): Product | undefined => {
  return products.find((product) => product.barcode === barcode);
};

export default getProducts;
