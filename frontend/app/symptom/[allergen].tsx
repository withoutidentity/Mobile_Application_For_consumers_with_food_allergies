import Colors from '@/constants/Colors';
import { fetchAllergens } from '@/data/allergens';
import { fetchSymptoms } from '@/data/symptoms';
import { Allergen, AllergenSymptom } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, AlertTriangle, Clock, Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SymptomDetailScreen() {
  const { allergen } = useLocalSearchParams<{ allergen: string }>();
  
  const [allergenInfo, setAllergenInfo] = useState<Allergen | null>(null);
  const [symptomInfo, setSymptomInfo] = useState<AllergenSymptom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!allergen) return;

      setLoading(true);
      try {
        const allergenId = parseInt(allergen, 10);
        const [allAllergens, allSymptoms] = await Promise.all([
          fetchAllergens(),
          fetchSymptoms(),
        ]);

        const foundAllergen = allAllergens.find(a => a.id === allergenId) ?? null;
        const foundSymptom = allSymptoms.find(s => s.allergenId === allergenId) ?? null;

        setAllergenInfo(foundAllergen);
        setSymptomInfo(foundSymptom);
      } catch (error) {
        console.error("Failed to load symptom details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [allergen]);
  
  if (loading) {
    return (
      <View style={styles.notFound}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.notFoundTitle}>Loading Details...</Text>
      </View>
    );
  }

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

  const getSeverityColor = (defaultLevel: string) => {
    switch (defaultLevel) {
      case 'HIGH':
        return Colors.unsafe;
      case 'MEDIUM':
        return Colors.caution;
      case 'LOW':
        return Colors.safe;
      default:
        return Colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{allergenInfo.name} Allergy</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(allergenInfo.defaultLevel) }]}>
          <Text style={styles.severityText}>
            {allergenInfo.defaultLevel.charAt(0).toUpperCase() + allergenInfo.defaultLevel.slice(1)} Severity
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
          {allergenInfo.altNames.map((alias, index) => (
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