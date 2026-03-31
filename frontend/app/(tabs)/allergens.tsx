import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Edit2, Plus, Trash2, X } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Colors from '@/constants/Colors';
import { Allergen, Severity } from '@/types';
import { createAllergen, deleteAllergen, fetchAllergens, updateAllergen } from '@/data/allergenService';
import { getAllergenDisplayName, getLocalizedAliasNames } from '@/utils/allergenLocalization';

type SeverityForm = {
  symptoms: string;
  firstAid: string;
};

type AllergenFormData = {
  name: string;
  description: string;
  altNames: string;
  whenToSeekHelp: string;
  severityDetails: Record<Severity, SeverityForm>;
};

const severityOrder: Severity[] = ['LOW', 'MEDIUM', 'HIGH'];

const emptySeverityForm = (): Record<Severity, SeverityForm> => ({
  LOW: { symptoms: '', firstAid: '' },
  MEDIUM: { symptoms: '', firstAid: '' },
  HIGH: { symptoms: '', firstAid: '' },
});

const emptyForm = (): AllergenFormData => ({
  name: '',
  description: '',
  altNames: '',
  whenToSeekHelp: '',
  severityDetails: emptySeverityForm(),
});

const splitLines = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case 'HIGH':
      return '#E63946';
    case 'MEDIUM':
      return '#F77F00';
    case 'LOW':
      return '#06D6A0';
    default:
      return '#999';
  }
};

const getSeverityLabel = (severity: Severity) => {
  switch (severity) {
    case 'HIGH':
      return 'สูง';
    case 'MEDIUM':
      return 'ปานกลาง';
    case 'LOW':
      return 'ต่ำ';
    default:
      return severity;
  }
};

