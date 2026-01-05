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
import { TouchableOpacity } from "react-native";
import { useUserProfile } from "@/context/UserProfileContext";
import Colors from "@/constants/Colors";

export default function TabLayout() {
  const { profile } = useUserProfile();
  
  // ✅ ตรวจสอบ Role: ADMIN
  const isAdmin = profile?.role === 'ADMIN'; 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: true,
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "#fff",
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' }
      }}
    >
      {/* --------------------------------------------------------- */}
      {/* 📦 ZONE ADMIN: แสดงเฉพาะ Admin                            */}
      {/* --------------------------------------------------------- */}

      <Tabs.Screen
        name="products"
        options={{
          title: "Manage Products",
          href: isAdmin ? undefined : null, 
          tabBarIcon: ({ color }) => <Database size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="allergens"
        options={{
          title: "Manage Allergens",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
        }}
      />

      {/* --------------------------------------------------------- */}
      {/* 🏠 ZONE USER: แสดงเฉพาะ User (Admin ไม่เห็น)              */}
      {/* --------------------------------------------------------- */}

      {/* 1. Home (ซ้ายสุด) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      {/* 2. Symptoms (ย้ายมาไว้ตรงนี้ เพื่อดัน Scan ไปตรงกลาง) */}
      <Tabs.Screen
        name="guide"
        options={{
          title: "Symptoms",
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) => <AlertCircle size={24} color={color} />,
        }}
      />

      {/* 3. Scan (อยู่ตรงกลางแล้ว เพราะเป็นลำดับที่ 3) */}
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scan",
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) => <Scan size={30} color={color} />,
          
          tabBarButton: isAdmin 
            ? undefined 
            : (props) => (
                <TouchableOpacity
                  {...(props as any)} 
                  style={{
                    top: -20, // ดันปุ่มลอยขึ้นมา
                    backgroundColor: "#2A9D8F",
                    borderRadius: 40,
                    width: 70,
                    height: 70,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    elevation: 8,
                  }}
                >
                  <Scan size={36} color="white" />
                </TouchableOpacity>
              ),
        }}
      />

      {/* 4. Chat (ขวา) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />

      {/* --------------------------------------------------------- */}
      {/* ⚙️ COMMON ZONE: เห็นทั้งคู่                                */}
      {/* --------------------------------------------------------- */}
      
      {/* 5. Settings (ขวาสุด) */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: undefined, 
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />

      <Tabs.Screen name="admin" options={{ href: null }} />

    </Tabs>
  );
}