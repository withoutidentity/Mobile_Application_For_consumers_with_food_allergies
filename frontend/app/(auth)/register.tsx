import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Link } from "expo-router";

export default function RegisterScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (username && password) {
      await login("mocked-jwt-token"); // mock: สมัครแล้วถือว่า login เลย
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="w-full max-w-md bg-gray-50 rounded-2xl p-8 shadow-md">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-6">
          Register
        </Text>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base"
        />

        <TouchableOpacity
          onPress={handleRegister}
          className="bg-emerald-600 py-3 rounded-xl"
        >
          <Text className="text-center text-white font-semibold text-lg">
            Register
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-emerald-600 font-semibold">Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
