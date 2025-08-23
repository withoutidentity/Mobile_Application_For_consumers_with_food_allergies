import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    console.log("Register with:", email, password);
    router.replace("/(tabs)");
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
          style={{ width: width * 0.85, maxWidth: 400 }}
          onPress={handleRegister}
        >
          <Text className="text-white font-bold text-center">สมัครสมาชิก</Text>
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
