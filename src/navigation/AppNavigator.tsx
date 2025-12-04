/**
 * App Navigator
 *
 * Root navigation with auth state switching
 * Automatically switches between AuthStack and MainStack based on authentication state
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import type { RootStackParamList } from './types';

import AuthStack from './AuthStack';
import MainStack from './MainStack';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Loading Screen
 * Shown while checking authentication state
 */
const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#006C35" />
    </View>
  );
};

/**
 * App Navigator Props
 */
interface AppNavigatorProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * App Navigator
 *
 * Usage in App.tsx:
 * ```typescript
 * import { AppNavigator } from '@/navigation/AppNavigator';
 * import { useAuth } from '@/hooks/useAuth';
 *
 * export default function App() {
 *   const { isAuthenticated, isLoading } = useAuth();
 *
 *   return (
 *     <AppNavigator
 *       isAuthenticated={isAuthenticated}
 *       isLoading={isLoading}
 *     />
 *   );
 * }
 * ```
 */
export const AppNavigator: React.FC<AppNavigatorProps> = ({
  isAuthenticated,
  isLoading,
}) => {
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default AppNavigator;
