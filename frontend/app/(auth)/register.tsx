import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, ActivityIndicator, Alert } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // ตัวอย่าง: บันทึก token หรือ user info ใน local storage (ถ้ามี)
        // await AsyncStorage.setItem('token', data.token);
        router.replace("/(tabs)");
      } else {
        Alert.alert("สมัครสมาชิกไม่สำเร็จ", data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  // ดึงความกว้างและสูงของหน้าจอ
  const { width, height } = Dimensions.get("window");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: height * 0.05, // ปรับ padding ตามขนาดหน้าจอ
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* รูปภาพ */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={{
            width: width * 0.5,   // ครึ่งหน้าจอ
            height: width * 0.5,  // ทำให้เป็นสี่เหลี่ยม
            marginBottom: 20,
          }}
          resizeMode="contain"
        />

        <Text className="text-2xl font-bold mb-5 text-center text-text">
          สมัครสมาชิก
        </Text>

        <TextInput
          placeholder="ชื่อ"
          value={name}
          onChangeText={setName}
          className="border border-border rounded-lg p-3 mb-3 text-text"
          style={{ width: width * 0.85, maxWidth: 400 }}
        />
        <TextInput
          placeholder="อีเมล"
          value={email}
          onChangeText={setEmail}
          className="border border-border rounded-lg p-3 mb-3 text-text"
          style={{ width: width * 0.85, maxWidth: 400 }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="รหัสผ่าน"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-border rounded-lg p-3 mb-3 text-text"
          style={{ width: width * 0.85, maxWidth: 400 }}
        />
        <TextInput
          placeholder="ยืนยันรหัสผ่าน"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          className="border border-border rounded-lg p-3 mb-3 text-text"
          style={{ width: width * 0.85, maxWidth: 400 }}
        />

        <Pressable
          className="bg-primary p-4 rounded-lg mt-4 items-center"
          style={{ width: width * 0.85, maxWidth: 400, opacity: loading ? 0.7 : 1 }}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-center">สมัครสมาชิก</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/login")}>
          <Text className="mt-4 text-center text-primary">
            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
