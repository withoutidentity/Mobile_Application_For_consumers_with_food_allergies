import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";

import { AppProviders } from "@/components/AppProviders";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/context/UserProfileContext";
import "./global.css";

// Keep the native splash screen visible until auth bootstrap finishes.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go can warn if splash handling has already been initialized.
});

const routeRoleRequirements: Record<string, string[]> = {
  admin: ["ADMIN"],
  products: ["ADMIN"],
  allergens: ["ADMIN"],
  index: ["USER"],
  guide: ["USER"],
  scanner: ["USER"],
  chat: ["USER"],
};

function RootLayoutNav() {
  const { token, loading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const router = useRouter();
  const segments = useSegments();
  const hasHiddenSplashRef = useRef(false);

  useEffect(() => {
    const isBootstrapping = loading || profileLoading;

    if (isBootstrapping) {
      return;
    }

    if (!hasHiddenSplashRef.current) {
      hasHiddenSplashRef.current = true;
      void SplashScreen.hideAsync().catch(() => {
        // Expo Go may not have a registered native splash on subsequent renders.
      });
    }

    const inAuthGroup = segments[0] === "(auth)";
    const currentRoute = segments[segments.length - 1];
    const normalizedRole = profile?.role?.toUpperCase();

    if (!token) {
      if (!inAuthGroup) {
        router.replace("/login");
      }
      return;
    }

    if (inAuthGroup) {
      if (!profile || !profile.role || !profile.email) {
        return;
      }

      if (normalizedRole === "ADMIN") {
        router.replace("/(tabs)/admin");
      } else {
        router.replace("/(tabs)");
      }
      return;
    }

    if (normalizedRole === "ADMIN") {
      const inTabs = segments[0] === "(tabs)";
      const isAtHome =
        inTabs && (segments.length === 1 || (segments[1] as string) === "index");

      if (isAtHome) {
        router.replace("/(tabs)/admin");
        return;
      }
    }

    const requiredRoles = routeRoleRequirements[currentRoute];
    if (requiredRoles && !normalizedRole) {
      return;
    }

    if (requiredRoles && !requiredRoles.includes(normalizedRole!)) {
      if (normalizedRole === "ADMIN") {
        router.replace("/(tabs)/admin");
      } else {
        router.replace("/forbidden");
      }
    }
  }, [loading, profileLoading, token, profile, segments, router]);

  if (loading || profileLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "กลับ",
        headerStyle: {
          backgroundColor: "#2A9D8F",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      <Stack.Screen name="forbidden" options={{ title: "ไม่มีสิทธิ์เข้าถึง" }} />
      <Stack.Screen name="symptom/[allergen]" options={{ title: "รายละเอียดอาการแพ้" }} />
      <Stack.Screen name="product/[id]" options={{ title: "รายละเอียดสินค้า" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}
