import Colors from '@/constants/Colors';
import { fetchAllergens } from '@/data/allergens';
import { fetchSymptoms } from '@/data/symptoms';
import { Allergen, AllergenSymptom } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { AlertCircle, AlertTriangle, Clock, Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SymptomDetailScreen() {
  const { allergen } = useLocalSearchParams<{ allergen: string }>();
  
  const [allergenInfo, setAllergenInfo] = useState<Allergen | null>(null);
  const [symptomInfo, setSymptomInfo] = useState<AllergenSymptom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!allergen) return;

      setLoading(true);
      try {
        const allergenId = parseInt(allergen, 10);
        const [allAllergens, allSymptoms] = await Promise.all([
          fetchAllergens(),
          fetchSymptoms(),
        ]);

        const foundAllergen = allAllergens.find(a => a.id === allergenId) ?? null;
        const foundSymptom = allSymptoms.find(s => s.allergenId === allergenId) ?? null;

        setAllergenInfo(foundAllergen);
        setSymptomInfo(foundSymptom);
      } catch (error) {
        console.error("Failed to load symptom details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [allergen]);
  
  if (loading) {
    return (
      <View style={styles.notFound}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.notFoundTitle}>Loading Details...</Text>
      </View>
    );
  }

  if (!allergenInfo || !symptomInfo) {
    return (
      <View style={styles.notFound}>
        <AlertCircle size={64} color={Colors.unsafe} />
        <Text style={styles.notFoundTitle}>Information Not Found</Text>
        <Text style={styles.notFoundText}>We couldn't find symptom information for this allergen.</Text>
      </View>
    );
  }

  const getSeverityColor = (defaultLevel: string) => {
    switch (defaultLevel) {
      case 'HIGH':
        return Colors.unsafe;
      case 'MEDIUM':
        return Colors.caution;
      case 'LOW':
        return Colors.safe;
      default:
        return Colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{allergenInfo.name} Allergy</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(allergenInfo.defaultLevel) }]}>
          <Text style={styles.severityText}>
            {allergenInfo.defaultLevel.charAt(0).toUpperCase() + allergenInfo.defaultLevel.slice(1)} Severity
          </Text>
        </View>
      </View>
      
      <View style={styles.description}>
        <Text style={styles.descriptionText}>{allergenInfo.description}</Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertCircle size={20} color={Colors.unsafe} />
          <Text style={styles.sectionTitle}>Common Symptoms</Text>
        </View>
        <View style={styles.list}>
          {symptomInfo.symptoms.map((symptom, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{symptom}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Heart size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>First Aid</Text>
        </View>
        <View style={styles.list}>
          {symptomInfo.firstAid.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={20} color={Colors.caution} />
          <Text style={styles.sectionTitle}>When to Seek Medical Help</Text>
        </View>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyText}>
            If you experience any of the following symptoms, seek immediate medical attention:
          </Text>
          <View style={styles.list}>
            {symptomInfo.whenToSeekHelp.map((item, index) => (
              <View key={index} style={styles.emergencyItem}>
                <Text style={styles.emergencyItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={Colors.secondary} />
          <Text style={styles.sectionTitle}>Also Known As</Text>
        </View>
        <View style={styles.aliasList}>
          {allergenInfo.altNames.map((alias, index) => (
            <View key={index} style={styles.aliasItem}>
              <Text style={styles.aliasText}>{alias}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Disclaimer: This information is provided for educational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
        </Text>
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
    padding: 16,
    paddingBottom: 32,
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
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  list: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
  },
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listItemText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  emergencyCard: {
    backgroundColor: 'rgba(231, 111, 81, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.unsafe,
  },
  emergencyText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
    fontWeight: '500',
  },
  emergencyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 111, 81, 0.2)',
  },
  emergencyItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  aliasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  aliasItem: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  aliasText: {
    fontSize: 14,
    color: Colors.text,
  },
  disclaimer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(38, 70, 83, 0.1)',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});