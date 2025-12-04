/**
 * Auth Stack Navigator
 *
 * Navigation for unauthenticated users
 * Includes login, registration, email verification, and onboarding
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';

// Auth screens
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { EmailVerificationScreen } from '@/screens/auth/EmailVerificationScreen';

// Onboarding screens
import { WelcomeScreen } from '@/screens/onboarding/WelcomeScreen';
import { ProfileSetupScreen } from '@/screens/onboarding/ProfileSetupScreen';

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Auth Stack Navigator
 *
 * Screens:
 * - Login: Email/password login
 * - Register: Account registration
 * - EmailVerification: OTP verification
 * - Welcome: Welcome/tutorial screen
 * - ProfileSetup: Academic track and profile picture
 */
export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide headers for auth screens
        cardStyle: { backgroundColor: '#F5F5F5' },
        gestureEnabled: true,
        gestureDirection: 'horizontal-inverted', // RTL gesture
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'تسجيل الدخول',
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'إنشاء حساب',
        }}
      />

      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{
          title: 'التحقق من البريد الإلكتروني',
          gestureEnabled: false, // Prevent back gesture during verification
        }}
      />

      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          title: 'مرحباً',
        }}
      />

      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{
          title: 'إعداد الملف الشخصي',
          gestureEnabled: false, // Prevent back gesture during setup
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
