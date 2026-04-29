import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Button from "@/components/Button";
import { requestPasswordResetCode } from "@/data/authService";

export default function ForgotPasswordEmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกอีเมล");
      return;
    }

    setLoading(true);
    try {
      const response = await requestPasswordResetCode(email.trim());
      Alert.alert("ส่งรหัสแล้ว", response.message);
      router.push(`/forgot-password-reset?email=${encodeURIComponent(email.trim())}`);
    } catch (error: any) {
      Alert.alert("ส่งรหัสไม่สำเร็จ", error?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-2">ลืมรหัสผ่าน</Text>
        <Text className="text-base text-gray-500 mb-6">
          กรอกอีเมลของคุณเพื่อรับรหัสยืนยัน
        </Text>

        <TextInput
          className="border border-gray-300 rounded-lg px-3 bg-white h-12 text-base text-gray-900 mb-6"
          value={email}
          onChangeText={setEmail}
          placeholder="อีเมล"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
        />

        <Button
          title={loading ? "กำลังส่งรหัส..." : "ส่งรหัสยืนยัน"}
          onPress={handleContinue}
          variant="primary"
          size="large"
        />
      </ScrollView>
    </View>
  );
}
