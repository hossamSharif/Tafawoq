/**
 * Input Component
 *
 * Text input with Arabic placeholder support and RTL layout
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { theme } from '@/config/theme.config';

interface InputProps {
  label: string; // Arabic label
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string; // Arabic placeholder
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: boolean;
  errorText?: string; // Arabic error message
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error = false,
  errorText,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  left,
  right,
  style,
}) => {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      error={error}
      disabled={disabled}
      multiline={multiline}
      numberOfLines={numberOfLines}
      left={left}
      right={right}
      mode="outlined"
      style={[styles.input, style]}
      contentStyle={styles.content}
      outlineStyle={styles.outline}
      theme={{
        colors: {
          primary: theme.colors.primary,
          error: theme.colors.error,
        },
      }}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  content: {
    fontFamily: 'NotoKufiArabic_400Regular',
    textAlign: 'right', // RTL alignment
  },
  outline: {
    borderRadius: theme.roundness,
  },
});

export default Input;
