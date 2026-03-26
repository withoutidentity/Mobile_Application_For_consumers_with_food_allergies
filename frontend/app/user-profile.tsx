import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useUserProfile } from "@/context/UserProfileContext";
import Button from "@/components/Button";
import { CheckSquare, Square, User, Phone } from "lucide-react-native"; // นำเข้า Icon มาใช้ตกแต่ง

export default function PersonalProfileScreen() {
  const { profile, updateProfile } = useUserProfile(); 
  
  // ดึงข้อมูลเดิมจาก Context มาตั้งเป็นค่าเริ่มต้น (ถ้ามี)
  const [name, setName] = useState(profile?.name || "");
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact || "");
  
  // สร้าง State สำหรับเก็บ Array ของข้อจำกัดการกิน
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    profile?.dietaryRestrictions || []
  );

  // ตัวเลือกข้อจำกัดการกินทั้งหมด
  const dietOptions = ["มังสวิรัติ (Vegetarian)", "ทานเจ (Vegan)", "คีโต (Keto)", "ฮาลาล (Halal)"];

  // ฟังก์ชันสำหรับกดติ๊กเลือก/เอาออก ข้อจำกัดการกิน
  const toggleDiet = (option: string) => {
    if (dietaryRestrictions.includes(option)) {
      setDietaryRestrictions(dietaryRestrictions.filter((item) => item !== option));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, option]);
    }
  };

  const handleSave = () => {
    if (name.trim() === "") {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อ-นามสกุลของคุณ");
      return;
    }

    // อัปเดตข้อมูลทั้งหมดกลับไปที่ Context (เตรียมส่งเข้า Database ต่อไป)
    updateProfile({
      ...profile, 
      name: name.trim(),
      emergencyContact: emergencyContact.trim(),
      dietaryRestrictions: dietaryRestrictions,
    });

    Alert.alert("สำเร็จ", "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          ประวัติส่วนตัว
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          จัดการข้อมูลพื้นฐานและการทานอาหารของคุณ
        </Text>

        {/* 1. ช่องกรอกชื่อ */}
        <View className="mb-5">
          <Text className="text-base text-gray-700 font-medium mb-2">
            ชื่อ-นามสกุล
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-white h-12">
            <User size={20} color="#9CA3AF" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              value={name}
              onChangeText={setName}
              placeholder="กรอกชื่อของคุณ"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* 2. ช่องกรอกเบอร์ฉุกเฉิน */}
        <View className="mb-6">
          <Text className="text-base text-gray-700 font-medium mb-2">
            เบอร์ติดต่อฉุกเฉิน (ถ้ามี)
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-white h-12">
            <Phone size={20} color="#9CA3AF" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="เช่น 081-234-5678"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
          <Text className="text-xs text-gray-400 mt-1">
            *เพื่อความปลอดภัย กรณีเกิดอาการแพ้รุนแรง (Anaphylaxis)
          </Text>
        </View>

        {/* ปุ่มบันทึก */}
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