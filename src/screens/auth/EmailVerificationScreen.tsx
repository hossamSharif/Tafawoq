/**
 * EmailVerificationScreen - Email verification with OTP
 *
 * Features:
 * - 6-digit OTP input
 * - Resend OTP with 60-second cooldown
 * - RTL layout for Arabic
 * - Error messages in Arabic
 * - Navigation to Welcome screen after verification
 * - Loading state during verification
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/config/theme.config';
import { useAuth } from '@/hooks/useAuth';
import { validateOTP } from '@/utils/validation.utils';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

const RESEND_COOLDOWN_SECONDS = 60;

export const EmailVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const { verifyEmail, resendOTP, isLoading, error, clearError } = useAuth();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  /**
   * Countdown timer for resend OTP button
   */
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  /**
   * Validate OTP
   */
  const validateForm = (): boolean => {
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      setOtpError(otpValidation.error);
      return false;
    }
    setOtpError(undefined);
    return true;
  };

  /**
   * Handle OTP verification
   */
  const handleVerify = async () => {
    // Clear previous errors
    clearError();

    // Validate OTP
    if (!validateForm()) {
      return;
    }

    try {
      await verifyEmail(email, otp);
      // Navigate to welcome screen after successful verification
      navigation.navigate('Welcome');
    } catch (err) {
      // Error is handled by useAuth hook
      setOtp(''); // Clear OTP on error
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = async () => {
    if (!canResend) {
      return;
    }

    try {
      clearError();
      await resendOTP(email);

      // Reset cooldown
      setCanResend(false);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  /**
   * Handle OTP input change
   */
  const handleOtpChange = (text: string) => {
    // Only allow numbers
    const numericOtp = text.replace(/[^0-9]/g, '');
    setOtp(numericOtp);
    setOtpError(undefined);
    clearError();

    // Auto-submit when 6 digits are entered
    if (numericOtp.length === 6) {
      // Small delay to allow user to see the complete OTP
      setTimeout(() => {
        const validation = validateOTP(numericOtp);
        if (validation.isValid) {
          handleVerify();
        }
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            تفوّق
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            التحقق من البريد الإلكتروني
          </Text>
        </View>

        {/* Verification Form */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.formTitle}>
              أدخل رمز التحقق
            </Text>

            <Text variant="bodyMedium" style={styles.description}>
              تم إرسال رمز التحقق المكون من 6 أرقام إلى:
            </Text>
            <Text variant="bodyLarge" style={styles.email}>
              {email}
            </Text>

            {/* Error Message */}
            {error && (
              <ErrorMessage
                message={error.arabicMessage}
                onRetry={handleVerify}
                style={styles.errorMessage}
              />
            )}

            {/* OTP Input */}
            <Input
              label="رمز التحقق"
              value={otp}
              onChangeText={handleOtpChange}
              placeholder="000000"
              keyboardType="number-pad"
              error={!!otpError}
              errorText={otpError}
              disabled={isLoading}
              maxLength={6}
              style={styles.otpInput}
            />

            {/* Verify Button */}
            <Button
              mode="contained"
              onPress={handleVerify}
              loading={isLoading}
              disabled={isLoading || otp.length !== 6}
              style={styles.verifyButton}
            >
              تحقق
            </Button>

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text variant="bodyMedium" style={styles.resendText}>
                لم تستلم الرمز؟
              </Text>
              {canResend ? (
                <Button
                  mode="text"
                  onPress={handleResendOTP}
                  disabled={isLoading}
                  compact
                >
                  إعادة إرسال
                </Button>
              ) : (
                <Text variant="bodyMedium" style={styles.cooldownText}>
                  إعادة الإرسال بعد {resendCooldown} ثانية
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  description: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    color: theme.colors.primary,
    fontFamily: 'NotoKufiArabic_700Bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorMessage: {
    marginBottom: 16,
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
  },
  cooldownText: {
    color: theme.colors.primary,
    fontFamily: 'NotoKufiArabic_400Regular',
  },
});
