import { Tabs } from "expo-router";
import {
  AlertCircle,
  Home,
  Settings,
  MessageCircle,
  Scan,
} from "lucide-react-native";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

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
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#2A9D8F",
        tabBarInactiveTintColor: "#ccc",
      }}
    >
      {/* 🏠 Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => <Scan size={30} color={color} />,
          tabBarButton: ({ onPress }) => (
            <TouchableOpacity
              onPress={onPress}
              style={{
                top: -15,
                backgroundColor: "#2A9D8F",
                borderRadius: 40,
                width: 70,
                height: 70,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <Scan size={36} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 💊 Symptoms */}
      <Tabs.Screen
        name="guide"
        options={{
          title: "Symptoms",
          tabBarIcon: ({ color }) => <AlertCircle size={24} color={color} />,
        }}
      />

      {/* 💬 Chat */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />

      {/* ⚙️ Settings */}
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
