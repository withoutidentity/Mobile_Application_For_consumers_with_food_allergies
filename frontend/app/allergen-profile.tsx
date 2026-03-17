import AllergenCard from "@/components/AllergenCard";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { useUserProfile } from "@/context/UserProfileContext"; 
import { fetchAllergens } from "@/data/allergens";
import { AlertCircle, Search, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Allergen, Severity } from "@/types";

export default function AllergenProfileScreen() {
  const router = useRouter();
  const { profile, updateAllergen, removeAllergen } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
  
  const [pendingSelection, setPendingSelection] = useState<number | null>(null);

  useEffect(() => {
    const loadAllergens = async () => {
      const data = await fetchAllergens();
      setAllAllergens(data);
    };
    loadAllergens();
  }, []);

  const filteredAllergens = allAllergens.filter(
    (allergen) =>
      allergen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (allergen.altNames && allergen.altNames.some((alias) =>
        alias.toLowerCase().includes(searchQuery.toLowerCase())
      ))
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
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        {/* Header text */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">สารก่อภูมิแพ้ของฉัน</Text>
          <Text className="text-base text-gray-500">จัดการโปรไฟล์สารก่อภูมิแพ้ของคุณ</Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-4">
          <Search size={20} color="#666666" className="mr-2" />
          <TextInput
            className="flex-1 h-12 text-base text-gray-900"
            placeholder="ค้นหาสารก่อภูมิแพ้..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666666"
          />
        </View>

        {/* Info */}
        <View className="flex-row items-center bg-[#2A9D8F]/10 rounded-lg p-3 mb-4">
          <AlertCircle size={20} color="#2A9D8F" />
          <Text className="ml-2 text-sm text-gray-800 flex-1">
            แตะที่สารก่อภูมิแพ้เพื่อเพิ่มหรือลบออกจากโปรไฟล์ของคุณ
          </Text>
        </View>

        {/* Allergens List */}
        <View className="mt-2">
          {filteredAllergens.map((allergen) => {
            const userAllergy = profile?.allergens.find(a => a.allergenId === allergen.id);
            const isSelected = !!userAllergy || pendingSelection === allergen.id;
            const currentSeverity = userAllergy?.severity || 'MEDIUM'; 
            return (
              <AllergenCard
                key={allergen.id}
                allergen={allergen}
                selected={isSelected}
                severity={currentSeverity}
                onToggle={() => {
                  handleToggleAllergen(allergen.id, !!userAllergy);
                }}
                onSeverityChange={(severity) => handleSeverityChange(allergen.id, severity)}
              />
            );
          })}

          {filteredAllergens.length === 0 && (
            <View className="p-6 items-center">
              <Text className="text-base text-gray-400 text-center">
                ไม่พบสารก่อภูมิแพ้ที่ตรงกับ "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}