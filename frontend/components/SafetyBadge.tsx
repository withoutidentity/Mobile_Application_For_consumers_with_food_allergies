import Colors from '@/constants/Colors';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SafetyBadgeProps {
  status: 'safe' | 'caution' | 'unsafe';
  size?: 'small' | 'medium' | 'large';
}

export default function SafetyBadge({ status, size = 'medium' }: SafetyBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return Colors.safe;
      case 'caution':
        return Colors.caution;
      case 'unsafe':
        return Colors.unsafe;
      default:
        return Colors.primary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'safe':
        return 'Safe to Eat';
      case 'caution':
        return 'Use Caution';
      case 'unsafe':
        return 'Not Safe';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'safe':
        return <CheckCircle size={getIconSize()} color="#fff" />;
      case 'caution':
        return <AlertTriangle size={getIconSize()} color="#fff" />;
      case 'unsafe':
        return <AlertCircle size={getIconSize()} color="#fff" />;
      default:
        return null;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 4, paddingHorizontal: 8 };
      case 'medium':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'large':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      default:
        return { paddingVertical: 6, paddingHorizontal: 12 };
    }
  };

  return (
    <View style={[
      styles.container, 
      { backgroundColor: getStatusColor() },
      getPadding()
    ]}>
      {getStatusIcon()}
      <Text style={[styles.text, { fontSize: getFontSize() }]}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
});