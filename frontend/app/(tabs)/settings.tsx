import Button from '@/components/Button';
import { useUserProfile } from '@/context/UserProfileContext';
import { useRouter } from "expo-router";
import { Bell, HelpCircle, Moon, Trash2, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useAuth } from "@/context/AuthContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { removeToken } = useAuth();
  const { profile, saveProfile } = useUserProfile();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    Alert.alert('เร็วๆ นี้', 'โหมดกลางคืนจะพร้อมใช้งานในอัปเดตถัดไป');
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    Alert.alert('เร็วๆ นี้', 'การตั้งค่าการแจ้งเตือนจะพร้อมใช้งานในอัปเดตถัดไป');
  };

  // const handleClearProfile = () => {
  //   Alert.alert(
  //     'ลบโปรไฟล์',
  //     'คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์สารก่อภูมิแพ้? ข้อมูลสารก่อภูมิแพ้ที่บันทึกไว้ทั้งหมดของคุณจะถูกลบ',
  //     [
  //       { text: 'ยกเลิก', style: 'cancel' },
  //       {
  //         text: 'ลบ',
  //         style: 'destructive',
  //         onPress: () => {
  //           saveProfile({
  //             allergens: [],
  //             dietaryRestrictions: [],
  //             name: profile.name,
  //             emergencyContact: profile.emergencyContact,
  //           });
  //         },
  //       },
  //     ]
  //   );
  // };

  const handleLogout = () => {
    removeToken();
  };

  return (
    <ScrollView className="flex-1 bg-[#F8F9FA]" contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-[#666666] mb-2">การตั้งค่า</Text>
        <Text className="text-base text-[#666666]">ปรับแต่งประสบการณ์ของคุณ</Text>
      </View>

      {/* Profile Settings */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">โปรไฟล์</Text>
        <Pressable
          className="flex-row items-center py-3"
          onPress={() => router.push("/allergen-profile")}
        >
          <User size={20} color="#333333" className="mr-3" />
          <Text className="text-base text-[#333333]">โปรไฟล์สารก่อภูมิแพ้</Text>
        </Pressable>
      </View>

      {/* Appearance */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">ลักษณะที่ปรากฏ</Text>
        <View className="flex-row justify-between items-center border-b border-[#E5E5E5] py-3">
          <View className="flex-row items-center flex-1">
            <Moon size={20} color="#333333" className="mr-3" />
            <Text className="text-base text-[#333333]">โหมดกลางคืน</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: '#ccc', true: '#2A9D8F' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Notifications */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">การแจ้งเตือน</Text>
        <View className="flex-row justify-between items-center border-b border-[#E5E5E5] py-3">
          <View className="flex-row items-center flex-1">
            <Bell size={20} color="#333333" className="mr-3" />
            <Text className="text-base text-[#333333]">เปิดใช้งานการแจ้งเตือน</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#ccc', true: '#2A9D8F' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Emergency Contact */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">ติดต่อฉุกเฉิน</Text>
        <Pressable className="flex-row items-center">
          <User size={20} color="#333333" className="mr-3" />
          <View>
            <Text className="text-sm text-[#666666] mt-1">
              {profile.emergencyContact || 'กรุณาโทร 1669'}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Support */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">ความช่วยเหลือ</Text>
        <Pressable className="flex-row items-center">
          <HelpCircle size={20} color="#333333" className="mr-3" />
          <Text className="text-base text-[#333333]">ความช่วยเหลือ & คำถามที่พบบ่อย</Text>
        </Pressable>
      </View>

      {/* Data */}
      {/* <View className="mb-6">
        <Button
          title="ลบโปรไฟล์สารก่อภูมิแพ้"
          onPress={handleClearProfile}
          variant="danger"
          icon={<Trash2 size={16} color="#fff" />}
        />
      </View> */}

      {/* Logout */}
      <View className="mb-6">
        <Button
          title="ออกจากระบบ"
          onPress={handleLogout}
          variant="primary"
        />
      </View>

      {/* Footer */}
      <View className="items-center mt-6 mb-4">
        <Text className="text-sm text-[#666666]">เวอร์ชัน 1.0.0</Text>
      </View>
    </ScrollView>
  );
}