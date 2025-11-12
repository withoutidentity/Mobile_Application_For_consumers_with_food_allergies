import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExpoRoot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/context/AuthContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import "./global.css";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            {/* @ts-expect-error */}
            <ExpoRoot />
          </GestureHandlerRootView>
        </AuthProvider>
      </UserProfileProvider>
    </QueryClientProvider>
  );
}
