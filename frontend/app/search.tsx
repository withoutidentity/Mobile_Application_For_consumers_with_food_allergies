import React, { useState, useMemo, useEffect } from "react";
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
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import getProducts from "@/data/productService";
import { fetchAllergens } from "@/data/allergens";
import { Allergen, Product } from "@/types";

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [products, allergens] = await Promise.all([
          getProducts(),
          fetchAllergens(),
        ]);
        setAllProducts(products);
        setAllAllergens(allergens);
      } catch (error) {
        console.error("Failed to load data for search screen:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 5. ⭐️ ใช้ useMemo เพื่อคำนวณผลลัพธ์
  const results = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return []; // ไม่มี query ก็ไม่ต้องแสดงผล
    }
    // กรองข้อมูล (ในแอปจริง ส่วนนี้ควรจะ query API)
    return allProducts.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allProducts]); // คำนวณใหม่เมื่อ searchQuery หรือ allProducts เปลี่ยน

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
          keyExtractor={(item: Product) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="px-4 py-2">
              <ProductCard product={item} allAllergens={allAllergens} />
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
