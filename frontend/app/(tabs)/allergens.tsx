import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
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

      {isLoading && <Text style={styles.loadingText}>Loading allergens...</Text>}
      {isError && <Text style={styles.loadingText}>Failed to load allergens.</Text>}

      <ScrollView style={styles.list}>
        {allergens.map(allergen => (
          <View key={allergen.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{allergen.name}</Text>
                <View style={[styles.badge, { backgroundColor: getSeverityColor(allergen.defaultLevel) }]}>
                  <Text style={styles.badgeText}>{allergen.defaultLevel}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleOpenEdit(allergen)}
                  disabled={isMutating}
                >
                  <Edit2 size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn}
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
            <Text style={styles.description}>{allergen.description || 'No description'}</Text>
            <Text style={styles.aliases}>
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingAllergen ? 'Edit Allergen' : 'Add Allergen'}
            </Text>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              resetForm();
            }}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Peanuts"
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Brief description"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Aliases (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.altNames}
              onChangeText={(text) => setFormData({ ...formData, altNames: text })}
              placeholder="e.g., groundnuts, arachis oil"
            />

            <Text style={styles.label}>Severity *</Text>
            <View style={styles.severityButtons}>
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map(severity => (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.severityBtn,
                    formData.defaultLevel === severity && styles.severityBtnActive,
                    { borderColor: getSeverityColor(severity) },
                    formData.defaultLevel === severity && { backgroundColor: getSeverityColor(severity) },
                  ]}
                  onPress={() => setFormData({ ...formData, defaultLevel: severity })}
                >
                  <Text
                    style={[
                      styles.severityBtnText,
                      formData.defaultLevel === severity && styles.severityBtnTextActive,
                    ]}
                  >
                    {severity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isMutating}
            >
              <Text style={styles.saveBtnText}>
                {isMutating ? 'Saving...' : (editingAllergen ? 'Update' : 'Add')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  aliases: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  severityBtnActive: {
    borderWidth: 2,
  },
  severityBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  severityBtnTextActive: {
    color: '#fff',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});