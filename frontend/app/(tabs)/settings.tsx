import Button from "@/components/Button";
import { useUserProfile } from "@/context/UserProfileContext";
import { useRouter } from "expo-router";
import { 
  Bell, 
  HelpCircle, 
  User, 
  ShieldCheck, 
  // ลบ Package, AlertTriangle ออก เพราะไม่ได้ใช้แล้ว
} from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { removeToken } = useAuth(); // user ไม่ต้องดึงมาก็ได้ ถ้าหน้า Settings ไม่ได้ใช้
  const { profile } = useUserProfile(); // profile, saveProfile ไม่ได้ใช้ก็ลบออกได้ถ้าต้องการ
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    Alert.alert("เร็วๆ นี้", "โหมดกลางคืนจะพร้อมใช้งานในอัปเดตถัดไป");
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    Alert.alert("เร็วๆ นี้", "การตั้งค่าการแจ้งเตือนจะพร้อมใช้งานในอัปเดตถัดไป");
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

      {/* Profile User */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">
          โปรไฟล์
        </Text>
        <Pressable
          className="flex-row items-center py-3 border-b border-[#E5E5E5]"
          onPress={() => router.push("/user-profile")}
        >
          <User size={20} color="#333333" className="mr-3" />
          <Text className="text-base text-[#333333]">
            โปรไฟล์ประวัติส่วนตัว
          </Text>
        </Pressable>
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