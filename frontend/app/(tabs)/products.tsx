import React, { useState } from 'react';
import {
  View,
  Text,
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
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

      <ScrollView className="flex-1 p-4">
        {products.map(product => (
          <View key={product.id} className="bg-white rounded-xl p-3 mb-3 shadow-sm shadow-black/10">
            <View className="flex-row gap-3">
              {product.image ? (
                <Image source={{ uri: product.image }} className="w-20 h-20 rounded-lg" />
              ) :  (
                <View className="w-20 h-20 rounded-lg bg-gray-200 justify-center items-center">
                  <Text className="text-xs text-gray-400">No Image</Text>
                </View>
              )}
              
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <View className="flex-1 mr-2">
                    <Text className="text-base font-bold text-gray-900 mb-0.5" numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{product.brand}</Text>
                  </View>

                  <View className="flex-row gap-1">
                    <TouchableOpacity 
                      className="p-1"
                      onPress={() => handleOpenEdit(product)}
                      disabled={isMutating}
                    >
                      <Edit2 size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="p-1"
                      onPress={() => handleDelete(product)}
                      disabled={isMutating}
                    >
                      <Trash2 size={20} color="#E63946" />
                    </TouchableOpacity >
                  </View>
                </View>

                <Text className="text-xs text-gray-400 mb-2">Barcode: {product.barcode}</Text>
                
                <View className="flex-row flex-wrap gap-1.5">
                  {product.allergenWarnings.map((allergen, idx) => (
                    <View key={idx} className="bg-red-50 px-2 py-1 rounded-md">
                      <Text className="text-[11px] font-semibold text-red-500">{allergen}</Text>
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
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              resetForm();
            }}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Product Name</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Chocolate Chip Cookies"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Brand</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
              placeholder="e.g., Sweet Treats"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Barcode</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.barcode}
              onChangeText={(text) => setFormData({ ...formData, barcode: text })}
              placeholder="e.g., 1234567890123"
              keyboardType="numeric"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Ingredients (one per line)</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200 min-h-[120px]"
              textAlignVertical="top"
              value={formData.ingredients}
              onChangeText={(text) => setFormData({ ...formData, ingredients: text })}
              placeholder="Wheat flour&#10;Sugar&#10;Butter"
              multiline
              numberOfLines={6}
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Allergen Warnings (comma separated)</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.allergenWarnings}
              onChangeText={(text) => setFormData({ ...formData, allergenWarnings: text })}
              placeholder="e.g., wheat, milk, eggs"
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">Image URL</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.image}
              onChangeText={(text) => setFormData({ ...formData, image: text })}
              placeholder="https://..."
              autoCapitalize="none"
            />
            {formData.image ? (
              <Image 
                source={{ uri: formData.image }} 
                className="w-full h-52 rounded-lg mt-3"
                resizeMode="cover"
              />
            ) : null}
          </ScrollView>

          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              className="rounded-lg py-3.5 items-center"
              style={{ backgroundColor: Colors.primary }}
              disabled={isMutating}
              onPress={handleSave}
            >
              <Text className="text-base font-semibold text-white">
                {isMutating ? 'Saving...' : (editingProduct ? 'Update' : 'Add')}
              </Text>
            </TouchableOpacity >
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}