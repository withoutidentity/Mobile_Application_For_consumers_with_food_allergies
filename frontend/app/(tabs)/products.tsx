import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Check, ChevronDown, Edit2, ImagePlus, Plus, Trash2, X } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { Product } from '@/types';
import { ProductPayload, createProduct, deleteProduct, getProducts, updateProduct } from '@/data/productService';
import { fetchAllergens } from '@/data/allergenService';
import { getAllergenDisplayName, getLocalizedAliasNames } from '@/utils/allergenLocalization';

type ProductFormData = {
  name: string;
  barcode: string;
  brand: string;
  ingredients: string;
  allergenWarningIds: number[];
  imageUri: string;
  imageFile: ProductPayload['imageFile'];
  removeImage: boolean;
};

const emptyForm = (): ProductFormData => ({
  name: '',
  brand: '',
  barcode: '',
  ingredients: '',
  allergenWarningIds: [],
  imageUri: '',
  imageFile: null,
  removeImage: false,
});

export default function AdminProductsScreen() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);

  const resetForm = () => {
    setFormData(emptyForm());
    setEditingProduct(null);
    setSelectorOpen(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: allergens = [] } = useQuery({
    queryKey: ['allergens'],
    queryFn: fetchAllergens,
  });

  const allergenLookup = useMemo(() => {
    const lookup = new Map<string, number>();
    allergens.forEach((allergen) => {
      lookup.set(allergen.name.toLowerCase(), allergen.id);
      allergen.altNames.forEach((alt) => lookup.set(alt.toLowerCase(), allergen.id));
    });
    return lookup;
  }, [allergens]);

  const selectedAllergenNames = useMemo(
    () =>
      formData.allergenWarningIds
        .map((id) => {
          const allergen = allergens.find((item) => item.id === id);
          return allergen ? getAllergenDisplayName(allergen) : undefined;
        })
        .filter((value): value is string => Boolean(value)),
    [allergens, formData.allergenWarningIds],
  );

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
      allergenWarningIds: product.allergenWarnings
        .map((warning) => allergenLookup.get(warning.toLowerCase()))
        .filter((id): id is number => typeof id === 'number'),
      imageUri: product.image || '',
      imageFile: null,
      removeImage: false,
    });
    setModalVisible(true);
  };

  const toggleAllergen = (allergenId: number) => {
    setFormData((prev) => ({
      ...prev,
      allergenWarningIds: prev.allergenWarningIds.includes(allergenId)
        ? prev.allergenWarningIds.filter((id) => id !== allergenId)
        : [...prev.allergenWarningIds, allergenId],
    }));
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('ต้องอนุญาตการเข้าถึงรูปภาพ', 'กรุณาอนุญาตให้แอปเข้าถึงคลังรูปเพื่อเลือกรูปสินค้า');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.85,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `product-${Date.now()}.jpg`;

    setFormData((prev) => ({
      ...prev,
      imageUri: asset.uri,
      imageFile: {
        uri: asset.uri,
        name: fileName,
        type: asset.mimeType ?? 'image/jpeg',
      },
      removeImage: false,
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUri: '',
      imageFile: null,
      removeImage: Boolean(editingProduct?.image),
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.barcode.trim()) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อสินค้าและบาร์โค้ด');
      return;
    }

    const payload: ProductPayload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      barcode: formData.barcode.trim(),
      ingredients: formData.ingredients
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      allergenWarningIds: formData.allergenWarningIds,
      imageFile: formData.imageFile,
      removeImage: formData.removeImage,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert('ลบสินค้า', `คุณแน่ใจหรือไม่ว่าต้องการลบ "${product.name}"?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(product.id),
      },
    ]);
  };

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
    onError: (error: any) => {
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
    },
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    ...commonMutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) => updateProduct(id, payload),
    ...commonMutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    ...commonMutationOptions,
  });

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'จัดการสินค้า',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleOpenAdd}>
              <Plus size={24} color="#fff" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 p-4">
        {products.map((product) => (
          <View key={product.id} className="bg-white rounded-xl p-3 mb-3 shadow-sm shadow-black/10">
            <View className="flex-row gap-3">
              {product.image ? (
                <Image source={{ uri: product.image }} className="w-20 h-20 rounded-lg" />
              ) : (
                <View className="w-20 h-20 rounded-lg bg-gray-200 justify-center items-center">
                  <Text className="text-xs text-gray-400">ไม่มีรูป</Text>
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
                    <TouchableOpacity className="p-1" onPress={() => handleOpenEdit(product)} disabled={isMutating}>
                      <Edit2 size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1" onPress={() => handleDelete(product)} disabled={isMutating}>
                      <Trash2 size={20} color="#E63946" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text className="text-xs text-gray-400 mb-2">บาร์โค้ด: {product.barcode}</Text>

                <View className="flex-row flex-wrap gap-1.5">
                  {product.allergenWarnings.map((allergen, idx) => (
                    <View key={idx} className="bg-red-50 px-2 py-1 rounded-md">
                      <Text className="text-[11px] font-semibold text-red-500">
                        {getAllergenDisplayName(allergen)}
                      </Text>
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
        onRequestClose={closeModal}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-base font-semibold mb-2 mt-3">ชื่อผลิตภัณฑ์</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              placeholder="เช่น คุกกี้ช็อกโกแลตชิพ"
              placeholderTextColor="#999"
            />

            <Text className="text-base font-semibold mb-2 mt-3">แบรนด์/ยี่ห้อ</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.brand}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, brand: text }))}
              placeholder="เช่น Sweet Treats"
              placeholderTextColor="#999"
            />

            <Text className="text-base font-semibold mb-2 mt-3">บาร์โค้ด</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
              value={formData.barcode}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, barcode: text }))}
              placeholder="เช่น 1234567890123"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text className="text-base font-semibold mb-2 mt-3">ส่วนผสม (หนึ่งอย่างต่อบรรทัด)</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200 min-h-[120px]"
              textAlignVertical="top"
              value={formData.ingredients}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, ingredients: text }))}
              placeholder={'แป้งสาลี\nน้ำตาล\nเนย'}
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
            />

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">คำเตือนสารก่อภูมิแพ้</Text>
            <TouchableOpacity
              className="bg-gray-50 rounded-lg px-3 py-3 border border-gray-200 flex-row items-center justify-between"
              onPress={() => setSelectorOpen((prev) => !prev)}
            >
              <Text className="text-base text-gray-700 flex-1">
                {selectedAllergenNames.length > 0
                  ? selectedAllergenNames.join(', ')
                  : 'เลือกสารก่อภูมิแพ้ที่เกี่ยวข้อง'}
              </Text>
              <ChevronDown size={18} color="#6B7280" />
            </TouchableOpacity>

            {selectorOpen && (
              <View className="mt-2 border border-gray-200 rounded-lg bg-white">
                {allergens.map((allergen) => {
                  const selected = formData.allergenWarningIds.includes(allergen.id);

                  return (
                    <TouchableOpacity
                      key={allergen.id}
                      className="flex-row items-center justify-between px-3 py-3 border-b border-gray-100"
                      onPress={() => toggleAllergen(allergen.id)}
                    >
                      <View className="flex-1 pr-3">
                        <Text className="text-base text-gray-900">{getAllergenDisplayName(allergen)}</Text>
                        <Text className="text-xs text-gray-400">
                          {getLocalizedAliasNames(allergen).join(', ') || 'ไม่มีชื่ออื่น'}
                        </Text>
                      </View>
                      <View
                        className="w-6 h-6 rounded-md items-center justify-center border"
                        style={{
                          backgroundColor: selected ? Colors.primary : '#fff',
                          borderColor: selected ? Colors.primary : '#D1D5DB',
                        }}
                      >
                        {selected ? <Check size={16} color="#fff" /> : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {selectedAllergenNames.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {selectedAllergenNames.map((name) => (
                  <View key={name} className="bg-red-50 px-3 py-1.5 rounded-full">
                    <Text className="text-sm text-red-500 font-medium">{name}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text className="text-base font-semibold text-gray-900 mb-2 mt-3">รูปสินค้า</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 rounded-lg px-4 py-3 border border-gray-200 bg-gray-50 flex-row items-center justify-center gap-2"
                onPress={handlePickImage}
              >
                <ImagePlus size={18} color={Colors.primary} />
                <Text className="text-base font-medium" style={{ color: Colors.primary }}>
                  เลือกรูปจากเครื่อง
                </Text>
              </TouchableOpacity>
              {formData.imageUri ? (
                <TouchableOpacity
                  className="rounded-lg px-4 py-3 border border-red-200 bg-red-50 items-center justify-center"
                  onPress={handleRemoveImage}
                >
                  <Text className="text-sm font-medium text-red-500">ลบรูป</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Text className="text-xs text-gray-400 mt-2">รองรับไฟล์ JPG, PNG และ WEBP ขนาดไม่เกิน 5 MB</Text>
            {formData.imageUri ? (
              <Image source={{ uri: formData.imageUri }} className="w-full h-52 rounded-lg mt-3" resizeMode="cover" />
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
                {isMutating ? 'กำลังบันทึก...' : editingProduct ? 'อัปเดต' : 'เพิ่ม'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
