/**
 * Loading Spinner Component
 *
 * Reusable loading indicator with Arabic text support
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { theme } from '@/config/theme.config';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string; // Arabic message
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message,
  color = theme.colors.primary,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message} variant="bodyMedium">
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    color: theme.colors.onBackground,
  },
});

export default LoadingSpinner;
