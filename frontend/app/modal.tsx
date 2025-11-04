import { StatusBar } from "expo-status-bar";
import { Platform, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">Modal</Text>
      
      {/* นี่คือตัวคั่น (separator)
        - my-[30px] คือ marginVertical: 30
        - h-px คือ height: 1 (1 pixel)
        - w-4/5 คือ width: "80%"
      */}
      <View className="my-[30px] h-px w-4/5" />

      <Text>This is an example modal. You can edit it in app/modal.tsx.</Text>

      {/* ส่วนนี้คงเดิม เพราะ "style" เป็น prop ของ StatusBar ไม่ใช่ className */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}