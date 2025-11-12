import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "./global.css";

// ป้องกันไม่ให้ Splash Screen หายไปเอง
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // ถ้าไม่ loading แล้ว (เช็ก auth เสร็จแล้ว)
    if (!loading) {
      // 1. ซ่อน Splash Screen
      SplashScreen.hideAsync();

      const inAuthGroup = segments[0] === "(auth)";

      // 2. ตรวจสอบและ Redirect
      if (token && inAuthGroup) {
        // ถ้ามี token (ล็อกอินแล้ว) แต่ยังอยู่หน้า (auth)
        // ให้เด้งไปหน้า (tabs)
        router.replace("/(tabs)");
      } else if (!token && !inAuthGroup) {
        // ถ้าไม่มี token (ยังไม่ล็อกอิน) แต่อยู่นอกหน้า (auth)
        // ให้เด้งไปหน้า (auth)
        router.replace("/(auth)");
      }
    }
  }, [loading, token, segments, router]); // ให้ useEffect ทำงานใหม่เมื่อค่าเหล่านี้เปลี่ยน

  // 3. ถ้ายัง loading, return null
  //    (Splash Screen จะยังแสดงผลอยู่)
  if (loading) {
    return null;
  }

  // 4. เมื่อ loading เสร็จ, ค่อย return <Stack>
  //    ตอนนี้ LinkingContext จะพร้อมใช้งาน
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        {/* คุณสามารถเพิ่มหน้าอื่นๆ ที่อยู่นอก (tabs) และ (auth) ที่นี่ได้
          เช่น: <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        */}
      </Stack>
    </SafeAreaView>
  );
}

// นี่คือ Default Export หลัก
export default function RootLayout() {
  // ⛔️ ไม่ต้องมี useEffect ซ่อน Splash Screen ตรงนี้แล้ว
  //    เราย้ายมันเข้าไปใน RootLayoutNav แล้ว

  // Provider ทั้งหมดวางไว้ที่นี่ ถูกต้องแล้วครับ
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
