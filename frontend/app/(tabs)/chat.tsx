import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Send } from "lucide-react-native";
import { getChatHistory, sendChatMessage } from "@/data/chatService";
import { useUserProfile } from "@/context/UserProfileContext";

type SafetyStatus = "SAFE" | "UNSAFE";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  safety?: SafetyStatus;
  pending?: boolean;
};

const extractBarcode = (text: string) => {
  const match = text.match(/\b\d{8,14}\b/);
  return match ? match[0] : undefined;
};

const welcomeMessage: Message = {
  id: "welcome",
  text: "สวัสดีค่ะ ฉันเป็นผู้ช่วยเรื่องสารก่อภูมิแพ้ คุณสามารถพิมพ์หรือส่งบาร์โค้ดเพื่อให้ประเมินความปลอดภัยได้",
  sender: "bot",
  safety: "SAFE",
};

export default function ChatBotScreen() {
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory();

        if (history.length === 0) {
          setMessages([welcomeMessage]);
          return;
        }

        setMessages(
          history.map((message) => ({
            id: String(message.id),
            text: message.text,
            sender: message.sender === "USER" ? "user" : "bot",
            safety: message.safety === "SAFE" || message.safety === "UNSAFE" ? message.safety : undefined,
          }))
        );
      } catch {
        setMessages([welcomeMessage]);
      } finally {
        setLoadingHistory(false);
      }
    };

    void loadHistory();
  }, []);

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText) return;

    const timestamp = Date.now();
    const userMessage: Message = {
      id: `${timestamp}-user`,
      text: userText,
      sender: "user",
    };

    const pendingMessage: Message = {
      id: `${timestamp}-bot`,
      text: "กำลังตรวจสอบความปลอดภัย...",
      sender: "bot",
      pending: true,
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setInput("");

    try {
      const barcode = extractBarcode(userText);
      const userAllergenIds = profile?.allergens?.map((a) => a.allergenId) ?? [];

      const response = await sendChatMessage({
        message: userText,
        barcode,
        userAllergenIds,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingMessage.id
            ? {
                id: pendingMessage.id,
                text: response.reply,
                sender: "bot",
                safety: response.mode === "PRODUCT" ? response.safety : undefined,
              }
            : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingMessage.id
            ? {
                id: pendingMessage.id,
                text: "เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง",
                sender: "bot",
                safety: "UNSAFE",
              }
            : msg
        )
      );
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const botBubble =
      item.pending
        ? "bg-gray-300"
        : item.safety === "UNSAFE"
          ? "bg-red-600"
          : item.safety === "SAFE"
            ? "bg-emerald-600"
            : "bg-gray-200";

    const bubbleClass =
      item.sender === "user"
        ? "bg-teal-600 self-end rounded-br-none"
        : `${botBubble} self-start rounded-bl-none`;

    const textClass =
      item.sender === "user" || item.safety === "SAFE" || item.safety === "UNSAFE"
        ? "text-white"
        : "text-gray-800";

    return (
      <View className={`max-w-[75%] px-4 py-2 rounded-2xl mb-3 ${bubbleClass}`}>
        <Text className={textClass}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {loadingHistory ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f766e" />
        </View>
      ) : (
        <FlatList
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          inverted
        />
      )}

      <View className="flex-row items-center border-t border-gray-300 px-3 py-4 bg-white">
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 1, flexDirection: "column-reverse" }}>
            <TextInput
              className="h-12 px-3 text-base border border-gray-300 rounded-full mr-2"
              placeholder="พิมพ์ข้อความหรือบาร์โค้ด..."
              placeholderTextColor="#666666"
              value={input}
              onChangeText={setInput}
            />
          </View>
        </View>
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
