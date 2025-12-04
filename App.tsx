/**
 * Tafawoq - Saudi Aptitude Exam Preparation Platform
 *
 * Main App Entry Point
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import {
  NotoKufiArabic_400Regular,
  NotoKufiArabic_700Bold,
} from '@expo-google-fonts/noto-kufi-arabic';

// Configuration
import { theme } from './src/config/theme.config';
import { initializeStripe } from './src/config/stripe.config';
import { setRTL } from './src/utils/rtl.utils';

// Contexts
import { ServicesProvider } from './src/contexts/ServicesContext';

// Navigation
import { AppNavigator } from './src/navigation/AppNavigator';

// Components
import { LoadingSpinner } from './src/components/common/LoadingSpinner';

// Hooks
import { useAuth } from './src/hooks/useAuth';
import { useProfile } from './src/hooks/useProfile';

/**
 * AppContent - Inner app component with auth state management
 *
 * Must be inside ServicesProvider to use hooks
 */
const AppContent: React.FC = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, isLoading: profileLoading, hasCompletedOnboarding } = useProfile(user?.id);

  // Determine navigation state
  // Show auth stack if:
  // - User is not authenticated, OR
  // - User is authenticated but hasn't completed onboarding
  const shouldShowAuthStack = !isAuthenticated || (isAuthenticated && !hasCompletedOnboarding);
  const isLoadingAuth = authLoading || (isAuthenticated && profileLoading);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppNavigator
        isAuthenticated={!shouldShowAuthStack}
        isLoading={isLoadingAuth}
      />
    </>
  );
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    NotoKufiArabic_400Regular,
    NotoKufiArabic_700Bold,
  });

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Force RTL layout for Arabic
        setRTL(true, true);

        // 2. Initialize Stripe SDK
        await initializeStripe();

        // 3. Mark app as ready
        setIsReady(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        // Still mark as ready to show error state
        setIsReady(true);
      }
    };

    if (fontsLoaded) {
      initializeApp();
    }
  }, [fontsLoaded]);

  // Show loading screen while initializing
  if (!fontsLoaded || !isReady) {
    return <LoadingSpinner message="جاري تحميل التطبيق..." />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ServicesProvider>
          <AppContent />
        </ServicesProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
