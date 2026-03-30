import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_API_URL = `${process.env.EXPO_PUBLIC_API_URL}/auth`;

const authClient = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: "ADMIN" | "USER";
  };
};

export const loginUser = async (email: string, password: string) => {
  const response = await authClient.post<LoginResponse>("/login", {
    email,
    password,
  });

  return response.data;
};

export const requestPasswordResetCode = async (email: string) => {
  const response = await authClient.post<{ message: string }>("/forgot-password", { email });
  return response.data;
};

export const resetPasswordWithCode = async (email: string, code: string, newPassword: string) => {
  const response = await authClient.post<{ message: string }>("/reset-password", {
    email,
    code,
    newPassword,
  });

  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await authClient.post<{ message: string }>("/change-password", {
    currentPassword,
    newPassword,
  });

  return response.data;
};
