/**
 * Navigation Type Definitions
 *
 * TypeScript types for React Navigation v6
 */

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { UUID } from '@/types/common.types';

/**
 * Auth Stack Navigator Param List
 * Screens accessible before authentication
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: {
    email: string;
  };
  Welcome: undefined;
  ProfileSetup: undefined;
};

/**
 * Main Stack Navigator Param List
 * Screens accessible after authentication
 */
export type MainStackParamList = {
  // Dashboard screens (US1, US5)
  Home: undefined;
  Analytics: undefined;
  Profile: undefined;

  // Subscription screens (US2)
  Subscription: undefined;

  // Exam screens (US3)
  ExamSetup: undefined;
  ExamTaking: {
    sessionId: UUID;
  };
  ExamResults: {
    sessionId: UUID;
  };

  // Practice screens (US4)
  PracticeSetup: undefined;
  PracticeTaking: {
    sessionId: UUID;
  };
  PracticeResults: {
    sessionId: UUID;
  };

  // Settings screens (US6)
  Settings: undefined;
  NotificationPreferences: undefined;
  Legal: {
    type: 'privacy' | 'terms';
  };
};

/**
 * Root Navigator Param List
 * Top-level navigation combining Auth and Main stacks
 */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

/**
 * Navigation prop types for screens
 */
export type AuthStackNavigationProp<T extends keyof AuthStackParamList> =
  StackNavigationProp<AuthStackParamList, T>;

export type MainStackNavigationProp<T extends keyof MainStackParamList> =
  StackNavigationProp<MainStackParamList, T>;

export type RootStackNavigationProp<T extends keyof RootStackParamList> =
  StackNavigationProp<RootStackParamList, T>;

/**
 * Route prop types for screens
 */
export type AuthStackRouteProp<T extends keyof AuthStackParamList> =
  RouteProp<AuthStackParamList, T>;

export type MainStackRouteProp<T extends keyof MainStackParamList> =
  RouteProp<MainStackParamList, T>;

export type RootStackRouteProp<T extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, T>;

/**
 * Combined screen props type
 */
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = {
  navigation: AuthStackNavigationProp<T>;
  route: AuthStackRouteProp<T>;
};

export type MainStackScreenProps<T extends keyof MainStackParamList> = {
  navigation: MainStackNavigationProp<T>;
  route: MainStackRouteProp<T>;
};

/**
 * Declare global types for TypeScript navigation
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
