/**
 * LoginScreen - User login with email and password
 *
 * Features:
 * - Email/password form with validation
 * - RTL layout for Arabic
 * - Error messages in Arabic
 * - Navigation to Register screen
 * - Loading state during authentication
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/config/theme.config';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validation.utils';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);

  /**
   * T088: Form validation with Arabic error messages
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      isValid = false;
    } else {
      setEmailError(undefined);
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      isValid = false;
    } else {
      setPasswordError(undefined);
    }

    return isValid;
  };

  /**
   * Handle login submission
   */
  const handleLogin = async () => {
    // Clear previous errors
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await signIn({ email, password });
      // Navigation to main app is handled by AppNavigator auth state change
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  /**
   * Navigate to registration
   */
  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              تفوّق
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              منصة التحضير للاختبارات التحصيلية
            </Text>
          </View>

          {/* Login Form */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.formTitle}>
                تسجيل الدخول
              </Text>

              {/* Error Message */}
              {error && (
                <ErrorMessage
                  message={error.arabicMessage}
                  onRetry={handleLogin}
                  style={styles.errorMessage}
                />
              )}

              {/* Email Input */}
              <Input
                label="البريد الإلكتروني"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError(undefined);
                  clearError();
                }}
                placeholder="example@email.com"
                keyboardType="email-address"
                error={!!emailError}
                errorText={emailError}
                disabled={isLoading}
                left={<TextInput.Icon icon="email" />}
              />

              {/* Password Input */}
              <Input
                label="كلمة المرور"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(undefined);
                  clearError();
                }}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                error={!!passwordError}
                errorText={passwordError}
                disabled={isLoading}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
              >
                تسجيل الدخول
              </Button>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text variant="bodyMedium" style={styles.registerText}>
                  ليس لديك حساب؟
                </Text>
                <Button
                  mode="text"
                  onPress={handleNavigateToRegister}
                  disabled={isLoading}
                  compact
                >
                  إنشاء حساب جديد
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: theme.colors.primary,
    fontFamily: 'NotoKufiArabic_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  formTitle: {
    fontFamily: 'NotoKufiArabic_700Bold',
    marginBottom: 16,
    textAlign: 'center',
    color: theme.colors.onSurface,
  },
  errorMessage: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  registerText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
  },
});

// Need to import TextInput for icons
import { TextInput as RNPTextInput } from 'react-native-paper';
const TextInput = RNPTextInput;
