import Colors from '@/constants/Colors';
import { useUserProfile } from '@/context/UserProfileContext';
import { Allergen, Product } from '@/types';
import { analyzeProduct } from '@/utils/productAnalyzer';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import SafetyBadge from './SafetyBadge';
import { resolveProductImageUri } from '@/utils/productImage';

interface ProductCardProps {
  product: Product;
  allAllergens: Allergen[];
}

export default function ProductCard({ product, allAllergens }: ProductCardProps) {
  const router = useRouter();
  const { profile } = useUserProfile();

  // Pass allAllergens as the third argument
  const analysis = analyzeProduct(product, profile, allAllergens);
  
  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const imageUri = resolveProductImageUri(product.image);

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>
        
        <View style={styles.badgeContainer}>
          <SafetyBadge status={analysis.safetyStatus} size="small" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  imageContainer: {
    height: 210,
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
  content: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
});
