import React, { useState } from "react";
import { Text, View, ScrollView, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Scan, Search, AlertCircle } from "lucide-react-native";
import Button from "@/components/Button";
import { useUserProfile } from "@/context/UserProfileContext";
import getProducts from '@/data/productService';
import { fetchAllergens } from '@/data/allergens';
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { Allergen, Product } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, isFirstLaunch } = useUserProfile();
  const [recentlyScanned, setRecentlyScanned] = useState<Product[]>([]);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);

  React.useEffect(() => {
    (async () => {
      // Fetch both products and allergens
      const products = await getProducts();
      const allergens = await fetchAllergens();

      setRecentlyScanned(products.slice(0, 3));
      setAllAllergens(allergens);
    })();
  }, []);

  const handleScanPress = () => router.push("/scanner");
  const handleSearchPress = () => router.push("/search"); 
  const handleSetupProfile = () => router.push("/allergen-profile");

  return (
    <ScrollView className="flex-1 bg-background p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-center">Can I eat this?</Text>
        {/* <Text className="text-base text-textLight">
          ถ่ายรูปอาหารเพื่อตรวจสอบว่ามีสารก่อภูมิแพ้หรือไม่
        </Text> */}
      </View>

      {/* First Launch Welcome */}
      {isFirstLaunch ? (
        <View className="rounded-2xl overflow-hidden mb-6 shadow bg-card">
          <View className="p-6 items-center">
            <AlertCircle size={32} className="text-primary" />
            <Text className="text-2xl font-bold mt-4 mb-2 text-text">
              ยินดีต้อนรับ!
            </Text>
            <Text className="text-base text-center mb-6 text-textLight">
              เริ่มต้นใช้งานโดยตั้งค่าข้อมูลอาการแพ้ของคุณ
              เพื่อให้เราสามารถช่วยคุณระบุอาหารที่ปลอดภัยสำหรับคุณได้
            </Text>
            <Button
              title="ตั้งค่าโปรไฟล์ของฉัน"
              onPress={handleSetupProfile}
              fullWidth
            />
          </View>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?q=80&w=500",
            }}
            className="rounded-b-2xl"
            style={{ width: "100%", height: 160 }}
          />
        </View>
      ) : (
        <>
          {/* Scan Button (Commented out) */}
          {/* <Pressable
            className="flex-row rounded-xl p-4 items-center mb-4 shadow bg-primary"
            onPress={handleScanPress}
          >
            <View className="w-16 h-16 rounded-full justify-center items-center mr-4 bg-white/20">
              <Scan size={32} className="text-black" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-1">
                สแกนบาร์โค้ดของสินค้า
              </Text>
              <Text className="text-sm text-white/80">
                ตรวจสอบว่าปลอดภัยสำหรับคุณหรือไม่
              </Text>
            </View>
          </Pressable> */}

          {/* Search Button */}
          <Pressable
            className="flex-row rounded-xl p-4 items-center mb-6 shadow bg-secondary"
            onPress={handleSearchPress}
          >
            <View className="w-12 h-12 rounded-full justify-center items-center mr-4 bg-white/20">
              <Search size={24} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-white mb-1">
                ค้นหาสินค้า
              </Text>
              <Text className="text-sm text-white/80">
                ค้นหาสินค้าที่ปลอดภัย
              </Text>
            </View>
          </Pressable>

          {/* Recently Scanned */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-4 text-text">
              สินค้าล่าสุด
            </Text>
            {recentlyScanned.length > 0 ? (
              recentlyScanned.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  allAllergens={allAllergens}
                />
              ))
            ) : (
              <EmptyState
                icon={<Scan size={48} className="text-textLight" />}
                title="ไม่มีการสแกนล่าสุด"
                message="สินค้าที่คุณสแกนจะปรากฏที่นี่"
                action={
                  <Button
                    title="สแกนสินค้า"
                    onPress={handleScanPress}
                    variant="primary"
                  />
                }
              />
            )}
          </View>

          {/* Allergen Summary */}
          <View className="rounded-xl p-4 mb-6 bg-card">
            <Text className="text-lg font-semibold mb-4 text-text">
              โปรไฟล์การแพ้ของคุณ
            </Text>
            {profile.allergens.length > 0 ? (
              <View className="flex-row justify-between items-center">
                <Text className="text-base flex-1 text-text">
                  คุณมีสารก่อภูมิแพ้ {profile.allergens.length} รายการ
                  ในโปรไฟล์ของคุณ
                </Text>
                <Button
                  title="จัดการสารก่อภูมิแพ้"
                  onPress={() => router.push("/allergen-profile")}
                  variant="outline"
                  size="small"
                />
              </View>
            ) : (
              <View className="items-center p-4">
                <Text className="text-base text-center mb-4 text-textLight">
                  คุณยังไม่ได้เพิ่มสารก่อภูมิแพ้ในโปรไฟล์ของคุณ
                </Text>
                <Button
                  title="เพิ่มสารก่อภูมิแพ้"
                  onPress={() => router.push("/allergen-profile")}
                  variant="primary"
                  size="small"
                />
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
