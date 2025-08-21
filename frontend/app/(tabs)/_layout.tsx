import { Tabs } from "expo-router";
import { AlertCircle, Scan, Settings, User } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#2A9D8F" }, // สี primary
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: "#E5E5E5" }, // สี card + border
        tabBarActiveTintColor: "#2A9D8F",   // สี active
        tabBarInactiveTintColor: "#ccc",     // สี inactive
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Scan size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: "Symptoms",
          tabBarIcon: ({ color }) => <AlertCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
