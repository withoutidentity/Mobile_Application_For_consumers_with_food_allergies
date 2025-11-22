import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { UserProfileProvider, useUserProfile } from "@/context/UserProfileContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "./global.css";

// ป้องกันไม่ให้ Splash Screen หายไปเอง
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// สร้าง Route Map เพื่อกำหนดสิทธิ์การเข้าถึง
const protectedRoutes: Record<string, string[]> = {
  // 'ชื่อโฟลเดอร์หรือไฟล์': ['ROLE_ที่เข้าได้']
  'chat': ['USER'], // สมมติว่ามีหน้า /admin-dashboard
};

function RootLayoutNav() {
  const { token, loading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const isAuthLoading = loading || profileLoading;

    // ถ้าไม่ loading แล้ว (เช็ก auth และ profile เสร็จแล้ว)
    if (!isAuthLoading) {
      SplashScreen.hideAsync();

      const inAuthGroup = segments[0] === "(auth)";
      const currentRoute = segments[segments.length - 1];

      // 1. จัดการผู้ใช้ที่ยังไม่ได้ล็อกอิน
      if (!token) {
        if (!inAuthGroup) {
          // ถ้าไม่มี token และไม่ได้อยู่ในกลุ่ม (auth), ให้ไปหน้า login
          router.replace("/login");
        }
        return; // หยุดการทำงานส่วนที่เหลือ
      }

      // 2. จัดการผู้ใช้ที่ล็อกอินแล้ว
      if (inAuthGroup) {
        // ถ้ามี token แต่ยังอยู่ในกลุ่ม (auth), ให้ไปหน้าหลัก
        router.replace("/(tabs)");
        return;
      }

      // 3. ตรวจสอบ Role สำหรับหน้าที่ต้องการป้องกัน
      const requiredRoles = protectedRoutes[currentRoute];
      if (requiredRoles && !requiredRoles.includes(profile.role)) {
        // ถ้าหน้านี้ต้องการ Role แต่ผู้ใช้ไม่มี Role ที่กำหนด
        // ให้ redirect ไปหน้า forbidden
        router.replace('/forbidden');
      }
    }
  }, [loading, profileLoading, token, profile, segments, router]);

  // ถ้ายัง loading auth หรือ profile, ให้แสดง Splash Screen ต่อไป
  if (loading || profileLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: "#2A9D8F",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "600",
      },
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="forbidden" options={{ title: "Forbidden" }} />
      <Stack.Screen name="symptom/[allergen]" options={{ title: "Symptoms" }} />
      <Stack.Screen name="product/[id]" options={{ title: "Product Details" }} />
   </Stack>
  );
}

// นี่คือ Default Export หลัก
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProfileProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <RootLayoutNav />
          </GestureHandlerRootView>
        </UserProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/**
 * หมายเหตุ:
 * 1. คุณต้องเพิ่ม field 'role' ใน UserProfile type และในข้อมูลที่ดึงมาจาก getMyProfile()
 *    เพื่อให้ `profile.role` สามารถใช้งานได้
 *
 * 2. ในไฟล์ `app/_layout.tsx` คุณต้องเพิ่มหน้าใหม่ๆ ที่สร้างนอกกลุ่ม (auth) และ (tabs)
 *    เข้าไปใน <Stack> ด้วย เช่น <Stack.Screen name="types" />
 *
 * 3. หากต้องการสร้างหน้า /types ให้สร้างไฟล์ `app/types.tsx`
 *    ตัวอย่าง:
 *    // app/types.tsx
 *    import { View, Text } from 'react-native';
 *    export default function TypesScreen() {
 *      return <View><Text>Types Management Page</Text></View>;
 *    }
 *
 */
