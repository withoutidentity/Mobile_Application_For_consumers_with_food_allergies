import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, X, ChevronLeft } from "lucide-react-native";
import ProductCard from "@/components/ProductCard"; // 1. ⭐️ Import Card ที่มีอยู่
import EmptyState from "@/components/EmptyState"; // 2. ⭐️ Import EmptyState ที่มีอยู่
// import mockProducts from "@/data/mockProducts"; // 3. ⭐️ ใช้ข้อมูลจำลองชุดเดียวกับหน้า Home
import { Product } from "@/types";

// 4. ⭐️ สร้าง Interface สำหรับ TypeScript (ควรตรงกับ ProductCard)
// (คุณอาจจะต้องปรับแก้ให้ตรงกับ Interface จริงของ Product)
// interface Product {
//   id: string;
//   name: string;
//   brand: string;
//   image: string;
//   safety: "safe" | "unsafe" | "caution";
//   allergens?: string[];
// }

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // 5. ⭐️ ใช้ useMemo เพื่อคำนวณผลลัพธ์
  const results = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return []; // ไม่มี query ก็ไม่ต้องแสดงผล
    }
    // กรองข้อมูล (ในแอปจริง ส่วนนี้ควรจะ query API)
    return mockProducts.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]); // คำนวณใหม่เมื่อ searchQuery เปลี่ยน


  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* 1. ส่วน Header และ Search Bar */}
        <View className="flex-row items-center p-4 border-b border-border bg-card">
          {/* ปุ่มย้อนกลับ */}
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <ChevronLeft size={28} className="text-text" />
          </TouchableOpacity>

          {/* ช่องค้นหา */}
          <View className="flex-1 flex-row items-center bg-background rounded-lg px-3 py-2">
            <Search size={20} className="text-textLight" />
            <TextInput
              className="flex-1 ml-2 text-base text-text"
              placeholderTextColor="#888" // (ตั้งสี placeholder)
              placeholder="ค้นหาสินค้าที่ปลอดภัย..."
              value={searchQuery}
              onChangeText={(text: string) => setSearchQuery(text)} // แก้ 'any' type
              autoFocus={true} // เปิดคีย์บอร์ดอัตโนมัติ
            />
            {/* ปุ่มล้างข้อความ */}
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={20} className="text-textLight" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2. ส่วนแสดงผลลัพธ์การค้นหา */}
        <FlatList
          data={results}
          keyExtractor={(item: Product) => item.id} // แก้ 'any' type
          renderItem={({ item }) => (
            <View className="px-4 py-2">
              <ProductCard product={item} />
            </View>
          )}
          // 6. ⭐️ แสดง EmptyState เมื่อไม่พบผลลัพธ์
          ListEmptyComponent={
            <View className="mt-20">
              <EmptyState
                icon={<Search size={48} className="text-textLight" />}
                title={
                  searchQuery.length > 0
                    ? "ไม่พบผลลัพธ์"
                    : "ค้นหาสินค้า"
                }
                message={
                  searchQuery.length > 0
                    ? `ไม่พบสินค้าที่ตรงกับ "${searchQuery}"`
                    : "ลองพิมพ์ชื่อสินค้าที่คุณต้องการค้นหา"
                }
              />
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
