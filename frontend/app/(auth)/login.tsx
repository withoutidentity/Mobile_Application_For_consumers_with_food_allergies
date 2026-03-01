import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { 
  Dimensions, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Pressable, 
  ScrollView, 
  Text, 
  TextInput, 
  ActivityIndicator, 
  View 
} from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { saveToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // state สำหรับข้อความ error
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleLogin = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = "กรุณากรอกอีเมล";
    if (!password) newErrors.password = "กรุณากรอกรหัสผ่าน";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // ✅ แก้ไขตรงนี้: ส่ง data.user ไปด้วย (ตามที่แก้ใน AuthContext)
        await saveToken(data.accessToken, data.user); 
        
        // ✅ Redirect ทันทีโดยเช็ค Role จาก response (ไม่ต้องรอ Context update)
        const userRole = data.user.role?.toUpperCase();

        if (userRole === "ADMIN") {
          router.replace("/(tabs)/admin");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        setErrors({ general: data.message || "บัญชีผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
        {/* โลโก้ */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: width * 0.5, height: width * 0.5, marginBottom: 20 }}
          resizeMode="contain"
        />

        <Text className="text-2xl font-bold mb-5 text-center text-text">
          เข้าสู่ระบบ
        </Text>

        {/* Email Input */}
        <View className="w-[85%] max-w-[400px] mb-3">
          <TextInput
            placeholder="อีเมล"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            className="border border-border rounded-lg p-3 text-black"
            keyboardType="email-address"
            autoCapitalize="none"
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
            <Text className="text-red-500 text-right mt-1">{errors.password}</Text>
          )}
        </View>

        {/* General Error */}
        {errors.general && (
          <Text className="text-red-500 mb-3">{errors.general}</Text>
        )}

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className={`w-[85%] max-w-[400px] bg-primary p-4 rounded-lg items-center mt-4 ${
            loading ? "opacity-70" : "opacity-100"
          }`}
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