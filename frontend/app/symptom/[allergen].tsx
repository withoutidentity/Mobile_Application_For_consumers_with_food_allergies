import Colors from "@/constants/Colors";
import { fetchAllergens } from "@/data/allergens";
import { Allergen, AllergenSymptom, Severity } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { AlertCircle, AlertTriangle, Clock, Heart } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

const severityOrder: Severity[] = ["LOW", "MEDIUM", "HIGH"];

const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case "HIGH":
      return Colors.unsafe;
    case "MEDIUM":
      return Colors.caution;
    case "LOW":
      return Colors.safe;
    default:
      return Colors.primary;
  }
};

const getSeverityLabel = (severity: Severity) => {
  switch (severity) {
    case "HIGH":
      return "สูง";
    case "MEDIUM":
      return "ปานกลาง";
    case "LOW":
      return "ต่ำ";
    default:
      return severity;
  }
};

export default function SymptomDetailScreen() {
  const { allergen } = useLocalSearchParams<{ allergen: string }>();
  const [allergenInfo, setAllergenInfo] = useState<Allergen | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!allergen) {
        return;
      }

      setLoading(true);
      try {
        const allergenId = parseInt(allergen, 10);
        const allAllergens = await fetchAllergens();
        const foundAllergen = allAllergens.find((item) => item.id === allergenId) ?? null;

        setAllergenInfo(foundAllergen);
        setSelectedSeverity(foundAllergen?.symptoms[0]?.defaultLevel ?? null);
      } catch (error) {
        console.error("Failed to load symptom details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [allergen]);

  const orderedSymptoms = useMemo(
    () =>
      allergenInfo
        ? [...allergenInfo.symptoms].sort(
            (a, b) => severityOrder.indexOf(a.defaultLevel) - severityOrder.indexOf(b.defaultLevel),
          )
        : [],
    [allergenInfo],
  );

  const symptomInfo: AllergenSymptom | null =
    orderedSymptoms.find((item) => item.defaultLevel === selectedSeverity) ?? null;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-lg font-semibold text-text mt-3">Loading Details...</Text>
      </View>
    );
  }

  if (!allergenInfo || !symptomInfo) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <AlertCircle size={64} color={Colors.unsafe} />
        <Text className="text-xl font-bold text-text mt-4 mb-2">Information Not Found</Text>
        <Text className="text-base text-textLight text-center">
          We couldn&apos;t find symptom information for this allergen.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-5 py-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-text mt-2 mb-2">{allergenInfo.name} Allergy</Text>
        <Text className="text-base text-text leading-6 mb-4">{allergenInfo.description}</Text>

        <View className="flex-row flex-wrap gap-2">
          {orderedSymptoms.map((item) => {
            const isActive = selectedSeverity === item.defaultLevel;
            const color = getSeverityColor(item.defaultLevel);

            return (
              <TouchableOpacity
                key={item.defaultLevel}
                className="rounded-full px-4 py-2 border"
                style={{
                  backgroundColor: isActive ? color : "#FFFFFF",
                  borderColor: color,
                }}
                onPress={() => setSelectedSeverity(item.defaultLevel)}
              >
                <Text
                  className="font-semibold"
                  style={{ color: isActive ? "#FFFFFF" : color }}
                >
                  ระดับ{getSeverityLabel(item.defaultLevel)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="mb-6">
        <View
          className="rounded-full px-4 py-1.5 self-start"
          style={{ backgroundColor: getSeverityColor(symptomInfo.defaultLevel) }}
        >
          <Text className="text-white font-semibold">
            อาการแพ้ระดับ{getSeverityLabel(symptomInfo.defaultLevel)}
          </Text>
        </View>
      </View>

      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <AlertCircle size={20} color={Colors.unsafe} />
          <Text className="text-lg font-semibold text-text ml-2">Common Symptoms</Text>
        </View>
        <View className="bg-card rounded-lg p-3">
          {symptomInfo.symptoms.map((symptom, index) => (
            <View key={index} className="py-2 border-b border-border last:border-b-0">
              <Text className="text-base text-text leading-6">{symptom}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Heart size={20} color={Colors.primary} />
          <Text className="text-lg font-semibold text-text ml-2">First Aid</Text>
        </View>
        <View className="bg-card rounded-lg p-3">
          {symptomInfo.firstAid.map((item, index) => (
            <View key={index} className="py-2 border-b border-border last:border-b-0">
              <Text className="text-base text-text leading-6">{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <AlertTriangle size={20} color={Colors.caution} />
          <Text className="text-lg font-semibold text-text ml-2">When to Seek Medical Help</Text>
        </View>
        <View className="bg-unsafe/10 rounded-lg p-4 border-l-4 border-l-unsafe">
          <Text className="text-base text-text mb-3 font-medium">
            If you experience any of the following symptoms, seek immediate medical attention:
          </Text>
          <View>
            {symptomInfo.whenToSeekHelp.map((item, index) => (
              <View key={index} className="py-2 border-b border-unsafe/20 last:border-b-0">
                <Text className="text-base text-text font-medium">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Clock size={20} color={Colors.secondary} />
          <Text className="text-lg font-semibold text-text ml-2">Also Known As</Text>
        </View>
        <View className="flex-row flex-wrap">
          {allergenInfo.altNames.map((alias, index) => (
            <View key={index} className="bg-card rounded-2xl py-1.5 px-3 mr-2 mb-2">
              <Text className="text-sm text-text">{alias}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-4 p-4 bg-secondary/10 rounded-lg">
        <Text className="text-sm text-textLight italic leading-5">
          Disclaimer: This information is provided for educational purposes only and is not
          intended to be a substitute for professional medical advice, diagnosis, or treatment.
        </Text>
      </View>
    </ScrollView>
  );
}
