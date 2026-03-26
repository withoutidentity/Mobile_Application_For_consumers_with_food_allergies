import Button from '@/components/Button';
import SafetyBadge from '@/components/SafetyBadge';
import Colors from '@/constants/Colors';
import { useUserProfile } from '@/context/UserProfileContext';
import getProducts from '@/data/productService';
import { Allergen, Product } from '@/types';
import { analyzeProduct } from '@/utils/productAnalyzer';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { fetchAllergens } from '@/data/allergens';
import { Alert, Image, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import allergens from '@/data/allergens';

export default function ProductDetailScreen() {
  // useLocalSearchParams จะคืนค่าเป็น string เสมอ
  const { id: idFromParams } = useLocalSearchParams<{ id: string }>();
  const { profile } = useUserProfile();
  
  // กำหนด Type ให้ชัดเจน
  const [product, setProduct] = useState<Product | null>(null);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, fetchedAllergens] = await Promise.all([
          getProducts(),
          fetchAllergens(), // ดึงข้อมูล allergens ทั้งหมด
        ]);

        // แปลง id จาก URL (string) ให้เป็น number ก่อนเปรียบเทียบ
        const numericId = parseInt(idFromParams, 10);
        // เปรียบเทียบ number กับ number (p.id เป็น number จาก service)
        const foundProduct = products.find((p) => p.id === numericId);
        setProduct(foundProduct ?? null);
        setAllAllergens(fetchedAllergens);
      } catch (error) {
        console.error("Failed to fetch product:", error);
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
        <Text style={styles.notFoundTitle}>Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.notFound}>
        <AlertCircle size={64} color={Colors.unsafe} />
        <Text style={styles.notFoundTitle}>Product Not Found</Text>
        <Text style={styles.notFoundText}>We couldn't find this product in our database.</Text>
      </View>
    );
  }

  const analysis = analyzeProduct(product, profile, allAllergens);

  const normalizeText = (value: unknown) =>
    typeof value === 'string' ? value.trim().toLowerCase() : '';
  
  const getMatchedAllergenNames = () => {
    // analysis.directMatches is an array of Allergen objects
    return analysis.directMatches.map(allergen => {
      return allergen.name;
    });
  };

  const handleFindAlternatives = () => {
    Alert.alert(
      'Coming Soon',
      'Alternative product suggestions will be available in a future update.',
      [{ text: 'OK' }]
    );
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
              <Text style={styles.warningTitle}>Contains Your Allergens</Text>
              <Text style={styles.warningText}>
                This product contains {getMatchedAllergenNames().join(', ')}, which you've listed as allergens.
              </Text>
            </View>
          </View>
        )}
        
        {analysis.safetyStatus === 'caution' && (
          <View style={styles.cautionCard}>
            <AlertTriangle size={24} color="#fff" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>May Contain Allergens</Text>
              <Text style={styles.warningText}>
                This product may contain ingredients related to your allergens. Please check the ingredient list carefully.
              </Text>
            </View>
          </View>
        )}
        
        {analysis.safetyStatus === 'safe' && (
          <View style={styles.safeCard}>
            <CheckCircle size={24} color="#fff" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Safe for You</Text>
              <Text style={styles.warningText}>
                Based on your profile, this product doesn't contain any of your listed allergens.
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.ingredientsList}>
          {product.ingredients.map((ingredient: string, index: number) => (
            <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allergen Warnings</Text>
        <View style={styles.allergenWarnings}>
          {product.allergenWarnings.length > 0 ? (
            product.allergenWarnings.map((warningName: string, index: number) => {
              // Find the allergen details from the full list by name
              const normalizedWarning = normalizeText(warningName);
              const allergen = allAllergens.find(
                (a) => normalizeText(a.name) === normalizedWarning
              );
              const isUserAllergen = allergen && profile.allergens ? profile.allergens.some(ua => ua.allergenId === allergen.id) : false; // Check if the user's profile contains this allergen by its ID
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.allergenWarning,
                    isUserAllergen && styles.userAllergenWarning
                  ]}
                >
                  {isUserAllergen ? (
                    <AlertCircle size={16} color={Colors.unsafe} />
                  ) : (
                    <Info size={16} color={Colors.textLight} />
                  )}
                  <Text 
                    style={[
                      styles.allergenWarningText,
                      isUserAllergen && styles.userAllergenWarningText
                    ]}
                  >
                    {allergen ? allergen.name : warningName}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noAllergensText}>No allergen warnings listed for this product.</Text>
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Information</Text>
        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Barcode</Text>
            <Text style={styles.detailValue}>{product.barcode}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <Button
          title="Find Alternatives"
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
