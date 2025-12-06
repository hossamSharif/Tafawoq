/**
 * HomeScreen - Main dashboard for authenticated users
 *
 * Features:
 * - Welcome message with user name
 * - Quick action buttons (Start Exam, Start Practice)
 * - Basic stats overview (placeholders for Phase 5)
 * - RTL layout for Arabic
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/config/theme.config';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { profile, isLoading } = useProfile(user?.id);
  const { isPremium, subscription } = useSubscription(user?.id);

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      // Error handled by useAuth
    }
  };

  // Show loading while profile is loading
  if (isLoading) {
    return <LoadingSpinner message="جاري تحميل البيانات..." />;
  }

  // Get user's first name or default
  const firstName = profile?.fullName?.split(' ')[0] || 'الطالب';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text variant="headlineMedium" style={styles.welcomeText}>
              مرحباً {firstName}!
            </Text>
            {/* Subscription Tier Badge - T108 */}
            <TouchableOpacity onPress={() => navigation.navigate('Subscription')}>
              <Chip
                mode="flat"
                style={[
                  styles.tierBadge,
                  isPremium ? styles.premiumBadge : styles.freeBadge,
                ]}
                textStyle={styles.tierBadgeText}
                icon={isPremium ? 'crown' : 'account'}
              >
                {isPremium ? 'مميز' : 'مجاني'}
              </Chip>
            </TouchableOpacity>
          </View>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {profile?.academicTrack === 'scientific' ? 'المسار العلمي' : 'المسار الأدبي'}
          </Text>
        </View>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              ابدأ التحضير
            </Text>

            <Button
              mode="contained"
              onPress={() => {
                // Will be implemented in Phase 5 (US3)
              }}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
              icon="file-document-edit"
              disabled // Disabled until Phase 5
            >
              بدء اختبار تحصيلي
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                // Will be implemented in Phase 6 (US4)
              }}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
              icon="pencil"
              disabled // Disabled until Phase 6
            >
              بدء جلسة تدريب
            </Button>
          </Card.Content>
        </Card>

        {/* Stats Overview Placeholder */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              إحصائياتك
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="displaySmall" style={styles.statValue}>
                  0
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  اختبارات مكتملة
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="displaySmall" style={styles.statValue}>
                  0
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  ساعات تدريب
                </Text>
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.placeholderText}>
              سيتم عرض تحليلات الأداء التفصيلية في المرحلة القادمة
            </Text>
          </Card.Content>
        </Card>

        {/* Settings & Sign Out */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              الإعدادات
            </Text>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Subscription')}
              style={styles.settingButton}
              icon="crown"
            >
              الاشتراك المميز
            </Button>

            <Button
              mode="text"
              onPress={handleSignOut}
              style={styles.settingButton}
              icon="logout"
            >
              تسجيل الخروج
            </Button>
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
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row-reverse', // RTL layout
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    color: theme.colors.onSurface,
    fontFamily: 'NotoKufiArabic_700Bold',
    textAlign: 'right',
    flex: 1,
  },
  tierBadge: {
    marginStart: 8,
  },
  premiumBadge: {
    backgroundColor: '#FFD700', // Gold color for premium
  },
  freeBadge: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  tierBadgeText: {
    fontFamily: 'NotoKufiArabic_700Bold',
    fontSize: 12,
  },
  subtitle: {
    color: theme.colors.primary,
    fontFamily: 'NotoKufiArabic_400Regular',
    textAlign: 'right',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'NotoKufiArabic_700Bold',
    color: theme.colors.onSurface,
    marginBottom: 16,
    textAlign: 'right',
  },
  actionButton: {
    marginBottom: 12,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row-reverse', // RTL layout
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.primary,
    fontFamily: 'NotoKufiArabic_700Bold',
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
    textAlign: 'center',
  },
  placeholderText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingButton: {
    marginBottom: 8,
  },
});
