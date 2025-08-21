import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

export default function LogoutScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout().then(() => {
      router.replace("/(auth)/login");
    });
  }, []);

  return null;
}
