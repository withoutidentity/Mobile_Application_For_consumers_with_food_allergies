import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserProfile } from "@/context/UserProfileContext";
import Button from "@/components/Button";
import { ChevronRight, KeyRound, Phone, User } from "lucide-react-native";

export default function PersonalProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUserProfile();
  const [name, setName] = useState(profile?.name || "");
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact || "");
  const [dietaryRestrictions] = useState<string[]>(
    profile?.dietaryRestrictions || []
  );

  const handleSave = () => {
    if (name.trim() === "") {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อของคุณ");
      return;
    }

    void updateProfile({
      ...profile,
      name: name.trim(),
      emergencyContact: emergencyContact.trim(),
      dietaryRestrictions,
    });

    Alert.alert("สำเร็จ", "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          ประวัติส่วนตัว
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          จัดการข้อมูลพื้นฐานของบัญชี
        </Text>

        <View className="mb-5">
          <Text className="text-base text-gray-700 font-medium mb-2">
            ชื่อ
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-white h-12">
            <User size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-base text-gray-900 ml-2"
              value={name}
              onChangeText={setName}
              placeholder="กรอกชื่อของคุณ"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-base text-gray-700 font-medium mb-2">
            เบอร์ติดต่อฉุกเฉิน
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-white h-12">
            <Phone size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-base text-gray-900 ml-2"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="เช่น 081-234-5678"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Pressable
          className="flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-4 mb-8 bg-gray-50"
          onPress={() => router.push("/change-password")}
        >
          <View className="flex-row items-center flex-1">
            <KeyRound size={20} color="#0f766e" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-900">เปลี่ยนรหัสผ่าน</Text>
              <Text className="text-sm text-gray-500">เปิดหน้าแยกเพื่ออัปเดตรหัสผ่านของบัญชี</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#6B7280" />
        </Pressable>

        <View className="mt-2 mb-10">
          <Button
            title="บันทึกข้อมูล"
            onPress={handleSave}
            variant="primary"
            size="large"
          />
        </View>
      </ScrollView>
    </View>
  );
}
