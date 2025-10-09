import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }
  }, [token, loading, router]);

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
    setToken(newToken);
    await AsyncStorage.setItem(STORAGE_KEY, newToken);
  };

  const removeToken = async () => {
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
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
