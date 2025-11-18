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
import { Stack } from 'expo-router';
import { Plus, Edit2, Trash2, X } from 'lucide-react-native';
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
      defaultLevel: allergen.defaultLevel,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Name and Description).');
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
      'Delete Allergen',
      `Are you sure you want to delete "${allergen.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
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
      Alert.alert('Success', 'Allergen deleted successfully.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete allergen.');
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Manage Allergens',
          headerRight: () => (
            <TouchableOpacity onPress={handleOpenAdd}>
              <Plus size={24} color="#fff" style={{ marginRight: 16 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading && <Text className="text-center p-5 text-base text-gray-500">Loading allergens...</Text>}
      {isError && <Text className="text-center p-5 text-base text-gray-500">Failed to load allergens.</Text>}

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
                  <Text className="text-[11px] font-semibold text-white uppercase">{allergen.defaultLevel}</Text>
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
              {allergen.description || 'No description'}
            </Text>
            <Text className="text-xs text-gray-400">
              Aliases: {allergen.altNames.join(', ') || 'None'}
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
              {editingAllergen ? 'Edit Allergen' : 'Add Allergen'}
            </Text>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              resetForm();
            }}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Name *</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Peanuts"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Description *</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200 min-h-[80px]"
              textAlignVertical="top"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Brief description"
              multiline
              numberOfLines={3}
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Aliases (comma-separated)</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.altNames}
              onChangeText={(text) => setFormData({ ...formData, altNames: text })}
              placeholder="e.g., groundnuts, arachis oil"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Severity *</Text>
            <View className="flex-row gap-3">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map(severity => {
                const isActive = formData.defaultLevel === severity;
                const color = getSeverityColor(severity);
                return (
                  <TouchableOpacity
                    key={severity}
                    className="flex-1 py-3 px-4 rounded-lg border-2 items-center"
                    style={{ 
                      borderColor: color,
                      backgroundColor: isActive ? color : 'transparent'
                    }}
                    onPress={() => setFormData({ ...formData, defaultLevel: severity })}
                  >
                    <Text
                      className={`text-sm font-semibold capitalize ${isActive ? 'text-white' : 'text-gray-500'}`}
                    >
                      {severity}
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
                {isMutating ? 'Saving...' : (editingAllergen ? 'Update' : 'Add')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}