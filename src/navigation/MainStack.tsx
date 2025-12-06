/**
 * Main Stack Navigator
 *
 * Navigation for authenticated users
 * Includes all main app screens (dashboard, exams, practice, settings)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { MainStackParamList } from './types';

// Dashboard screens
import { HomeScreen } from '@/screens/dashboard/HomeScreen';

// Settings screens
import { SubscriptionScreen } from '@/screens/settings/SubscriptionScreen';

// Placeholder screens (will be implemented in Phases 5-8)
const PlaceholderScreen = () => <></>;

const Stack = createStackNavigator<MainStackParamList>();

/**
 * Main Stack Navigator
 *
 * Screens organized by user stories:
 * - US1: Home, Profile
 * - US2: Subscription
 * - US3: Exam (Setup, Taking, Results)
 * - US4: Practice (Setup, Taking, Results)
 * - US5: Analytics
 * - US6: Settings, Notifications, Legal
 */
export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#006C35', // Saudi Green
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontFamily: 'NotoKufiArabic_700Bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        cardStyle: { backgroundColor: '#F5F5F5' },
        gestureEnabled: true,
        gestureDirection: 'horizontal-inverted', // RTL gesture
      }}
    >
      {/* Dashboard Screens */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'الرئيسية',
        }}
      />

      <Stack.Screen
        name="Analytics"
        component={PlaceholderScreen}
        options={{
          title: 'التحليلات',
        }}
      />

      <Stack.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          title: 'الملف الشخصي',
        }}
      />

      {/* Subscription Screen */}
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          title: 'الاشتراك',
        }}
      />

      {/* Exam Screens */}
      <Stack.Screen
        name="ExamSetup"
        component={PlaceholderScreen}
        options={{
          title: 'امتحان متكامل',
        }}
      />

      <Stack.Screen
        name="ExamTaking"
        component={PlaceholderScreen}
        options={{
          title: 'الاختبار',
          headerLeft: () => null, // Prevent back during exam
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="ExamResults"
        component={PlaceholderScreen}
        options={{
          title: 'نتائج الاختبار',
        }}
      />

      {/* Practice Screens */}
      <Stack.Screen
        name="PracticeSetup"
        component={PlaceholderScreen}
        options={{
          title: 'جلسة تدريب',
        }}
      />

      <Stack.Screen
        name="PracticeTaking"
        component={PlaceholderScreen}
        options={{
          title: 'التدريب',
          headerLeft: () => null, // Prevent back during practice
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="PracticeResults"
        component={PlaceholderScreen}
        options={{
          title: 'نتائج التدريب',
        }}
      />

      {/* Settings Screens */}
      <Stack.Screen
        name="Settings"
        component={PlaceholderScreen}
        options={{
          title: 'الإعدادات',
        }}
      />

      <Stack.Screen
        name="NotificationPreferences"
        component={PlaceholderScreen}
        options={{
          title: 'الإشعارات',
        }}
      />

      <Stack.Screen
        name="Legal"
        component={PlaceholderScreen}
        options={({ route }) => ({
          title: route.params.type === 'privacy' ? 'سياسة الخصوصية' : 'شروط الاستخدام',
        })}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
