import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "@/components/Button";
import { resetPasswordWithCode } from "@/data/authService";

export default function ForgotPasswordResetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = typeof params.email === "string" ? params.email : "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim() || !code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("ข้อมูลไม่ถูกต้อง", "รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordWithCode(email.trim(), code.trim(), newPassword);
      Alert.alert("เปลี่ยนรหัสผ่านสำเร็จ", response.message, [
        {
          text: "กลับไปหน้าเข้าสู่ระบบ",
          onPress: () => router.push("/login"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("รีเซ็ตรหัสผ่านไม่สำเร็จ", error?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-2">ยืนยันรหัสและตั้งรหัสผ่านใหม่</Text>
        <Text className="text-base text-gray-500 mb-6">
          กรอกรหัสยืนยันจากอีเมล พร้อมตั้งรหัสผ่านใหม่
        </Text>

        <TextInput
          className="border border-gray-300 rounded-lg px-3 bg-white h-12 text-base text-gray-900 mb-3"
          value={email}
          onChangeText={setEmail}
          placeholder="อีเมล"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          className="border border-gray-300 rounded-lg px-3 bg-white h-12 text-base text-gray-900 mb-3"
          value={code}
          onChangeText={setCode}
          placeholder="รหัสยืนยัน 6 หลัก"
          keyboardType="number-pad"
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
          title={loading ? "กำลังรีเซ็ตรหัสผ่าน..." : "ยืนยันเปลี่ยนรหัสผ่าน"}
          onPress={handleResetPassword}
          variant="primary"
          size="large"
        />
      </ScrollView>
    </View>
  );
}
