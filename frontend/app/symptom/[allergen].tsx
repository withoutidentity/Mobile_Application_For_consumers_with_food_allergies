import Colors from '@/constants/Colors';
import allergens from '@/data/allergens';
import allergenSymptoms from '@/data/symptoms';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, AlertTriangle, Clock, Heart } from 'lucide-react-native';
import React from 'react';
// ⛔️ ไม่ต้อง import StyleSheet แล้ว
import { ScrollView, Text, View } from 'react-native';

export default function SymptomDetailScreen() {
  const { allergen } = useLocalSearchParams<{ allergen: string }>();

  const allergenInfo = allergens.find((a) => a.id === allergen);
  const symptomInfo = allergenSymptoms.find((s) => s.allergenId === allergen);

  // 1. แปลงส่วน Not Found
  if (!allergenInfo || !symptomInfo) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <AlertCircle size={64} color={Colors.unsafe} />
        <Text className="text-xl font-bold text-text mt-4 mb-2">
          Information Not Found
        </Text>
        <Text className="text-base text-textLight text-center">
          We couldn't find symptom information for this allergen.
        </Text>
      </View>
    );
  }

  // 2. ฟังก์ชันนี้ยังคงไว้เหมือนเดิม เพราะเป็น Dynamic Style
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return Colors.unsafe;
      case 'medium':
        return Colors.caution;
      case 'low':
        return Colors.safe;
      default:
        return Colors.primary;
    }
  };

  return (
    // 3. แปลง Container และ Content Container
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }} // contentContainerStyle ยังใช้สไตล์ปกติ
    >
      {/* 4. แปลง Header */}
      <View className="mb-4 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-text flex-1">
          {allergenInfo.name} Allergy
        </Text>
        <View
          style={{ backgroundColor: getSeverityColor(allergenInfo.severity) }}
          className="px-3 py-1.5 rounded-2xl" // py-1.5 = 6px, rounded-2xl = 16px
        >
          <Text className="text-white text-sm font-semibold">
            {allergenInfo.severity.charAt(0).toUpperCase() +
              allergenInfo.severity.slice(1)}{' '}
            Severity
          </Text>
        </View>
      </View>

      {/* 5. แปลง Description */}
      <View className="mb-6">
        <Text className="text-base text-text leading-6">
          {allergenInfo.description}
        </Text>
      </View>

      {/* 6. แปลง Section (Common Symptoms) */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <AlertCircle size={20} color={Colors.unsafe} />
          <Text className="text-lg font-semibold text-text ml-2">
            Common Symptoms
          </Text>
        </View>
        <View className="bg-card rounded-lg p-3">
          {symptomInfo.symptoms.map((symptom, index) => (
            <View
              key={index}
              // ใช้ 'last:' modifier เพื่อลบเส้นขอบตัวสุดท้าย
              className="py-2 border-b border-border last:border-b-0"
            >
              <Text className="text-base text-text leading-6">{symptom}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 7. แปลง Section (First Aid) */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Heart size={20} color={Colors.primary} />
          <Text className="text-lg font-semibold text-text ml-2">
            First Aid
          </Text>
        </View>
        <View className="bg-card rounded-lg p-3">
          {symptomInfo.firstAid.map((item, index) => (
            <View
              key={index}
              className="py-2 border-b border-border last:border-b-0"
            >
              <Text className="text-base text-text leading-6">{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 8. แปลง Section (When to Seek Medical Help) */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <AlertTriangle size={20} color={Colors.caution} />
          <Text className="text-lg font-semibold text-text ml-2">
            When to Seek Medical Help
          </Text>
        </View>
        {/* ใช้ NativeWind opacity shorthand (bg-unsafe/10) */}
        <View className="bg-unsafe/10 rounded-lg p-4 border-l-4 border-l-unsafe">
          <Text className="text-base text-text mb-3 font-medium">
            If you experience any of the following symptoms, seek immediate
            medical attention:
          </Text>
          <View>
            {symptomInfo.whenToSeekHelp.map((item, index) => (
              <View
                key={index}
                // ใช้ NativeWind opacity shorthand (border-unsafe/20)
                className="py-2 border-b border-unsafe/20 last:border-b-0"
              >
                <Text className="text-base text-text font-medium">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 9. แปลง Section (Also Known As) */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Clock size={20} color={Colors.secondary} />
          <Text className="text-lg font-semibold text-text ml-2">
            Also Known As
          </Text>
        </View>
        <View className="flex-row flex-wrap">
          {allergenInfo.aliases.map((alias, index) => (
            <View
              key={index}
              className="bg-card rounded-2xl py-1.5 px-3 mr-2 mb-2"
            >
              <Text className="text-sm text-text">{alias}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 10. แปลง Disclaimer */}
      <View className="mt-4 p-4 bg-secondary/10 rounded-lg">
        <Text className="text-sm text-textLight italic leading-5">
          Disclaimer: This information is provided for educational purposes only
          and is not intended to be a substitute for professional medical advice,
          diagnosis, or treatment.
        </Text>
      </View>
    </ScrollView>
  );
}

// ⛔️ ลบ const styles = StyleSheet.create({...}) ทั้งหมด