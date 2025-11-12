import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Dimensions, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, ActivityIndicator, View, } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // state สำหรับเก็บข้อความ error
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!name) newErrors.name = "กรุณากรอกชื่อ";
    if (!email) newErrors.email = "กรุณากรอกอีเมล";
    if (!password) newErrors.password = "กรุณากรอกรหัสผ่าน";
    if (!confirmPassword) newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    if (password && confirmPassword && password !== confirmPassword)
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace("/login");
      } else {
        setErrors({ general: data.message || "สมัครสมาชิกไม่สำเร็จ" });
      }
    } catch (error) {
      setErrors({ general: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" });
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
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: width * 0.5, height: width * 0.5, marginBottom: 20 }}
          resizeMode="contain"
        />

        <Text className="text-2xl font-bold mb-5 text-center text-text">
          สมัครสมาชิก
        </Text>

        {/* Name Input */}
        <View className="w-[85%] max-w-[400px] mb-3">
          <TextInput
            placeholder="ชื่อ"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            className="border border-border rounded-lg p-3 text-black"
            placeholderTextColor="#999"
          />
          {errors.name && (
            <Text className="text-red-500 text-right mt-1">{errors.name}</Text>
          )}
        </View>

        {/* Email Input */}
        <View className="w-[85%] max-w-[400px] mb-3">
          <TextInput
            placeholder="อีเมล"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-border rounded-lg p-3 text-black"
            placeholderTextColor="#999"
          />
          {errors.email && (
            <Text className="text-red-500 text-right mt-1">{errors.email}</Text>
          )}
        </View>

        {/* Password Input */}
        <View className="w-[85%] max-w-[400px] mb-3">
          <TextInput
            placeholder="รหัสผ่าน"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            secureTextEntry
            className="border border-border rounded-lg p-3 text-black"
            placeholderTextColor="#999"
          />
          {errors.password && (
            <Text className="text-red-500 text-right mt-1">
              {errors.password}
            </Text>
          )}
        </View>

        {/* Confirm Password Input */}
        <View className="w-[85%] max-w-[400px] mb-3">
          <TextInput
            placeholder="ยืนยันรหัสผ่าน"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            secureTextEntry
            className="border border-border rounded-lg p-3 text-black"
            placeholderTextColor="#999"
          />
          {errors.confirmPassword && (
            <Text className="text-red-500 text-right mt-1">
              {errors.confirmPassword}
            </Text>
          )}
        </View>

        {/* General Error */}
        {errors.general && (
          <View className="w-[85%] max-w-[400px] mb-3">
            <Text className="text-red-500 text-right">{errors.general}</Text>
          </View>
        )}

        {/* Register Button */}
        <Pressable
          onPress={handleRegister}
          disabled={loading}
          className={`w-[85%] max-w-[400px] bg-primary p-4 rounded-lg items-center mt-4 ${
            loading ? "opacity-70" : "opacity-100"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-center">
              สมัครสมาชิก
            </Text>
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
