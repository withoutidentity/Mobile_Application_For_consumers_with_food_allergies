import { ExpoRoot } from "expo-router";
import React from "react";

import { AppProviders } from "@/components/AppProviders";
import "./global.css";

export default function App() {
  return (
    <AppProviders>
      {/* ExpoRoot injects the router tree when _app.tsx is used. */}
      {/* @ts-expect-error Expo Router injects props internally. */}
      <ExpoRoot />
    </AppProviders>
  );
}
