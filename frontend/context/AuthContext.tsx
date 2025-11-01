import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

const STORAGE_KEY = "auth_token";

type AuthContextType = {
  token: string | null;
  loading: boolean;
  saveToken: (token: string) => Promise<void>;
  removeToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  loading: true,
  saveToken: async () => {},
  removeToken: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    console.log(`[AuthContext] useEffect triggered. Loading: ${loading}, Token: ${!!token}, Segments: ${segments.join('/')}`);
    // รอให้การโหลด token ครั้งแรกเสร็จก่อน (loading === false)
    if (loading) {
      console.log("[AuthContext] Still loading, skipping redirect logic.");
      return;
    }

    const inTabsGroup = segments[0] === "(tabs)";
    console.log(`[AuthContext] Is in (tabs) group? ${inTabsGroup}`);

    // Redirect logic นี้จะทำงานเฉพาะตอนเปิดแอปครั้งแรก หรือตอน logout
    // การ redirect ตอน login จะถูกจัดการใน saveToken()
    if (token && !inTabsGroup) {
      console.log("[AuthContext] Has token, but not in tabs group. Redirecting to /(tabs)...");
      // router.replace("/(tabs)");
    } else if (!token && inTabsGroup) {
      console.log("[AuthContext] No token, but in tabs group. Redirecting to /login...");
      // ถ้าไม่มี token แต่อยู่ในหน้า (tabs), ให้ redirect ไป login
      router.replace("/login");
    }
  }, [token, loading, segments, router]);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to load token:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToken = async (newToken: string) => {
    await AsyncStorage.setItem(STORAGE_KEY, newToken);
    // อัปเดต state ก่อน
    setToken(newToken);
    // แล้วสั่ง redirect ไปหน้าหลักทันที
    // router.replace("/(tabs)");
  };

  const removeToken = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setToken(null);
    // เมื่อ logout ให้กลับไปหน้า login
    router.replace("/login");
  };

  const authContextValue = {
    token,
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
