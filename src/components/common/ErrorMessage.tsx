/**
 * Error Message Component
 *
 * Displays error messages with Arabic text support
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { theme } from '@/config/theme.config';

interface ErrorMessageProps {
  message: string; // Arabic error message
  onRetry?: () => void;
  showIcon?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  showIcon = true,
}) => {
  return (
    <View style={styles.container}>
      {showIcon && (
        <IconButton
          icon="alert-circle"
          size={48}
          iconColor={theme.colors.error}
        />
      )}
      <Text style={styles.message} variant="bodyLarge">
        {message}
      </Text>
      {onRetry && (
        <IconButton
          icon="refresh"
          mode="contained"
          containerColor={theme.colors.primary}
          iconColor={theme.colors.onPrimary}
          size={24}
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    textAlign: 'center',
    color: theme.colors.error,
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
});

export default ErrorMessage;
