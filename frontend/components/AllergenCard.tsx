import Colors from '@/constants/Colors';
import { Allergen, Severity } from '@/types';
import { AlertCircle, Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface AllergenCardProps {
  allergen: Allergen;
  selected: boolean;
  severity?: Severity;
  onToggle: (id: number, isSelected: boolean) => void;
  onSeverityChange: (severity: Severity) => void;
}

export default function AllergenCard({ allergen, selected, severity, onToggle, onSeverityChange }: AllergenCardProps) {
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
    <Pressable
      style={[
        styles.container,
        selected && styles.selectedContainer
      ]}
      onPress={() => onToggle(allergen.id, selected)}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{allergen.name}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(allergen.defaultLevel) }]}>
          <Text style={styles.severityText}>
            {allergen.defaultLevel.charAt(0).toUpperCase() + allergen.defaultLevel.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description}>{allergen.description}</Text>
      
      {allergen.altNames.length > 0 && (
        <View style={styles.aliasesContainer}>
          <Text style={styles.aliasesTitle}>Also known as:</Text>
          <Text style={styles.aliases}>{allergen.altNames.join(', ')}</Text>
        </View>
      )}
      
      <View style={styles.selectionIndicator}>
        {selected ? (
          <View style={styles.selectedIcon}>
            <Check size={16} color="#fff" />
          </View>
        ) : (
          <View style={styles.unselectedIcon}>
            <AlertCircle size={16} color={Colors.textLight} />
          </View>
        )}
        <Text style={[styles.selectionText, selected && styles.selectedText]}>
          {selected ? 'Added to your profile' : 'Tap to add to your profile'}
        </Text>
      </View>

      {selected && (
        <View style={styles.severitySelectorContainer}>
          <Text style={styles.severitySelectorLabel}>My Severity:</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              if (value) {
                onSeverityChange(value);
              }
            }}
            items={[
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
            ]}
            value={severity}
            style={pickerSelectStyles}
            placeholder={{}}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
  },
  aliasesContainer: {
    marginBottom: 12,
  },
  aliasesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  aliases: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  selectedIcon: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedIcon: {
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectionText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  severitySelectorContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  severitySelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: '#F9FAFB',
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: '#F9FAFB',
  },
});