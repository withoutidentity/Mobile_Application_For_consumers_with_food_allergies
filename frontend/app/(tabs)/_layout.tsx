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

      {/* 💊 Symptoms */}
      <Tabs.Screen
        name="guide"
        options={{
          title: "Symptoms",
          tabBarIcon: ({ color }) => <AlertCircle size={24} color={color} />,
        }}
      />

      {/* 📷 Scan */}
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => <Scan size={30} color={color} />, // ส่วนนี้จริงๆ ไม่ได้ใช้
          
          // vvv ส่วนนี้คือพระเอกของงาน vvv
          tabBarButton: ({ onPress }) => (
            <TouchableOpacity
              onPress={onPress}
              style={{
                top: -15, // 1. ดันปุ่มให้ลอยขึ้นไปด้านบน 15px
                backgroundColor: "#2A9D8F", // 2. ใส่สีพื้นหลัง
                borderRadius: 40, // 3. ทำให้ขอบมน (คู่กับ width/height เพื่อให้เป็นวงกลม)
                width: 70,        // 4. กำหนดขนาด
                height: 70,       // 5. กำหนดขนาด
                justifyContent: "center",
                alignItems: "center",
                // ... ส่วนที่เหลือคือการใส่เงา (Shadow/Elevation)
              }}
            >
              <Scan size={36} color="white" /> 
            </TouchableOpacity>
          ),
        }}
      />

      {/* 💬 Chat */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "chat",
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
