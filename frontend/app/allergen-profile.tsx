import AllergenCard from "@/components/AllergenCard";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { useUserProfile } from "@/context/UserProfileContext"; 
import { fetchAllergens } from "@/data/allergens";
import { AlertCircle, ArrowLeft, Search, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet, // 1. Import StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { Allergen } from "@/types";

export default function AllergenProfileScreen() {
  const router = useRouter();
  const { profile, addAllergen, removeAllergen } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);

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
      allergen.altNames.some((alias) =>
        alias.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleToggleAllergen = (allergenId: number) => {
    if (profile.allergens.includes(allergenId)) {
      removeAllergen(allergenId);
    } else {
      addAllergen(allergenId);
      if (showOnboarding) setShowOnboarding(false);
    }
  };

  if (showOnboarding) {
    return (
      // 2. ใช้ style แทน className
      <ScrollView style={styles.container}>
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
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        {/* Header text */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>สารก่อภูมิแพ้ของฉัน</Text>
          <Text style={styles.subtitle}>จัดการโปรไฟล์สารก่อภูมิแพ้ของคุณ</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search allergens..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666666"
          />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <AlertCircle size={20} color="#2A9D8F" />
          <Text style={styles.infoText}>
            Tap on an allergen to add or remove it from your profile.
          </Text>
        </View>

        {/* Allergens List */}
        <View style={styles.listContainer}>
          {filteredAllergens.map((allergen) => (
            <AllergenCard
              key={allergen.id}
              allergen={allergen}
              selected={profile.allergens.includes(allergen.id)}
              onToggle={handleToggleAllergen}
            />
          ))}

          {filteredAllergens.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No allergens found matching "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// 3. สร้าง StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#0d9488", // teal-600
    height: 48, // h-12
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, // px-4
  },
  headerText: {
    color: "#ffffff",
    fontSize: 18, // text-lg
    fontWeight: "600", // font-semibold
    marginLeft: 12, // ml-3
  },
  contentContainer: {
    flex: 1,
    padding: 16, // p-4
  },
  titleContainer: {
    marginBottom: 24, // mb-6
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: "bold",
    color: "#111827", // text-gray-900
    marginBottom: 8, // mb-2
  },
  subtitle: {
    fontSize: 16, // text-base
    color: "#6B7280", // text-gray-500
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#D1D5DB", // border-gray-300
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 12, // px-3
    marginBottom: 16, // mb-4
  },
  searchIcon: {
    marginRight: 8, // mr-2
  },
  searchInput: {
    flex: 1,
    height: 48, // h-12
    fontSize: 16, // text-base
    color: "#111827", // text-gray-900
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(207, 250, 254, 0.4)", // bg-teal-100/40
    borderRadius: 8, // rounded-lg
    padding: 12, // p-3
    marginBottom: 16, // mb-4
  },
  infoText: {
    marginLeft: 8, // ml-2
    fontSize: 14, // text-sm
    color: "#1F2937", // text-gray-800
    flex: 1,
  },
  listContainer: {
    marginTop: 8, // mt-2
  },
  emptyStateContainer: {
    padding: 24, // p-6
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16, // text-base
    color: "#9CA3AF", // text-gray-400
    textAlign: "center",
  },
});