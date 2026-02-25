import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
// ✅ แก้ path import ให้ถูกต้อง (ถ้า types อยู่นอก folder context 1 ชั้น)
import { User } from "../types"; 

const STORAGE_KEY = "auth_token";
const USER_KEY = "auth_user_data";

type AuthContextType = {
  token: string | null;
  user: User | null;
  loading: boolean;
  saveToken: (token: string, userData: User) => Promise<void>;
  removeToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  saveToken: async () => {},
  removeToken: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inAuthGroup = segments[0] === "(auth)";

    // Redirect logic
    if (token && inAuthGroup) {
      // router.replace("/(tabs)"); 
    } else if (!token && inTabsGroup) {
      // ✅ แก้ Path ตรงนี้: ตัด (auth) ออก และใช้ชื่อไฟล์ login
      router.replace("/login"); 
    }
  }, [token, loading, segments, router]);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load auth data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToken = async (newToken: string, userData: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  };

  const removeToken = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      
      // ✅ แก้ Path ตรงนี้เหมือนกัน
      router.replace("/login"); 
    } catch (error) {
      console.error("Failed to remove auth data:", error);
    }
  };

  const authContextValue = {
    token,
    user,
    loading,
    saveToken,
    removeToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};