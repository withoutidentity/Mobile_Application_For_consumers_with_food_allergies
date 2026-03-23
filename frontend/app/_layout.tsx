import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";

import { AppProviders } from "@/components/AppProviders";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/context/UserProfileContext";
import "./global.css";

// Keep the native splash screen visible until auth bootstrap finishes.
SplashScreen.preventAutoHideAsync();

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

  useEffect(() => {
    const isBootstrapping = loading || profileLoading;

    if (isBootstrapping) {
      return;
    }

    void SplashScreen.hideAsync();

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

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
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
      <Stack.Screen name="forbidden" options={{ title: "Forbidden" }} />
      <Stack.Screen name="symptom/[allergen]" options={{ title: "Symptoms" }} />
      <Stack.Screen name="product/[id]" options={{ title: "Product Details" }} />
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
