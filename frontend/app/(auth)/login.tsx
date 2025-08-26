import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, ActivityIndicator, Alert } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // ตัวอย่าง: บันทึก token หรือ user info ใน local storage (ถ้ามี)
        // await AsyncStorage.setItem('token', data.token);
        router.replace("/(tabs)");
      } else {
        Alert.alert("เข้าสู่ระบบไม่สำเร็จ", data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

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
          paddingVertical: height * 0.05,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* รูปภาพ */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={{
            width: width * 0.5,
            height: width * 0.5,
            marginBottom: 20,
          }}
          resizeMode="contain"
        />

        <Text className="text-2xl font-bold mb-5 text-center text-text">
          เข้าสู่ระบบ
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

        <Pressable
          className="bg-primary p-4 rounded-lg mt-4 items-center"
          style={{ width: width * 0.85, maxWidth: 400, opacity: loading ? 0.7 : 1 }}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-center">เข้าสู่ระบบ</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/register")}>
          <Text className="mt-4 text-center text-primary">
            ยังไม่มีบัญชี? สมัครสมาชิก
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
