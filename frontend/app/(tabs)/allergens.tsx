import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Plus, Edit2, Trash2, X, ArrowLeft } from 'lucide-react-native';
import { Allergen, Severity } from '@/types';
import Colors from '@/constants/Colors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAllergen, deleteAllergen, fetchAllergens, updateAllergen } from '@/data/allergenService';

type AllergenFormData = {
  name: string;
  description: string;
  altNames: string;
  defaultLevel: Severity;
};

export default function AdminAllergensScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);
  const [formData, setFormData] = useState<AllergenFormData>({
    name: '',
    description: '',
    altNames: '',
    defaultLevel: 'MEDIUM',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      altNames: '',
      defaultLevel: 'MEDIUM',
    });
    setEditingAllergen(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (allergen: Allergen) => {
    setEditingAllergen(allergen);
    setFormData({
      name: allergen.name,
      description: allergen.description || '',
      altNames: allergen.altNames.join(', '),
      defaultLevel: (allergen.defaultLevel?.toUpperCase() || 'MEDIUM') as Severity,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      altNames: formData.altNames.split(',').map(a => a.trim()).filter(a => a),
      defaultLevel: formData.defaultLevel,
    };

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
      ]
    );
  };

  // --- React Query ---
  const { data: allergens = [], isLoading, isError } = useQuery({
    queryKey: ['allergens'],
    queryFn: fetchAllergens,
  });

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      setModalVisible(false);
      resetForm();
    },
    onError: (error: any) => {
      Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
    },
  };

  const createMutation = useMutation({
    mutationFn: createAllergen,
    ...commonMutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: any }) => updateAllergen(id, payload),
    ...commonMutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAllergen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergens'] });
      Alert.alert('สำเร็จ', 'ลบสารก่อภูมิแพ้เรียบร้อยแล้ว');
    },
    onError: (error: any) => {
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถลบสารก่อภูมิแพ้ได้');
    },
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // --- End React Query ---

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'HIGH': return '#E63946';
      case 'MEDIUM': return '#F77F00';
      case 'LOW': return '#06D6A0';
      default: return '#999';
    }
  };

  // แปลงระดับความรุนแรงเป็นภาษาไทยสำหรับแสดงผล
  const getSeverityLabel = (severity: Severity) => {
    switch (severity) {
      case 'HIGH': return 'สูง (HIGH)';
      case 'MEDIUM': return 'ปานกลาง (MEDIUM)';
      case 'LOW': return 'ต่ำ (LOW)';
      default: return severity;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'จัดการสารก่อภูมิแพ้',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/admin')} 
              style={{ marginLeft: 5 }}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleOpenAdd}>
              <Plus size={24} color="#fff" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading && <Text className="text-center p-5 text-base text-gray-500">กำลังโหลดข้อมูล...</Text>}
      {isError && <Text className="text-center p-5 text-base text-gray-500">ไม่สามารถโหลดข้อมูลสารก่อภูมิแพ้ได้</Text>}

      <ScrollView className="flex-1 p-4">
        {allergens.map(allergen => (
          <View key={allergen.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm shadow-black/10">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="text-lg font-bold text-gray-900">{allergen.name}</Text>
                <View 
                  className="px-2 py-1 rounded-md"
                  style={{ backgroundColor: getSeverityColor(allergen.defaultLevel) }}
                >
                  <Text className="text-[11px] font-semibold text-white uppercase">{getSeverityLabel(allergen.defaultLevel)}</Text>
                </View>
              </View>
              
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => handleOpenEdit(allergen)}
                  disabled={isMutating}
                >
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
            <Text className="text-xs text-gray-400">
              ชื่อเรียกอื่น: {allergen.altNames.join(', ') || 'ไม่มี'}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              {editingAllergen ? 'แก้ไขสารก่อภูมิแพ้' : 'เพิ่มสารก่อภูมิแพ้'}
            </Text>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              resetForm();
            }}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">ชื่อสารก่อภูมิแพ้ *</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="เช่น นมวัว, ถั่วลิสง"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">รายละเอียด *</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200 min-h-[80px]"
              textAlignVertical="top"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="คำอธิบายแบบย่อ"
              multiline
              numberOfLines={3}
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">ชื่อเรียกอื่น (คั่นด้วยเครื่องหมายลูกน้ำ ,)</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.altNames}
              onChangeText={(text) => setFormData({ ...formData, altNames: text })}
              placeholder="เช่น คาเซอีน, เวย์โปรตีน"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">ระดับความรุนแรงตั้งต้น *</Text>
            <View className="flex-row gap-3">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map(severity => {
                const isActive = formData.defaultLevel === severity;
                
                const severityStyles = {
                  LOW: {
                    active: { bg: '#06D6A0', border: '#06D6A0', text: '#FFFFFF' },
                    inactive: { bg: '#FFFFFF', border: '#D1D5DB', text: '#6B7280' }
                  },
                  MEDIUM: {
                    active: { bg: '#F77F00', border: '#F77F00', text: '#FFFFFF' },
                    inactive: { bg: '#FFFFFF', border: '#D1D5DB', text: '#6B7280' }
                  },
                  HIGH: {
                    active: { bg: '#E63946', border: '#E63946', text: '#FFFFFF' },
                    inactive: { bg: '#FFFFFF', border: '#D1D5DB', text: '#6B7280' }
                  }
                };
                
                const currentStyle = isActive ? severityStyles[severity].active : severityStyles[severity].inactive;
                
                return (
                  <TouchableOpacity
                    key={severity}
                    className="flex-1 py-3 px-2 rounded-lg items-center"
                    style={{
                      backgroundColor: currentStyle.bg,
                      borderWidth: 2,
                      borderColor: currentStyle.border,
                      shadowColor: isActive ? currentStyle.border : '#000',
                      shadowOffset: { width: 0, height: isActive ? 2 : 1 },
                      shadowOpacity: isActive ? 0.25 : 0.1,
                      shadowRadius: isActive ? 3.84 : 1,
                      elevation: isActive ? 5 : 2,
                    }}
                    onPress={() => setFormData(prev => ({ ...prev, defaultLevel: severity }))}
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-xs font-bold uppercase text-center"
                      style={{ color: currentStyle.text }}
                    >
                      {getSeverityLabel(severity)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              className="rounded-lg py-3.5 items-center"
              style={{ backgroundColor: Colors.primary }}
              onPress={handleSave}
              disabled={isMutating}
            >
              <Text className="text-base font-semibold text-white">
                {isMutating ? 'กำลังบันทึก...' : (editingAllergen ? 'อัปเดตข้อมูล' : 'เพิ่มข้อมูล')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}