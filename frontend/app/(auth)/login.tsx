import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login with:", email, password);
    router.replace("/(tabs)");
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
          style={{ width: width * 0.85, maxWidth: 400 }}
          onPress={handleLogin}
        >
          <Text className="text-white font-bold text-center">เข้าสู่ระบบ</Text>
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
