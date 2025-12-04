/**
 * RegisterScreen - User registration with email and password
 *
 * Features:
 * - Email/password/full name form with validation
 * - RTL layout for Arabic
 * - Error messages in Arabic
 * - Navigation to EmailVerification after successful registration
 * - Loading state during registration
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput as RNPTextInput } from 'react-native-paper';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const TextInput = RNPTextInput;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, isLoading, error, clearError } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullNameError, setFullNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * T089: Form validation with Arabic error messages
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate full name
    if (!fullName || fullName.trim().length < 2) {
      setFullNameError('الاسم الكامل مطلوب (حرفين على الأقل)');
      isValid = false;
    } else {
      setFullNameError(undefined);
    }

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

    // Validate password confirmation
    if (password !== confirmPassword) {
      setConfirmPasswordError('كلمة المرور غير متطابقة');
      isValid = false;
    } else {
      setConfirmPasswordError(undefined);
    }

    return isValid;
  };

  /**
   * Handle registration submission
   */
  const handleRegister = async () => {
    // Clear previous errors
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const result = await signUp({
        email,
        password,
        fullName,
      });

      // Navigate to email verification if needed
      if (result.needsVerification) {
        navigation.navigate('EmailVerification', { email });
      } else {
        // If email is already verified (unlikely), go to welcome
        navigation.navigate('Welcome');
      }
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  /**
   * Navigate back to login
   */
  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
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
              إنشاء حساب جديد
            </Text>
          </View>

          {/* Registration Form */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.formTitle}>
                التسجيل
              </Text>

              {/* Error Message */}
              {error && (
                <ErrorMessage
                  message={error.arabicMessage}
                  onRetry={handleRegister}
                  style={styles.errorMessage}
                />
              )}

              {/* Full Name Input */}
              <Input
                label="الاسم الكامل"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setFullNameError(undefined);
                  clearError();
                }}
                placeholder="أدخل اسمك الكامل"
                error={!!fullNameError}
                errorText={fullNameError}
                disabled={isLoading}
                left={<TextInput.Icon icon="account" />}
              />

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
                placeholder="8 أحرف على الأقل"
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

              {/* Confirm Password Input */}
              <Input
                label="تأكيد كلمة المرور"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError(undefined);
                  clearError();
                }}
                placeholder="أعد إدخال كلمة المرور"
                secureTextEntry={!showConfirmPassword}
                error={!!confirmPasswordError}
                errorText={confirmPasswordError}
                disabled={isLoading}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />

              {/* Register Button */}
              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={styles.registerButton}
              >
                إنشاء حساب
              </Button>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text variant="bodyMedium" style={styles.loginText}>
                  لديك حساب بالفعل؟
                </Text>
                <Button
                  mode="text"
                  onPress={handleNavigateToLogin}
                  disabled={isLoading}
                  compact
                >
                  تسجيل الدخول
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
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
  },
});
