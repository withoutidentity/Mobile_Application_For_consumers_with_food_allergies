import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChatRequest = {
  message: string;
  barcode?: string;
  userAllergenIds?: number[];
};

export type ChatResponse =
  | {
      mode: "PRODUCT";
      safety: "SAFE" | "UNSAFE";
      ruleReason: string;
      matchedAllergens: string[];
      reply: string;
      product: {
        source: "LOCAL" | "NONE";
        barcode?: string;
        name?: string;
        brand?: string;
        ingredientsText?: string;
        allergensTags?: string[];
        tracesTags?: string[];
      };
    }
  | {
      mode: "CONSULT";
      reply: string;
    };

export type ChatHistoryMessage = {
  id: number;
  sender: "USER" | "BOT";
  text: string;
  safety?: "SAFE" | "UNSAFE" | null;
  createdAt: string;
};

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendChatMessage = async (payload: ChatRequest): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>("/chat", payload);
  return response.data;
};

export const getChatHistory = async (): Promise<ChatHistoryMessage[]> => {
  const response = await apiClient.get<ChatHistoryMessage[]>("/chat/history");
  return response.data;
};
