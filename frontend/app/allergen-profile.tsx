import AllergenCard from "@/components/AllergenCard";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { useUserProfile } from "@/context/UserProfileContext";
import { fetchAllergens, getAllergenSearchTerms } from "@/data/allergens";
import { createAllergen } from "@/data/allergenService";
import { AlertCircle, Search, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Allergen, Severity } from "@/types";

export default function AllergenProfileScreen() {
  const { profile, updateAllergen, removeAllergen } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
  const [customName, setCustomName] = useState("");
  const [customAltNames, setCustomAltNames] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [pendingSelection, setPendingSelection] = useState<number | null>(null);

  useEffect(() => {
    const loadAllergens = async () => {
      const data = await fetchAllergens();
      setAllAllergens(data);
    };

    void loadAllergens();
  }, []);

  const filteredAllergens = allAllergens.filter(
    (allergen) => getAllergenSearchTerms(allergen).some((term) => term.includes(searchQuery.toLowerCase()))
  );

  const handleToggleAllergen = (allergenId: number, isCurrentlySelected: boolean) => {
    const isPending = pendingSelection === allergenId;

    if (isCurrentlySelected || isPending) {
      removeAllergen(allergenId);
      if (isPending) {
        setPendingSelection(null);
      }
    } else {
      setPendingSelection(allergenId);
      if (showOnboarding) setShowOnboarding(false);
    }
  };

  const handleSeverityChange = (allergenId: number, severity: Severity) => {
    updateAllergen(allergenId, severity);
    if (pendingSelection === allergenId) {
      setPendingSelection(null);
    }
  };

  const handleDismissPendingSelection = (allergenId: number) => {
    if (pendingSelection === allergenId) {
      setPendingSelection(null);
    }
  };

  const handleCreateCustomAllergen = async () => {
    if (!customName.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อสารก่อภูมิแพ้");
      return;
    }

    try {
      const newAllergen = await createAllergen({
        name: customName.trim(),
        description: customDescription.trim(),
        altNames: customAltNames
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        symptoms: [],
        whenToSeekHelp: [],
      });

      setAllAllergens((prev) => [...prev, newAllergen]);
      setSearchQuery(newAllergen.name.toLowerCase());
      setCustomName("");
      setCustomAltNames("");
      setCustomDescription("");
      handleToggleAllergen(newAllergen.id, false);
      Alert.alert("เพิ่มสำเร็จ", "เพิ่มสารก่อภูมิแพ้ใหม่แล้ว เลือกระดับความรุนแรงได้ทันที");
    } catch (error: any) {
      Alert.alert("เพิ่มไม่สำเร็จ", error?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (showOnboarding) {
    return (
      <ScrollView className="flex-1 bg-white">
        <EmptyState
          icon={<User size={64} color="#2A9D8F" />}
          title="ตั้งค่าโปรไฟล์สารก่อภูมิแพ้ของคุณ"
          message="เลือกสารก่อภูมิแพ้ที่ส่งผลต่อคุณ เพื่อให้เราช่วยระบุอาหารที่ปลอดภัย คุณสามารถอัปเดตรายการนี้ได้ตลอดเวลา"
          action={
            <Button
              title="เริ่มต้นการใช้งาน"
              onPress={() => setShowOnboarding(false)}
              variant="primary"
              size="large"
            />
          }
        />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">สารก่อภูมิแพ้ของฉัน</Text>
          <Text className="text-base text-gray-500">จัดการโปรไฟล์สารก่อภูมิแพ้ของคุณ</Text>
        </View>

        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-4">
          <Search size={20} color="#666666" />
          <TextInput
            className="flex-1 h-12 text-base text-gray-900 ml-2"
            placeholder="ค้นหาสารก่อภูมิแพ้..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666666"
          />
        </View>

        <View className="flex-row items-center bg-[#2A9D8F]/10 rounded-lg p-3 mb-4">
          <AlertCircle size={20} color="#2A9D8F" />
          <Text className="ml-2 text-sm text-gray-800 flex-1">
            แตะที่สารก่อภูมิแพ้เพื่อเพิ่มหรือลบออกจากโปรไฟล์ของคุณ
          </Text>
        </View>

        <View className="mt-2">
          {filteredAllergens.map((allergen) => {
            const userAllergy = profile?.allergens.find(a => a.allergenId === allergen.id);
            const isPendingSelection = pendingSelection === allergen.id;
            const isSelected = !!userAllergy || isPendingSelection;
            const currentSeverity = userAllergy?.severity || 'MEDIUM';

            return (
              <AllergenCard
                key={allergen.id}
                allergen={allergen}
                selected={isSelected}
                severity={currentSeverity}
                autoOpenSeverityModal={isPendingSelection}
                isPendingSelection={isPendingSelection}
                onToggle={() => {
                  handleToggleAllergen(allergen.id, !!userAllergy);
                }}
                onSeverityChange={(severity) => handleSeverityChange(allergen.id, severity)}
                onDismissPendingSelection={() => handleDismissPendingSelection(allergen.id)}
              />
            );
          })}

          {filteredAllergens.length === 0 && (
            <View className="p-6 items-center">
              <Text className="text-base text-gray-400 text-center">
                ไม่พบสารก่อภูมิแพ้ที่ตรงกับ &quot;{searchQuery}&quot;
              </Text>
            </View>
          )}
        </View>

        <View className="rounded-xl border border-dashed border-[#2A9D8F] p-4 mb-5 bg-white">
          <Text className="text-base font-semibold text-gray-900 mb-2">ไม่เจอสารที่ต้องการ? เพิ่มเองได้</Text>
          <Text className="text-sm text-gray-500 mb-3">
            กรอกเฉพาะข้อมูลที่รู้ก็พอ เช่น ชื่อ ชื่อที่เกี่ยวข้อง หรือคำอธิบายสั้น ๆ
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-3"
            placeholder="ชื่อสารก่อภูมิแพ้"
            value={customName}
            onChangeText={setCustomName}
            placeholderTextColor="#666666"
          />
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-3"
            placeholder="ชื่อที่เกี่ยวข้อง คั่นด้วย comma"
            value={customAltNames}
            onChangeText={setCustomAltNames}
            placeholderTextColor="#666666"
          />
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-3"
            placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)"
            value={customDescription}
            onChangeText={setCustomDescription}
            placeholderTextColor="#666666"
            multiline
          />
          <Button
            title="เพิ่มสารก่อภูมิแพ้นี้"
            onPress={handleCreateCustomAllergen}
            variant="primary"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
