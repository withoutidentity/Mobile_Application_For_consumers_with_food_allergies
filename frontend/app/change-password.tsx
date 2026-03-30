import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import Button from "@/components/Button";
import { changePassword } from "@/data/authService";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกรหัสผ่านให้ครบ");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("ข้อมูลไม่ถูกต้อง", "รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await changePassword(currentPassword, newPassword);
      Alert.alert("สำเร็จ", response.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("เปลี่ยนรหัสผ่านไม่สำเร็จ", error?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-2">เปลี่ยนรหัสผ่าน</Text>
        <Text className="text-base text-gray-500 mb-6">
          กรอกรหัสผ่านปัจจุบันและตั้งรหัสผ่านใหม่ของคุณ
        </Text>

        <TextInput
          className="border border-gray-300 rounded-lg px-3 bg-white h-12 text-base text-gray-900 mb-3"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="รหัสผ่านปัจจุบัน"
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          className="border border-gray-300 rounded-lg px-3 bg-white h-12 text-base text-gray-900 mb-3"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="รหัสผ่านใหม่"
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          className="border border-gray-300 rounded-lg px-3 bg-white h-12 text-base text-gray-900 mb-6"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="ยืนยันรหัสผ่านใหม่"
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />

        <Button
          title={changingPassword ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
          onPress={handleChangePassword}
          variant="primary"
          size="large"
        />
      </ScrollView>
    </View>
  );
}
