/**
 * SubscriptionScreen - Subscription management screen
 *
 * Features:
 * - Display current subscription tier (Free/Premium)
 * - Premium upgrade button with pricing
 * - Subscription management (cancel/reactivate)
 * - Tier limits display
 * - Payment processing with loading states
 * - Arabic error messages
 * - RTL layout
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Divider, Chip, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/config/theme.config';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { MainStackParamList } from '@/navigation/types';
import type { SubscriptionTier } from '@/types/subscription.types';

type Props = NativeStackScreenProps<MainStackParamList, 'Subscription'>;

export const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const {
    subscription,
    isPremium,
    isLoading,
    error,
    limits,
    upgradeToPremium,
    cancelSubscription,
    reactivateSubscription,
    clearError,
  } = useSubscription(user?.id);

  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle premium upgrade
   */
  const handleUpgrade = async () => {
    if (!user?.id) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setIsProcessing(true);
      clearError();
      await upgradeToPremium(user.id);
      Alert.alert(
        'نجح!',
        'تم الترقية إلى الاشتراك المميز بنجاح!',
        [{ text: 'حسناً' }]
      );
    } catch (err) {
      // Error is handled by useSubscription hook
      console.error('Upgrade failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle subscription cancellation
   */
  const handleCancel = async () => {
    if (!user?.id) return;

    Alert.alert(
      'إلغاء الاشتراك',
      'هل أنت متأكد أنك تريد إلغاء الاشتراك؟ ستظل لديك إمكانية الوصول حتى نهاية فترة الفوترة.',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'نعم، إلغاء الاشتراك',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              clearError();
              await cancelSubscription(user.id!);
              Alert.alert('تم', 'تم إلغاء الاشتراك بنجاح');
            } catch (err) {
              console.error('Cancel failed:', err);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle subscription reactivation
   */
  const handleReactivate = async () => {
    if (!user?.id) return;

    try {
      setIsProcessing(true);
      clearError();
      await reactivateSubscription(user.id);
      Alert.alert('تم', 'تم إعادة تفعيل الاشتراك بنجاح');
    } catch (err) {
      console.error('Reactivate failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get tier badge properties
   */
  const getTierBadge = (tier: SubscriptionTier) => {
    if (tier === 'premium') {
      return {
        label: 'مميز',
        color: theme.colors.primary,
        icon: 'crown' as const,
      };
    }
    return {
      label: 'مجاني',
      color: theme.colors.secondary,
      icon: 'account' as const,
    };
  };

  const tierBadge = getTierBadge(subscription?.tier || 'free');

  // Show loading spinner
  if (isLoading && !subscription) {
    return <LoadingSpinner message="جاري تحميل بيانات الاشتراك..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            الاشتراك
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            error={error}
            onDismiss={clearError}
            style={styles.errorMessage}
          />
        )}

        {/* Current Tier Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tierHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                الباقة الحالية
              </Text>
              <Chip
                icon={tierBadge.icon}
                textStyle={{ color: '#fff' }}
                style={{ backgroundColor: tierBadge.color }}
              >
                {tierBadge.label}
              </Chip>
            </View>

            {subscription?.status === 'trialing' && (
              <View style={styles.trialNotice}>
                <Icon source="information" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.trialText}>
                  فترة تجريبية نشطة حتى{' '}
                  {subscription.trial_end_at
                    ? new Date(subscription.trial_end_at).toLocaleDateString('ar-SA')
                    : ''}
                </Text>
              </View>
            )}

            {subscription?.canceled_at && subscription?.status !== 'canceled' && (
              <View style={styles.canceledNotice}>
                <Icon source="alert" size={20} color={theme.colors.error} />
                <Text variant="bodyMedium" style={styles.canceledText}>
                  سينتهي الاشتراك في{' '}
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString('ar-SA')
                    : ''}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Tier Limits Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              حدود الباقة
            </Text>

            <View style={styles.limitRow}>
              <Icon source="file-document" size={24} color={theme.colors.primary} />
              <View style={styles.limitText}>
                <Text variant="bodyLarge">اختبارات أسبوعياً</Text>
                <Text variant="bodyMedium" style={styles.limitValue}>
                  {limits.examsPerWeek === Infinity
                    ? 'غير محدود'
                    : `${limits.examsPerWeek} اختبار`}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.limitRow}>
              <Icon source="book-open-page-variant" size={24} color={theme.colors.primary} />
              <View style={styles.limitText}>
                <Text variant="bodyLarge">أسئلة التدريب</Text>
                <Text variant="bodyMedium" style={styles.limitValue}>
                  {limits.practiceQuestionLimit} سؤال كحد أقصى
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.limitRow}>
              <Icon
                source={limits.hasSolutionExplanations ? 'check-circle' : 'close-circle'}
                size={24}
                color={limits.hasSolutionExplanations ? theme.colors.primary : theme.colors.secondary}
              />
              <View style={styles.limitText}>
                <Text variant="bodyLarge">شرح الحلول</Text>
                <Text variant="bodyMedium" style={styles.limitValue}>
                  {limits.hasSolutionExplanations ? 'متاح' : 'غير متاح'}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.limitRow}>
              <Icon
                source={limits.hasAdvancedAnalytics ? 'check-circle' : 'close-circle'}
                size={24}
                color={limits.hasAdvancedAnalytics ? theme.colors.primary : theme.colors.secondary}
              />
              <View style={styles.limitText}>
                <Text variant="bodyLarge">التحليلات المتقدمة</Text>
                <Text variant="bodyMedium" style={styles.limitValue}>
                  {limits.hasAdvancedAnalytics ? 'متاح' : 'غير متاح'}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.limitRow}>
              <Icon
                source={limits.hasExportReports ? 'check-circle' : 'close-circle'}
                size={24}
                color={limits.hasExportReports ? theme.colors.primary : theme.colors.secondary}
              />
              <View style={styles.limitText}>
                <Text variant="bodyLarge">تصدير التقارير</Text>
                <Text variant="bodyMedium" style={styles.limitValue}>
                  {limits.hasExportReports ? 'متاح' : 'غير متاح'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Upgrade/Management Actions */}
        {!isPremium ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                الترقية إلى الباقة المميزة
              </Text>
              <Text variant="bodyMedium" style={styles.upgradeDescription}>
                احصل على وصول غير محدود إلى جميع الميزات
              </Text>

              <View style={styles.premiumFeatures}>
                <View style={styles.featureRow}>
                  <Icon source="check" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium">اختبارات غير محدودة</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon source="check" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium">100 سؤال تدريب كحد أقصى</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon source="check" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium">شرح مفصل للحلول</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon source="check" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium">تحليلات متقدمة</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon source="check" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium">تصدير تقارير الأداء</Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleUpgrade}
                loading={isProcessing}
                disabled={isProcessing}
                style={styles.upgradeButton}
                contentStyle={styles.upgradeButtonContent}
                icon="crown"
              >
                ترقية الآن
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                إدارة الاشتراك
              </Text>

              {subscription?.canceled_at ? (
                <Button
                  mode="contained"
                  onPress={handleReactivate}
                  loading={isProcessing}
                  disabled={isProcessing}
                  style={styles.actionButton}
                  icon="reload"
                >
                  إعادة تفعيل الاشتراك
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  loading={isProcessing}
                  disabled={isProcessing}
                  style={styles.actionButton}
                  textColor={theme.colors.error}
                  icon="cancel"
                >
                  إلغاء الاشتراك
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
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
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: theme.fonts.bodyLarge.fontFamily,
    textAlign: 'right',
    color: theme.colors.onBackground,
  },
  errorMessage: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  tierHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleLarge.fontFamily,
    textAlign: 'right',
    marginBottom: 12,
    color: theme.colors.onSurface,
  },
  trialNotice: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  trialText: {
    flex: 1,
    textAlign: 'right',
    color: theme.colors.onPrimaryContainer,
  },
  canceledNotice: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.errorContainer,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  canceledText: {
    flex: 1,
    textAlign: 'right',
    color: theme.colors.onErrorContainer,
  },
  limitRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  limitText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  limitValue: {
    color: theme.colors.secondary,
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  upgradeDescription: {
    textAlign: 'right',
    marginBottom: 16,
    color: theme.colors.onSurfaceVariant,
  },
  premiumFeatures: {
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  upgradeButton: {
    marginTop: 8,
  },
  upgradeButtonContent: {
    paddingVertical: 8,
  },
  actionButton: {
    marginTop: 8,
  },
});
