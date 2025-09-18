import { Tabs } from "expo-router";
import { AlertCircle, Home, Settings, MessageCircle } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        header: ({ options }) => (
          <View className="bg-teal-600 px-4 py-3">
            <Text className="text-white font-semibold text-lg">
              {options.title}
            </Text>
          </View>
        ),
        tabBarStyle: {
          height: 60,
        },
        tabBarActiveTintColor: "#2A9D8F",
        tabBarInactiveTintColor: "#ccc",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
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
