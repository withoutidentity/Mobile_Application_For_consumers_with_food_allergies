import AllergenCard from "@/components/AllergenCard";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { useUserProfile } from "@/context/UserProfileContext";
import allergens from "@/data/allergens";
import { AlertCircle, Search, User } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

export default function ProfileScreen() {
  const { profile, addAllergen, removeAllergen } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(
    profile.allergens.length === 0
  );

  const filteredAllergens = allergens.filter(
    (allergen) =>
      allergen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allergen.aliases.some((alias) =>
        alias.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleToggleAllergen = (allergenId: string) => {
    if (profile.allergens.includes(allergenId)) {
      removeAllergen(allergenId);
    } else {
      addAllergen(allergenId);
      if (showOnboarding) setShowOnboarding(false);
    }
  };

  if (showOnboarding) {
    return (
      <ScrollView className="flex-1 bg-white p-4">
        <EmptyState
          icon={<User size={64} color="#2A9D8F" />} // primary
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
    <ScrollView className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          สารก่อภูมิแพ้ของฉัน
        </Text>
        <Text className="text-base text-gray-500">
          จัดการโปรไฟล์สารก่อภูมิแพ้ของคุณ
        </Text>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-4">
        <Search size={20} color="#666666" className="mr-2" />
        <TextInput
          className="flex-1 h-12 text-base text-gray-900"
          placeholder="Search allergens..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666666"
        />
      </View>

      {/* Info */}
      <View className="flex-row items-center bg-teal-100/40 rounded-lg p-3 mb-4">
        <AlertCircle size={20} color="#2A9D8F" /> {/* primary */}
        <Text className="ml-2 text-sm text-gray-800 flex-1">
          Tap on an allergen to add or remove it from your profile.
        </Text>
      </View>

      {/* Allergens List */}
      <View className="mt-2">
        {filteredAllergens.map((allergen) => (
          <AllergenCard
            key={allergen.id}
            allergen={allergen}
            selected={profile.allergens.includes(allergen.id)}
            onToggle={handleToggleAllergen}
          />
        ))}

        {filteredAllergens.length === 0 && (
          <View className="p-6 items-center">
            <Text className="text-base text-gray-400 text-center">
              No allergens found matching "{searchQuery}"
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
