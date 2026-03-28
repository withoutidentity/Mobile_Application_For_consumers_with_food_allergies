import Colors from '@/constants/Colors';
import { Allergen, Severity } from '@/types';
import { getAllergenDisplayName, getLocalizedAliasNames } from '@/utils/allergenLocalization';
import { AlertCircle, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface AllergenCardProps {
  allergen: Allergen;
  selected: boolean;
  severity?: Severity;
  onToggle: () => void;
  onSeverityChange: (severity: Severity) => void;
}

const severityOptions: { label: string; value: Severity }[] = [
  { label: 'ต่ำ', value: 'LOW' },
  { label: 'ปานกลาง', value: 'MEDIUM' },
  { label: 'สูง', value: 'HIGH' },
];

export default function AllergenCard({ allergen, selected, severity, onToggle, onSeverityChange }: AllergenCardProps) {
  const [isSeverityModalVisible, setIsSeverityModalVisible] = useState(false);
  const selectedSeverityLabel =
    severityOptions.find((option) => option.value === severity)?.label ?? 'ปานกลาง';
  const localizedAliases = getLocalizedAliasNames(allergen);

  const handleSelectSeverity = (value: Severity) => {
    onSeverityChange(value);
    setIsSeverityModalVisible(false);
  };

  return (
    <View
      style={[
        styles.container,
        selected && styles.selectedContainer
      ]}
    >
      <Pressable onPress={onToggle} style={styles.cardPressable}>
        <View style={styles.header}>
          <Text style={styles.name}>{getAllergenDisplayName(allergen)}</Text>
          {/* <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(allergen.defaultLevel) }]}>
            <Text style={styles.severityText}>
              {allergen.defaultLevel.charAt(0).toUpperCase() + allergen.defaultLevel.slice(1)}
            </Text>
          </View> */}
        </View>
        
        <Text style={styles.description}>{allergen.description}</Text>
        
        {localizedAliases.length > 0 && (
          <View style={styles.aliasesContainer}>
            <Text style={styles.aliasesTitle}>ชื่อที่เกี่ยวข้อง:</Text>
            <Text style={styles.aliases}>{localizedAliases.join(', ')}</Text>
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
            {selected ? 'เพิ่มในโปรไฟล์ของคุณแล้ว' : 'แตะเพื่อเพิ่มลงในโปรไฟล์ของคุณ'}
          </Text>
        </View>
      </Pressable>

      {selected && (
        <View style={styles.severitySelectorContainer}>
          <Text style={styles.severitySelectorLabel}>ระดับความรุนแรงของฉัน:</Text>
          <Pressable
            style={styles.severitySelectorButton}
          onPress={() => setIsSeverityModalVisible(true)}
        >
          <Text style={styles.severitySelectorValue}>{selectedSeverityLabel}</Text>
          </Pressable>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent
        visible={isSeverityModalVisible}
        onRequestClose={() => setIsSeverityModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsSeverityModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>เลือกระดับความรุนแรง</Text>

            {severityOptions.map((option) => {
              const isActive = severity === option.value;

              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.modalOption,
                    isActive && styles.modalOptionActive,
                  ]}
                  onPress={() => handleSelectSeverity(option.value)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isActive && styles.modalOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isActive && <Check size={16} color={Colors.primary} />}
                </Pressable>
              );
            })}

            <Pressable
              style={styles.modalCancelButton}
              onPress={() => setIsSeverityModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>ยกเลิก</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
  cardPressable: {
    borderRadius: 10,
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
  severitySelectorButton: {
    minWidth: 110,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  severitySelectorValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  modalOptionActive: {
    backgroundColor: '#E6F6F4',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    color: Colors.textLight,
    fontWeight: '500',
  },
});
