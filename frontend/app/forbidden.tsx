import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShieldAlert } from "lucide-react-native";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForbiddenScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.container}>
        <ShieldAlert size={64} color="#E74C3C" />
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.message}>
          You do not have permission to view this page.
        </Text>
        <Button title="Go to Home" onPress={() => router.replace("/(tabs)")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 16,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
});
