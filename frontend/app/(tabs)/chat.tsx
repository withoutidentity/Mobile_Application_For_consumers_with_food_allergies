import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Send } from "lucide-react-native";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export default function ChatBotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "สวัสดีค่ะ! ฉันคือแชทบอท ช่วยเหลือคุณได้ค่ะ 😊", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);

    // จำลองบอทตอบกลับ
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: `คุณพิมพ์ว่า: ${input}`, sender: "bot" },
      ]);
    }, 800);

    setInput("");
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      className={`max-w-[75%] px-4 py-2 rounded-2xl mb-3 ${
        item.sender === "user"
          ? "bg-teal-600 self-end rounded-br-none"
          : "bg-gray-200 self-start rounded-bl-none"
      }`}
    >
      <Text className={item.sender === "user" ? "text-white" : "text-gray-800"}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="bg-teal-600 h-12 flex-row items-center px-4">
        <Text className="text-white text-lg font-semibold">ChatBot</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        inverted
      />

      {/* Input */}
      <View className="flex-row items-center border-t border-gray-300 px-3 py-2 bg-white">
        <TextInput
          className="flex-1 h-12 px-3 text-base text-gray-900 border border-gray-300 rounded-full mr-2"
          placeholder="พิมพ์ข้อความ..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          onPress={handleSend}
          className="bg-teal-600 p-3 rounded-full"
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
