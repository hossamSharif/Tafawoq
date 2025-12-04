/**
 * WelcomeScreen - App introduction after email verification
 *
 * Features:
 * - Welcome message with app branding
 * - Brief introduction to app features
 * - RTL layout for Arabic
 * - Navigation to ProfileSetup screen
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/config/theme.config';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  /**
   * Navigate to profile setup
   */
  const handleContinue = () => {
    navigation.navigate('ProfileSetup');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displayLarge" style={styles.title}>
            تفوّق
          </Text>
          <Text variant="headlineSmall" style={styles.welcomeText}>
            مرحباً بك!
          </Text>
        </View>

        {/* App Introduction */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              منصتك الشاملة للتحضير للاختبارات التحصيلية
            </Text>

            <View style={styles.featuresContainer}>
              {/* Feature 1 */}
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Text variant="displaySmall" style={styles.icon}>
                    📝
                  </Text>
                </View>
                <View style={styles.featureContent}>
                  <Text variant="titleMedium" style={styles.featureTitle}>
                    اختبارات متكاملة
                  </Text>
                  <Text variant="bodyMedium" style={styles.featureDescription}>
                    اختبارات تحصيلية كاملة تغطي القسمين اللفظي والكمي بأسئلة مولدة بالذكاء الاصطناعي
                  </Text>
                </View>
              </View>

              {/* Feature 2 */}
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Text variant="displaySmall" style={styles.icon}>
                    🎯
                  </Text>
                </View>
                <View style={styles.featureContent}>
                  <Text variant="titleMedium" style={styles.featureTitle}>
                    تمارين مخصصة
                  </Text>
                  <Text variant="bodyMedium" style={styles.featureDescription}>
                    أنشئ جلسات تدريب مخصصة حسب الفئة، المستوى، وعدد الأسئلة
                  </Text>
                </View>
              </View>

              {/* Feature 3 */}
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Text variant="displaySmall" style={styles.icon}>
                    📊
                  </Text>
                </View>
                <View style={styles.featureContent}>
                  <Text variant="titleMedium" style={styles.featureTitle}>
                    تحليلات الأداء
                  </Text>
                  <Text variant="bodyMedium" style={styles.featureDescription}>
                    تابع تقدمك مع تحليلات مفصلة لنقاط القوة والضعف في كل فئة
                  </Text>
                </View>
              </View>

              {/* Feature 4 */}
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Text variant="displaySmall" style={styles.icon}>
                    💎
                  </Text>
                </View>
                <View style={styles.featureContent}>
                  <Text variant="titleMedium" style={styles.featureTitle}>
                    الاشتراك المميز
                  </Text>
                  <Text variant="bodyMedium" style={styles.featureDescription}>
                    اختبارات غير محدودة، 100 سؤال تدريب، وشروحات مفصلة للحلول
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Continue Button */}
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          contentStyle={styles.continueButtonContent}
        >
          المتابعة
        </Button>
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
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  title: {
    color: theme.colors.primary,
    fontFamily: 'NotoKufiArabic_700Bold',
    marginBottom: 8,
  },
  welcomeText: {
    color: theme.colors.onSurface,
    fontFamily: 'NotoKufiArabic_700Bold',
  },
  card: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'NotoKufiArabic_700Bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 24,
  },
  feature: {
    flexDirection: 'row-reverse', // RTL layout
    gap: 16,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'NotoKufiArabic_700Bold',
    color: theme.colors.onSurface,
    marginBottom: 4,
    textAlign: 'right',
  },
  featureDescription: {
    fontFamily: 'NotoKufiArabic_400Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'right',
    lineHeight: 22,
  },
  continueButton: {
    marginTop: 'auto',
  },
  continueButtonContent: {
    paddingVertical: 8,
  },
});
