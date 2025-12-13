import Button from "@/components/Button";
import { useUserProfile } from "@/context/UserProfileContext";
import { useRouter } from "expo-router";
import { 
  Bell, 
  HelpCircle, 
  // Moon, // ไม่ได้ใช้ Moon ในโค้ดตัวอย่างนี้ (คอมเมนต์ไว้ก่อนได้)
  // Trash2, 
  User, 
  ShieldCheck, 
  Package,       
  AlertTriangle  
} from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function SettingsScreen() {
  const router = useRouter();
  
  // 1. ดึง user ออกมาด้วย (เพิ่ม { user, ... })
  const { removeToken, user } = useAuth(); 
  
  const { profile, saveProfile } = useUserProfile();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    Alert.alert("เร็วๆ นี้", "โหมดกลางคืนจะพร้อมใช้งานในอัปเดตถัดไป");
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    Alert.alert(
      "เร็วๆ นี้",
      "การตั้งค่าการแจ้งเตือนจะพร้อมใช้งานในอัปเดตถัดไป"
    );
  };

  const handleLogout = () => {
    removeToken();
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F8F9FA]"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-[#666666] mb-2">
          การตั้งค่า
        </Text>
        <Text className="text-base text-[#666666]">
          ปรับแต่งประสบการณ์ของคุณ
        </Text>
      </View>

      {/* Profile User  */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">
          โปรไฟล์
        </Text>
        {/* ข้อมูลผู้ใช้  */}
        <Pressable
          className="flex-row items-center py-3 border-b border-[#E5E5E5]"
          onPress={() => router.push("/user-profile")}
        >
          <User size={20} color="#333333" className="mr-3" />
          <Text className="text-base text-[#333333]">
            โปรไฟล์ประวัติส่วนตัว
          </Text>
        </Pressable>
        {/* หน้ากรอกสารก่อภูมิแพ้  */}
        <Pressable
          className="flex-row items-center py-3"
          onPress={() => router.push("/allergen-profile")}
        >
          <ShieldCheck size={20} color="#333333" className="mr-3" />
          <Text className="text-base text-[#333333]">โปรไฟล์สารก่อภูมิแพ้</Text>
        </Pressable>
      </View>

      {/* Notifications */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">
          การแจ้งเตือน
        </Text>
        <View className="flex-row justify-between items-center border-b border-[#E5E5E5] py-3">
          <View className="flex-row items-center flex-1">
            <Bell size={20} color="#333333" className="mr-3" />
            <Text className="text-base text-[#333333]">
              เปิดใช้งานการแจ้งเตือน
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: "#ccc", true: "#2A9D8F" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Emergency Contact */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">
          ความช่วยเหลือฉุกเฉิน
        </Text>
        <Pressable
          className="flex-row items-center justify-between py-3"
          onPress={() => router.push("/Allergy-relief-guide")}
        >
          <View className="flex-row items-center">
            <HelpCircle size={20} color="#333333" className="mr-3" />
            <Text className="text-base text-[#333333]">
              อ่านขั้นตอนการปฐมพยาบาล
            </Text>
          </View>
        </Pressable>
      </View>

      {/* --- NEW SECTION: Admin / ผู้ดูแลระบบ --- */}
      {/* 2. ใส่เงื่อนไขตรงนี้ครับ ถ้าเป็น ADMIN ถึงจะแสดง */}
      {user?.role === 'ADMIN' && (
        <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-[#333333] mb-4">
            ผู้ดูแลระบบ
            </Text>
            
            {/* Manage Products */}
            <Pressable
            className="flex-row items-center py-3 border-b border-[#E5E5E5]"
            // 3. แก้ path ให้ถูกต้อง (สินค้า -> products)
            onPress={() => router.push("/products")} 
            >
            <Package size={20} color="#333333" className="mr-3" />
            <Text className="text-base text-[#333333]">
                จัดการคลังสินค้า
            </Text>
            </Pressable>

            {/* Manage Allergens */}
            <Pressable
            className="flex-row items-center py-3"
            // 3. แก้ path ให้ถูกต้อง (สารก่อภูมิแพ้ -> allergens)
            onPress={() => router.push("/allergens")}
            >
            <AlertTriangle size={20} color="#333333" className="mr-3" />
            <Text className="text-base text-[#333333]">
                จัดการข้อมูลสารก่อภูมิแพ้
            </Text>
            </Pressable>
        </View>
      )}
      {/* --- จบส่วน Admin --- */}

      {/* Logout */}
      <View className="mb-6">
        <Button title="ออกจากระบบ" onPress={handleLogout} variant="primary" />
      </View>

      {/* Footer */}
      <View className="items-center mt-6 mb-4">
        <Text className="text-sm text-[#666666]">เวอร์ชัน 1.0.0</Text>
      </View>
    </ScrollView>
  );
}