export default function AdminAllergensScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);
  const [formData, setFormData] = useState<AllergenFormData>(emptyForm);

  const resetForm = () => {
    setFormData(emptyForm());
    setEditingAllergen(null);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (allergen: Allergen) => {
    const severityDetails = emptySeverityForm();

    allergen.symptoms.forEach((symptom) => {
      severityDetails[symptom.defaultLevel] = {
        symptoms: symptom.symptoms.join('\n'),
        firstAid: symptom.firstAid.join('\n'),
      };
    });

    setEditingAllergen(allergen);
    setFormData({
      name: allergen.name,
      description: allergen.description || '',
      altNames: allergen.altNames.join(', '),
      whenToSeekHelp: allergen.symptoms[0]?.whenToSeekHelp.join('\n') || '',
      severityDetails,
    });
    setModalVisible(true);
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    description: formData.description.trim(),
    altNames: formData.altNames
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    whenToSeekHelp: splitLines(formData.whenToSeekHelp),
    symptoms: severityOrder.map((severity) => ({
      defaultLevel: severity,
      symptoms: splitLines(formData.severityDetails[severity].symptoms),
      firstAid: splitLines(formData.severityDetails[severity].firstAid),
    })),
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อสารก่อภูมิแพ้');
      return;
    }

    const payload = buildPayload();
    const hasAnySymptomData = payload.symptoms.some(
      (item) => item.symptoms.length > 0 || item.firstAid.length > 0,
    );

    if (!hasAnySymptomData) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกอาการหรือวิธีปฐมพยาบาลอย่างน้อย 1 ระดับ');
      return;
    }

    if (editingAllergen) {
      updateMutation.mutate({ id: editingAllergen.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteConfirm = (allergen: Allergen) => {
    Alert.alert(
      'ลบสารก่อภูมิแพ้',
      `คุณแน่ใจหรือไม่ว่าต้องการลบ "${allergen.name}"?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(allergen.id),
        },
      ],
    );
  };

  const { data: allergens = [], isLoading, isError } = useQuery({
    queryKey: ['allergens'],
    queryFn: fetchAllergens,
  });

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      closeModal();
    },
    onError: (error: any) => {
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
    },
  };

  const createMutation = useMutation({
    mutationFn: createAllergen,
    ...commonMutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReturnType<typeof buildPayload> }) =>
      updateAllergen(id, payload),
    ...commonMutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAllergen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      Alert.alert('สำเร็จ', 'ลบสารก่อภูมิแพ้เรียบร้อยแล้ว');
    },
    onError: (error: any) => {
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถลบสารก่อภูมิแพ้ได้');
    },
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'จัดการสารก่อภูมิแพ้',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          // headerLeft: () => (
          //   <TouchableOpacity onPress={() => router.push('/(tabs)/admin')} style={{ marginLeft: 5 }}>
          //     <ArrowLeft size={24} color="#fff" />
          //   </TouchableOpacity>
          // ),
          headerRight: () => (
            <TouchableOpacity onPress={handleOpenAdd}>
              <Plus size={24} color="#fff" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading && <Text className="text-center p-5 text-base text-gray-500">กำลังโหลดข้อมูล...</Text>}
      {isError && (
        <Text className="text-center p-5 text-base text-gray-500">
          ไม่สามารถโหลดข้อมูลสารก่อภูมิแพ้ได้
        </Text>
      )}

      <ScrollView className="flex-1 p-4">
        {allergens.map((allergen) => (
          <View key={allergen.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm shadow-black/10">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{getAllergenDisplayName(allergen)}</Text>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {severityOrder.map((severity) => {
                    const symptom = allergen.symptoms.find((item) => item.defaultLevel === severity);
                    if (!symptom) {
                      return null;
                    }

                    return (
                      <View
                        key={severity}
                        className="px-2 py-1 rounded-md"
                        style={{ backgroundColor: getSeverityColor(severity) }}
                      >
                        <Text className="text-[11px] font-semibold text-white">
                          ระดับ{getSeverityLabel(severity)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity className="p-2" onPress={() => handleOpenEdit(allergen)} disabled={isMutating}>
                  <Edit2 size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleDeleteConfirm(allergen)}
                  disabled={isMutating}
                >
                  <Trash2
                    size={20}
                    color={deleteMutation.isPending && deleteMutation.variables === allergen.id ? '#ccc' : '#E63946'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-sm text-gray-500 mb-2 leading-5">
              {allergen.description || 'ไม่มีคำอธิบาย'}
            </Text>
            <Text className="text-xs text-gray-400 mb-2">
              ชื่อเรียกอื่น: {getLocalizedAliasNames(allergen).join(', ') || 'ไม่มี'}
            </Text>
            <Text className="text-xs text-gray-400">
              เมื่อใดควรไปโรงพยาบาล: {allergen.symptoms[0]?.whenToSeekHelp.length || 0} รายการ
            </Text>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              {editingAllergen ? 'แก้ไขสารก่อภูมิแพ้' : 'เพิ่มสารก่อภูมิแพ้'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-base font-semibold mb-2 mt-3">ชื่อสารก่อภูมิแพ้ *</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              placeholder="เช่น นมวัว, ถั่วลิสง"
              placeholderTextColor="#999"
            />

            <Text className="text-base font-semibold  mb-2 mt-3">รายละเอียด</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200 min-h-[80px]"
              textAlignVertical="top"
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              placeholder="คำอธิบายแบบย่อ"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">
              ชื่อเรียกอื่น (คั่นด้วยเครื่องหมาย ,)
            </Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.altNames}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, altNames: text }))}
              placeholder="เช่น Casein, Whey Protein"
              placeholderTextColor="#999"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-4">
              เมื่อใดควรไปโรงพยาบาล (ใช้เหมือนกันทุกระดับ)
            </Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200 min-h-[110px]"
              textAlignVertical="top"
              value={formData.whenToSeekHelp}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, whenToSeekHelp: text }))}
              placeholder="หนึ่งข้อ ต่อหนึ่งบรรทัด"
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
            />

            {severityOrder.map((severity) => (
              <View key={severity} className="mt-5 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <View className="self-start px-3 py-1 rounded-full mb-3" style={{ backgroundColor: getSeverityColor(severity) }}>
                  <Text className="text-white font-semibold">ระดับ{getSeverityLabel(severity)}</Text>
                </View>

                <Text className="text-base font-semibold mb-2">อาการ</Text>
                <TextInput
                  className="bg-white rounded-lg p-3 text-base border border-gray-200 min-h-[110px]"
                  textAlignVertical="top"
                  value={formData.severityDetails[severity].symptoms}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      severityDetails: {
                        ...prev.severityDetails,
                        [severity]: { ...prev.severityDetails[severity], symptoms: text },
                      },
                    }))
                  }
                  placeholder="หนึ่งข้อ ต่อหนึ่งบรรทัด"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={5}
                />

                <Text className="text-base font-semibold mb-2 mt-3">การปฐมพยาบาลเบื้องต้น</Text>
                <TextInput
                  className="bg-white rounded-lg p-3 text-base border border-gray-200 min-h-[110px]"
                  textAlignVertical="top"
                  value={formData.severityDetails[severity].firstAid}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      severityDetails: {
                        ...prev.severityDetails,
                        [severity]: { ...prev.severityDetails[severity], firstAid: text },
                      },
                    }))
                  }
                  placeholder="หนึ่งข้อ ต่อหนึ่งบรรทัด"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={5}
                />
              </View>
            ))}
          </ScrollView>

          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              className="rounded-lg py-3.5 items-center"
              style={{ backgroundColor: Colors.primary }}
              onPress={handleSave}
              disabled={isMutating}
            >
              <Text className="text-base font-semibold text-white">
                {isMutating ? 'กำลังบันทึก...' : editingAllergen ? 'อัปเดตข้อมูล' : 'เพิ่มข้อมูล'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
