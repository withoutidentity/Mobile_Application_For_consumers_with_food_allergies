import allergens from '@/data/allergens';
import allergenSymptoms from '@/data/symptoms';
import { useRouter } from 'expo-router';
import { AlertCircle, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function GuideScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAllergens = allergens.filter(allergen => 
    allergen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    allergen.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAllergenPress = (allergenId: string) => {
    router.push(`/symptom/${allergenId}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#E76F51'; // unsafe
      case 'medium':
        return '#E9C46A'; // caution
      case 'low':
        return '#2A9D8F'; // safe
      default:
        return '#2A9D8F'; // primary fallback
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#F8F9FA]" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-[#333333] mb-2">Allergy Symptoms</Text>
        <Text className="text-base text-[#666666]">Learn about symptoms and first aid</Text>
      </View>

      <View className="flex-row items-center bg-white rounded-lg px-3 py-2 mb-4 border border-[#E5E5E5]">
        <Search size={20} color="#666666" className="mr-2" />
        <TextInput
          className="flex-1 h-12 text-base text-[#333333]"
          placeholder="Search allergens..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666666"
        />
      </View>

      <View className="flex-row items-center bg-[#2A9D8F]/10 rounded-lg p-3 mb-4">
        <AlertCircle size={20} color="#2A9D8F" />
        <Text className="ml-2 text-[#333333] text-sm flex-1">
          Tap on an allergen to view detailed symptoms and first aid information.
        </Text>
      </View>

      <View className="mt-2">
        {filteredAllergens.map(allergen => {
          const symptomInfo = allergenSymptoms.find(s => s.allergenId === allergen.id);
          const symptomCount = symptomInfo ? symptomInfo.symptoms.length : 0;

          return (
            <Pressable
              key={allergen.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => handleAllergenPress(allergen.id)}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold text-[#333333] flex-1">{allergen.name}</Text>
                <View className="px-2 py-1 rounded-full" style={{ backgroundColor: getSeverityColor(allergen.severity) }}>
                  <Text className="text-white text-xs font-semibold">
                    {allergen.severity.charAt(0).toUpperCase() + allergen.severity.slice(1)}
                  </Text>
                </View>
              </View>

              <Text className="text-sm text-[#666666] mb-3">{allergen.description}</Text>

              <View className="flex-row items-center">
                <AlertCircle size={16} color="#666666" />
                <Text className="ml-2 text-sm text-[#666666]">
                  {symptomCount} {symptomCount === 1 ? 'symptom' : 'symptoms'}
                </Text>
              </View>
            </Pressable>
          );
        })}
        {filteredAllergens.length === 0 && (
          <View className="p-6 items-center">
            <Text className="text-base text-[#666666] text-center">
              No allergens found matching "{searchQuery}"
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
