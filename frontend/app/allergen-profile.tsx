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
import { Allergen, Severity } from "@/types";

export default function AllergenProfileScreen() {
  const router = useRouter();
  const { profile, updateAllergen, removeAllergen } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
  // State สำหรับเก็บรายการที่ถูกเลือกชั่วคราวก่อนบันทึก
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
    // ถ้าการ์ดถูกเลือกอยู่แล้ว (ไม่ว่าจะจาก profile หรือเป็น pending) ให้ทำการลบ
    if (isCurrentlySelected || isPending) {
      removeAllergen(allergenId);
      if (isPending) {
        setPendingSelection(null);
      }
    } else {
      // ถ้ายังไม่ได้เลือก ให้ตั้งเป็น pending เพื่อรอเลือก severity
      setPendingSelection(allergenId);
      if (showOnboarding) setShowOnboarding(false);
    }
  };

  const handleSeverityChange = (allergenId: number, severity: Severity) => {
    // เมื่อเลือก severity แล้ว ค่อยทำการบันทึก
    updateAllergen(allergenId, severity);
    // ล้าง pending selection ออก
    if (pendingSelection === allergenId) {
      setPendingSelection(null);
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
    <View style={styles.safeContainer}>
      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        {/* Header text */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>สารก่อภูมิแพ้ของฉันน</Text>
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
          {filteredAllergens.map((allergen) => {
            const userAllergy = profile?.allergens.find(a => a.allergenId === allergen.id);
            // ตรวจสอบว่ารายการนี้ถูกเลือกอยู่ (ทั้งจาก profile และ pending) หรือไม่
            const isSelected = !!userAllergy || pendingSelection === allergen.id;
            const currentSeverity = userAllergy?.severity || 'MEDIUM'; // กำหนดค่าเริ่มต้น
            return (
              <AllergenCard
                key={allergen.id}
                allergen={allergen}
                selected={isSelected}
                severity={currentSeverity}
                onToggle={() => {
                  // เมื่อกดที่ Card, ถ้ายังไม่ได้เลือก ให้ทำการเลือก (pending)
                  // ถ้าเลือกแล้ว (ทั้งใน profile หรือ pending) ให้ทำการลบ
                  // นี่คือ logic เดิมที่ถูกต้องแล้ว
                  handleToggleAllergen(allergen.id, !!userAllergy);
                }}
                onSeverityChange={(severity) => handleSeverityChange(allergen.id, severity)}
              />
            );
          })}

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
  safeContainer: {
    flex: 1,
    backgroundColor: "#ffffff", // สีเดียวกับ header เพื่อให้พื้นหลัง status bar สวยงาม
  },
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