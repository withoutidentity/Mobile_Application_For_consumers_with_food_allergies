import { Tabs } from "expo-router";
import {
  AlertCircle,
  Home,
  Settings,
  MessageCircle,
  Scan,
  Database, 
  Shield 
} from "lucide-react-native";
import React from "react";
import { Text, View, TouchableOpacity, Platform } from "react-native";
// ไม่จำเป็นต้องเช็ค admin ในไฟล์นี้แล้ว
// import { useUserProfile } from "@/context/UserProfileContext"; 
import Colors from '@/constants/Colors';


export default function TabLayout() {
  // ไม่ต้องเช็ค isAdmin ที่นี่
  // const { profile } = useUserProfile();
  // const isAdmin = profile.role === 'ADMIN';

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
                top: -15,
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

      {/* --- นี่คือส่วนที่แก้ไข --- */}
      {/* ลบ {isAdmin && ...} ออก แล้วเพิ่ม href: null แทน */}
      <Tabs.Screen
        name="allergens"
        options={{
          href: null, // <-- ซ่อนจาก Tab Bar
          title: "Manage Allergens",
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: null, // <-- ซ่อนจาก Tab Bar
          title: "Manage Products",
          tabBarIcon: ({ color }) => <Database size={24} color={color} />,
        }}
      />
      
    </Tabs>
  );
}