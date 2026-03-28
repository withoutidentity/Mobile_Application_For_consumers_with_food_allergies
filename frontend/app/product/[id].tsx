import Button from '@/components/Button';
import SafetyBadge from '@/components/SafetyBadge';
import Colors from '@/constants/Colors';
import { useUserProfile } from '@/context/UserProfileContext';
import { fetchAllergens } from '@/data/allergens';
import getProducts from '@/data/productService';
import { Allergen, Product } from '@/types';
import {
  getAllergenCanonicalKey,
  getAllergenDisplayName,
  normalizeAllergenTerm,
  translateAllergenTermToThai,
} from '@/utils/allergenLocalization';
import { analyzeProduct } from '@/utils/productAnalyzer';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProductDetailScreen() {
  const { id: idFromParams } = useLocalSearchParams<{ id: string }>();
  const { profile } = useUserProfile();
  const [product, setProduct] = useState<Product | null>(null);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, fetchedAllergens] = await Promise.all([getProducts(), fetchAllergens()]);
        const numericId = parseInt(idFromParams, 10);
        const foundProduct = products.find((item) => item.id === numericId) ?? null;

        setProduct(foundProduct);
        setAllAllergens(fetchedAllergens);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idFromParams]);

  if (loading) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundTitle}>กำลังโหลดข้อมูลสินค้า...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.notFound}>
        <AlertCircle size={64} color={Colors.unsafe} />
        <Text style={styles.notFoundTitle}>ไม่พบสินค้า</Text>
        <Text style={styles.notFoundText}>ไม่พบข้อมูลสินค้านี้ในฐานข้อมูล</Text>
      </View>
    );
  }

  const analysis = analyzeProduct(product, profile, allAllergens);

  const getMatchedAllergenNames = () =>
    analysis.directMatches.map((allergen) => getAllergenDisplayName(allergen));

  const handleFindAlternatives = () => {
    Alert.alert('ยังไม่พร้อมใช้งาน', 'ระบบแนะนำสินค้าทางเลือกจะเปิดใช้งานในการอัปเดตถัดไป', [
      { text: 'ตกลง' },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.safetyContainer}>
          <SafetyBadge status={analysis.safetyStatus} size="large" />
        </View>

        {analysis.safetyStatus === 'unsafe' && (
          <View style={styles.warningCard}>
            <AlertCircle size={24} color="#fff" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>เสี่ยงต่อการแพ้</Text>
              <Text style={styles.warningText}>
                สินค้านี้มีคำเตือนสารก่อภูมิแพ้ที่ตรงกับรายการที่คุณแพ้ ได้แก่{' '}
                {getMatchedAllergenNames().join(', ')}
              </Text>
            </View>
          </View>
        )}

        {analysis.safetyStatus === 'caution' && (
          <View style={styles.cautionCard}>
            <AlertTriangle size={24} color="#fff" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>ควรระวัง</Text>
              <Text style={styles.warningText}>
                พบส่วนผสมที่อาจเกี่ยวข้องกับสารก่อภูมิแพ้ของคุณ กรุณาตรวจสอบฉลากสินค้าอย่างละเอียดอีกครั้ง
              </Text>
            </View>
          </View>
        )}

        {analysis.safetyStatus === 'safe' && (
          <View style={styles.safeCard}>
            <CheckCircle size={24} color="#fff" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>ยังไม่พบความเสี่ยง</Text>
              <Text style={styles.warningText}>
                จากข้อมูลที่มีอยู่ ยังไม่พบสารก่อภูมิแพ้ที่ตรงกับโปรไฟล์ของคุณ
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ส่วนผสม</Text>
        <View style={styles.ingredientsList}>
          {product.ingredients.map((ingredient: string, index: number) => (
            <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>คำเตือนสารก่อภูมิแพ้</Text>
        <View style={styles.allergenWarnings}>
          {product.allergenWarnings.length > 0 ? (
            product.allergenWarnings.map((warningName: string, index: number) => {
              const warningKey = getAllergenCanonicalKey(warningName);
              const allergen =
                allAllergens.find((item) => getAllergenCanonicalKey(item.name) === warningKey) ??
                allAllergens.find((item) => normalizeAllergenTerm(item.name) === normalizeAllergenTerm(warningName));
              const isUserAllergen =
                Boolean(allergen) &&
                Array.isArray(profile.allergens) &&
                profile.allergens.some((item) => item.allergenId === allergen?.id);

              return (
                <View
                  key={`${warningName}-${index}`}
                  style={[styles.allergenWarning, isUserAllergen && styles.userAllergenWarning]}
                >
                  {isUserAllergen ? (
                    <AlertCircle size={16} color={Colors.unsafe} />
                  ) : (
                    <Info size={16} color={Colors.textLight} />
                  )}
                  <Text
                    style={[
                      styles.allergenWarningText,
                      isUserAllergen && styles.userAllergenWarningText,
                    ]}
                  >
                    {allergen
                      ? getAllergenDisplayName(allergen)
                      : translateAllergenTermToThai(warningName) ?? warningName}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noAllergensText}>ไม่มีการระบุคำเตือนสารก่อภูมิแพ้สำหรับสินค้านี้</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ข้อมูลสินค้า</Text>
        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>บาร์โค้ด</Text>
            <Text style={styles.detailValue}>{product.barcode}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="ค้นหาสินค้าทางเลือก"
          onPress={handleFindAlternatives}
          variant="primary"
          fullWidth
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  imageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    height: '100%',
    width: '100%',
    backgroundColor: '#e0e0e0',
  },
  productInfo: {
    padding: 16,
  },
  brand: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  safetyContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: Colors.unsafe,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  cautionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.caution,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  safeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.safe,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  warningContent: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#fff',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  ingredientsList: {
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  allergenWarnings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  allergenWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  userAllergenWarning: {
    backgroundColor: 'rgba(231, 111, 81, 0.1)',
    borderWidth: 1,
    borderColor: Colors.unsafe,
  },
  allergenWarningText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 6,
  },
  userAllergenWarningText: {
    fontWeight: '500',
    color: Colors.unsafe,
  },
  noAllergensText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  productDetails: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  actionButtons: {
    padding: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
});
