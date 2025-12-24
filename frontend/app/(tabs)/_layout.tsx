import { Tabs } from "expo-router";
import {
  AlertCircle,
  Home,
  Settings,
  MessageCircle,
  Scan,
  Database,
  Shield,
} from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";

// 1. นำ import กลับมาเพื่อเช็ค Role
import { useUserProfile } from "@/context/UserProfileContext";
import Colors from "@/constants/Colors";

export default function TabLayout() {
  // 2. ดึงข้อมูล Profile เพื่อเช็คว่าเป็น Admin หรือไม่
  const { profile } = useUserProfile();

  // ตรวจสอบ Role (ใช้ Optional chaining ?. ป้องกัน error กรณี profile ยังไม่โหลด)
  const isAdmin = true;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#E5E5E5",
          height: 60, // ปรับความสูงเล็กน้อยเพื่อให้สวยงามขึ้น
          paddingBottom: 8,
          paddingTop: 8,
        },
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
          tabBarIcon: ({ color }) => <Scan size={30} color={color} />,
          tabBarButton: ({ onPress }) => (
            <TouchableOpacity
              onPress={onPress}
              style={{
                top: -20, // ขยับขึ้นอีกนิดให้เด่น
                backgroundColor: "#2A9D8F",
                borderRadius: 40,
                width: 70,
                height: 70,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 8,
              }}
            >
              <Scan size={36} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 🛡️ Admin Tab */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          // ❌ ลบบรรทัดนี้ทิ้ง: href: "/(tabs)/admin", 
          // ✅ ถ้าอยากใส่เพื่อให้สลับ Logic ในอนาคต ให้ใช้แบบนี้:
          href: isAdmin ? undefined : null, 
          
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
        }}
      />

      {/* 💬 Chat */}
      <Tabs.Screen
        name="chat"
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

      {/* --- Hidden Routes (เข้าถึงได้แต่ไม่โชว์ปุ่มใน Bar) --- */}
      <Tabs.Screen
        name="allergens"
        options={{
          href: null,
          title: "Manage Allergens",
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: null,
          title: "Manage Products",
          tabBarIcon: ({ color }) => <Database size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
