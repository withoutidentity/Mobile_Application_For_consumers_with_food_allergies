import React from 'react';
import { 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  Linking, 
  Platform, 
  Alert,
  // 1. ลบ StyleSheet ออก
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/context/UserProfileContext';
import { 
  ArrowLeft, 
  Phone, 
  User, 
  AlertTriangle, 
  ShieldAlert, 
  Wind 
} from 'lucide-react-native';

// Helper Component สำหรับรายการอาการ (ใช้ NativeWind)
const SymptomItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <View className="flex-row items-center mb-3">
    {icon}
    <Text className="text-base text-gray-800 ml-3 flex-1">{text}</Text>
  </View>
);

// Helper Component สำหรับขั้นตอน (ใช้ NativeWind)
const StepItem = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <View className="flex-row items-start mb-4">
    <Text className="text-xl font-bold text-teal-600 w-8">{number}.</Text>
    <View className="flex-1">
      <Text className="text-base font-bold text-gray-800">{title}</Text>
      <Text className="text-base text-gray-600 mt-0.5">{description}</Text>
    </View>
  </View>
);

// ฟังก์ชันสำหรับโทรออก (เหมือนเดิม)
const handlePhoneCall = (phoneNumber: string) => {
  const url = `${Platform.OS === 'ios' ? 'telprompt:' : 'tel:'}${phoneNumber}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert("ไม่สามารถโทรออก", "อุปกรณ์นี้ไม่รองรับการโทรออก");
      }
    })
    .catch(err => Alert.alert("เกิดข้อผิดพลาด", err.message));
};

export default function AllergyGuideScreen() {
  const router = useRouter();
  const { profile } = useUserProfile();

  return (
    // 2. ใช้ className แทน StyleSheet
    <View className="flex-1 bg-gray-50"> 
      
      {/* Custom Header */}
      <View className="bg-teal-600 h-12 flex-row items-center px-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold ml-3">คู่มือบรรเทาอาการแพ้</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        {/* 1. ปุ่มโทรฉุกเฉิน */}
        <TouchableOpacity
          className="bg-red-600 rounded-xl p-4 flex-row items-center justify-center mb-4 shadow-md"
          onPress={() => handlePhoneCall('1669')}
        >
          <Phone size={24} color="#fff" className="mr-3" />
          <Text className="text-white text-xl font-bold">โทรฉุกเฉิน 1669</Text>
        </TouchableOpacity>

        {/* 2. สัญญาณอาการแพ้รุนแรง */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={24} color="#D9534F" />
            <Text className="text-lg font-bold ml-2 text-red-600">สัญญาณอาการแพ้รุนแรง</Text>
          </View>
          <Text className="text-base text-gray-600 mb-4">หากพบอาการเหล่านี้ ควรรีบพบแพทย์ทันที:</Text>
          
          <SymptomItem icon={<Wind size={20} color="#D9534F" />} text="หน้าบวม ปากบวม ลิ้นบวม" />
          <SymptomItem icon={<Wind size={20} color="#D9534F" />} text="หายใจลำบาก หายใจมีเสียงหวีด" />
          <SymptomItem icon={<Wind size={20} color="#D9534F" />} text="ผื่นลมพิษขึ้นทั่วตัว" />
          <SymptomItem icon={<Wind size={20} color="#D9534F" />} text="เวียนศีรษะ หน้ามืด เป็นลม" />
          <SymptomItem icon={<Wind size={20} color="#D9534F" />} text="ปวดท้องรุนแรง คลื่นไส้ อาเจียน" />
        </View>

        {/* 3. ขั้นตอนการปฐมพยาบาล */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <ShieldAlert size={24} color="#2A9D8F" />
            <Text className="text-lg font-bold ml-2 text-teal-600">ขั้นตอนการปฐมพยาบาล</Text>
          </View>
          
          <StepItem number="1" title="โทร 1669" description="แจ้งข้อมูลผู้ป่วย สถานที่ และอาการให้ชัดเจน" />
          <StepItem number="2" title="ใช้ยาฉีด (EpiPen)" description="หากผู้ป่วยมียาฉีดอะดรีนาลีน ให้รีบฉีดทันทีที่ต้นขา" />
          <StepItem number="3" title="จัดท่าผู้ป่วย" description="ให้นอนราบและยกขาสูง หากหายใจลำบาก ให้นั่งในท่าที่สบาย" />
          <StepItem number="4" title="คลายเสื้อผ้า" description="คลายเสื้อผ้าที่รัดแน่น โดยเฉพาะบริเวณคอและหน้าอก" />
          <StepItem number="5" title="ห้ามให้ยาหรือน้ำ" description="ห้ามผู้ป่วยดื่มน้ำหรือกินยาแก้แพ้แบบเม็ด (อาจสำลัก)" />
        </View>

        {/* 4. ปุ่มโทรหาผู้ติดต่อฉุกเฉิน (ถ้ามี) */}
        {profile.emergencyContact && (
          <TouchableOpacity
            className="bg-orange-500 rounded-xl p-4 flex-row items-center justify-center mb-4 shadow-md"
            // 3. แก้ไข Error: เพิ่มการตรวจสอบ if ก่อนเรียกใช้
            onPress={() => {
              if (profile.emergencyContact) {
                handlePhoneCall(profile.emergencyContact);
              }
            }}
          >
            <User size={20} color="#fff" className="mr-3" />
            <Text className="text-white text-lg font-bold">โทรหาผู้ติดต่อฉุกเฉิน</Text>
          </TouchableOpacity>
        )}

        {/* 5. Disclaimer */}
        <Text className="text-xs text-gray-400 text-center mt-4 px-4">
          ข้อมูลนี้ใช้เพื่อการปฐมพยาบาลเบื้องต้นเท่านั้น ไม่สามารถทดแทนคำแนะนำจากแพทย์ได้
        </Text>

      </ScrollView>
    </View>
  );
}

// 4. ลบ const styles = StyleSheet.create(...) ทั้งหมดออก