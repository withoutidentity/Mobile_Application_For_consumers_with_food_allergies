import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    void loadToken();
  }, []);

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
    } catch (error) {
      console.error("Failed to remove auth data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        saveToken,
        removeToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
