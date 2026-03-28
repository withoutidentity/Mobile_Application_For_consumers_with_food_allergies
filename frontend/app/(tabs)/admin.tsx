import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
// 1. เปลี่ยน import จาก Cube เป็น Box
import { Box, AlertCircle, ChevronRight } from 'lucide-react-native'; 

export default function AdminScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mb-6 mt-2">
        <Text className="text-2xl font-bold text-teal-700">
          ผู้ดูแลระบบ
        </Text>
        <Text className="text-gray-500 text-sm">
          จัดการข้อมูลและระบบหลังบ้าน
        </Text>
      </View>

      <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
        
        <TouchableOpacity 
          className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50 rounded-t-xl"
          onPress={() => router.push('/(tabs)/products')} 
        >
          <View className="bg-teal-50 p-2 rounded-full">
            {/* 2. เรียกใช้ Component Box ตรงนี้ */}
            <Box size={24} color="#0F766E" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-base font-semibold text-gray-800">จัดการคลังสินค้า</Text>
            <Text className="text-xs text-gray-400">เพิ่ม ลบ แก้ไข สินค้าในระบบ</Text>
          </View>
          <ChevronRight size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center p-4 active:bg-gray-50 rounded-b-xl"
          onPress={() => router.push('/(tabs)/allergens')}
        >
          <View className="bg-orange-50 p-2 rounded-full">
            <AlertCircle size={24} color="#C2410C" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-base font-semibold text-gray-800">ข้อมูลสารก่อภูมิแพ้</Text>
            <Text className="text-xs text-gray-400">จัดการรายชื่อสารก่อภูมิแพ้</Text>
          </View>
          <ChevronRight size={20} color="#CBD5E1" />
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}