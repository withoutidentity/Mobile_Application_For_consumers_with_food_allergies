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
  Image,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { Product } from '@/types';
import Colors from '@/constants/Colors';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/data/productService";

type ProductFormData = {
  name: string;
  barcode: string;
  brand: string;
  ingredients: string;
  allergenWarnings: string;
  image: string;
};

export default function AdminProductsScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    barcode: '',
    ingredients: '',
    allergenWarnings: '',
    image: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      barcode: '',
      ingredients: '',
      allergenWarnings: '',
      image: '',
    });
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      barcode: product.barcode,
      ingredients: product.ingredients.join('\n'),
      allergenWarnings: product.allergenWarnings.join(', '),
      image: product.image || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.barcode.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      barcode: formData.barcode.trim(),
      ingredients: formData.ingredients
        .split('\n')
        .map(i => i.trim())
        .filter(i => i),
      allergenWarnings: formData.allergenWarnings
        .split(',')
        .map(a => a.trim())
        .filter(a => a),
      image: formData.image.trim() || undefined,
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };


  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(product.id),
        },
      ]
    );
  };

  // --- React Query ---
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setModalVisible(false);
      resetForm();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    },
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    ...commonMutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: any }) => updateProduct(id, payload),
    ...commonMutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    ...commonMutationOptions,
  });

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // --- End React Query ---

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: 'Manage Products',
          headerRight: () => (
            <TouchableOpacity onPress={handleOpenAdd}>
              <Plus size={24} color="#fff" style={{ marginRight: 16 }}/>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.list} >
        {products.map(product => (
          <View key={product.id} style={styles.card}>
            <View style={styles.cardContent}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              ) :  (
                <View style={[styles.productImage, styles.imagePlaceholder]}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <View style={styles.cardHeader}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.brand}>{product.brand}</Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity 
                      style={styles.actionBtn}
                      onPress={() => handleOpenEdit(product)}
                      disabled={isMutating}
                    >
                      <Edit2 size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionBtn}
                      onPress={() => handleDelete(product)}
                      disabled={isMutating}
                    >
                      <Trash2 size={20} color="#E63946" />
                    </TouchableOpacity >
                  </View>
                </View>
                <Text style={styles.barcode}>Barcode: {product.barcode}</Text>
                <View style={styles.allergensContainer}>
                  {product.allergenWarnings.map((allergen, idx) => (
                    <View key={idx} style={styles.allergenTag}>
                      <Text style={styles.allergenTagText}>{allergen}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
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
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              resetForm();
            }}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Chocolate Chip Cookies"
            />

            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
              placeholder="e.g., Sweet Treats"
            />

            <Text style={styles.label}>Barcode</Text>
            <TextInput
              style={styles.input}
              value={formData.barcode}
              onChangeText={(text) => setFormData({ ...formData, barcode: text })}
              placeholder="e.g., 1234567890123"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Ingredients (one per line)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.ingredients}
              onChangeText={(text) => setFormData({ ...formData, ingredients: text })}
              placeholder="Wheat flour&#10;Sugar&#10;Butter"
              multiline
              numberOfLines={6}
            />

            <Text style={styles.label}>Allergen Warnings (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.allergenWarnings}
              onChangeText={(text) => setFormData({ ...formData, allergenWarnings: text })}
              placeholder="e.g., wheat, milk, eggs"
            />

            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={formData.image}
              onChangeText={(text) => setFormData({ ...formData, image: text })}
              placeholder="https://..."
              autoCapitalize="none"
            />
            {formData.image ? (
              <Image 
                source={{ uri: formData.image }} 
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveBtn}
              disabled={isMutating}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>
                {isMutating ? 'Saving...' : (editingProduct ? 'Update' : 'Add')}
              </Text>
            </TouchableOpacity >
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
  },
  productInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  brand: {
    fontSize: 14,
    color: '#666',
  },
  barcode: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allergenTag: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  allergenTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E63946',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
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