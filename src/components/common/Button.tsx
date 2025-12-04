/**
 * Button Component
 *
 * Custom button with RTL support and Arabic text
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { theme } from '@/config/theme.config';

interface ButtonProps {
  label: string; // Arabic label
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  mode = 'contained',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      style={[styles.button, style]}
      labelStyle={styles.label}
      contentStyle={styles.content}
    >
      {label}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.roundness,
  },
  label: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 16,
  },
  content: {
    paddingVertical: 8,
  },
});

export default Button;
