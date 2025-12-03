# Client Services Contract

**Feature**: Tafawoq Platform
**Date**: 2025-12-03
**Purpose**: TypeScript service interfaces for React Native app business logic layer.

## Overview

This document defines the client-side service layer interfaces that abstract Supabase operations, AI integrations, and business logic from UI components. All services follow dependency injection patterns for testability.

---

## 1. Authentication Service

### 1.1 AuthService Interface

**File**: `src/services/supabase/auth.service.ts`

```typescript
export interface AuthService {
  /**
   * Register new user with email and password
   * Sends email verification OTP automatically
   */
  signUp(email: string, password: string): Promise<AuthResult>;

  /**
   * Verify email with 6-digit OTP code
   */
  verifyEmail(email: string, otp: string): Promise<VerificationResult>;

  /**
   * Sign in existing user
   */
  signIn(email: string, password: string): Promise<AuthResult>;

  /**
   * Sign out current user
   */
  signOut(): Promise<void>;

  /**
   * Resend email verification OTP
   * Rate limited: 1 request per 60 seconds
   */
  resendVerificationOTP(email: string): Promise<{ success: boolean; retryAfter?: number }>;

  /**
   * Get current authenticated user session
   */
  getCurrentSession(): Promise<Session | null>;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): Subscription;
}

// Types
export interface AuthResult {
  user: User | null;
  session: Session | null;
  error?: AuthError;
}

export interface VerificationResult {
  verified: boolean;
  error?: AuthError;
}

export interface AuthError {
  message: string;
  code: string; // e.g., 'invalid_credentials', 'email_not_confirmed'
}

export interface User {
  id: string;
  email: string;
  emailConfirmedAt: Date | null;
  createdAt: Date;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}
```

**Usage Example**:
```typescript
// In RegisterScreen.tsx
const authService = useAuthService();

const handleRegister = async () => {
  const result = await authService.signUp(email, password);
  if (result.error) {
    Alert.alert('Registration Failed', result.error.message);
  } else {
    navigation.navigate('EmailVerification', { email });
  }
};
```

---

## 2. Profile Service

### 2.1 ProfileService Interface

**File**: `src/services/supabase/profile.service.ts`

```typescript
export interface ProfileService {
  /**
   * Create or update user profile (onboarding completion)
   */
  upsertProfile(profile: ProfileUpdate): Promise<Profile>;

  /**
   * Get current user's profile
   */
  getProfile(userId: string): Promise<Profile | null>;

  /**
   * Update academic track
   */
  updateAcademicTrack(userId: string, track: AcademicTrack): Promise<Profile>;

  /**
   * Upload profile picture to Supabase Storage
   */
  uploadProfilePicture(userId: string, imageUri: string): Promise<string>; // Returns storage URL

  /**
   * Mark onboarding as completed
   */
  completeOnboarding(userId: string): Promise<void>;
}

// Types
export interface Profile {
  id: string;
  userId: string;
  academicTrack: AcademicTrack;
  profilePictureUrl: string | null;
  onboardingCompleted: boolean;
  totalPracticeHours: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileUpdate {
  userId: string;
  academicTrack: AcademicTrack;
  profilePictureUrl?: string;
}

export type AcademicTrack = 'scientific' | 'literary';
```

**Usage Example**:
```typescript
// In ProfileSetupScreen.tsx
const profileService = useProfileService();

const handleProfileSetup = async () => {
  const profile = await profileService.upsertProfile({
    userId: user.id,
    academicTrack: selectedTrack
  });

  await profileService.completeOnboarding(user.id);
  navigation.navigate('Dashboard');
};
```

---

## 3. Subscription Service

### 3.1 SubscriptionService Interface

**File**: `src/services/stripe/subscription.service.ts`

```typescript
export interface SubscriptionService {
  /**
   * Get current user's subscription details
   */
  getSubscription(userId: string): Promise<Subscription | null>;

  /**
   * Check if user has premium access
   */
  hasPremiumAccess(userId: string): Promise<boolean>;

  /**
   * Initialize Stripe Payment Sheet for premium upgrade
   */
  initializePremiumCheckout(userId: string): Promise<CheckoutSession>;

  /**
   * Present Stripe Payment Sheet
   */
  presentPaymentSheet(clientSecret: string): Promise<PaymentResult>;

  /**
   * Cancel subscription (effective at period end)
   */
  cancelSubscription(userId: string): Promise<void>;

  /**
   * Reactivate canceled subscription
   */
  reactivateSubscription(userId: string): Promise<Subscription>;

  /**
   * Get subscription status (polls Supabase for webhook updates)
   */
  refreshSubscriptionStatus(userId: string): Promise<Subscription>;
}

// Types
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialEndAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
}

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface CheckoutSession {
  clientSecret: string;
  ephemeralKey: string;
  customerId: string;
}

export interface PaymentResult {
  success: boolean;
  error?: PaymentError;
}

export interface PaymentError {
  code: string;
  message: string;
  declineCode?: string;
}
```

**Usage Example**:
```typescript
// In SubscriptionScreen.tsx
const subscriptionService = useSubscriptionService();

const handleUpgradeToPremium = async () => {
  const checkout = await subscriptionService.initializePremiumCheckout(user.id);
  const result = await subscriptionService.presentPaymentSheet(checkout.clientSecret);

  if (result.success) {
    // Poll for subscription status update from webhook
    await subscriptionService.refreshSubscriptionStatus(user.id);
    Alert.alert('Success', 'Welcome to Premium!');
  }
};
```

---

## 4. Exam Service

### 4.1 ExamService Interface

**File**: `src/services/supabase/exam.service.ts`

```typescript
export interface ExamService {
  /**
   * Check if user can start new exam (tier limit check)
   */
  checkExamEligibility(userId: string): Promise<EligibilityResult>;

  /**
   * Create new exam session and generate questions
   */
  startExam(userId: string, academicTrack: AcademicTrack): Promise<ExamSession>;

  /**
   * Get exam session by ID
   */
  getExamSession(sessionId: string): Promise<ExamSession | null>;

  /**
   * Submit exam answers and calculate results
   */
  submitExam(sessionId: string, answers: QuestionAnswer[]): Promise<ExamResult>;

  /**
   * Get exam result by session ID
   */
  getExamResult(sessionId: string): Promise<ExamResult | null>;

  /**
   * Get user's exam history
   */
  getExamHistory(userId: string, limit?: number): Promise<ExamSession[]>;

  /**
   * Abandon exam (mark as incomplete)
   */
  abandonExam(sessionId: string): Promise<void>;
}

// Types
export interface EligibilityResult {
  eligible: boolean;
  reason: string;
  nextAvailableAt: Date | null;
}

export interface ExamSession {
  id: string;
  userId: string;
  status: ExamStatus;
  startedAt: Date;
  completedAt: Date | null;
  totalQuestions: number;
  questionsAnswered: number;
  timeSpentSeconds: number;
  questions: Question[];
}

export type ExamStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Question {
  id: string;
  section: Section;
  category: string;
  difficulty: Difficulty;
  questionText: string;
  hasImage: boolean;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation: string; // Only shown to premium users
}

export type Section = 'verbal' | 'quantitative';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionAnswer {
  questionId: string;
  selectedAnswer: string;
  timeSpentSeconds: number;
}

export interface ExamResult {
  id: string;
  examSessionId: string;
  userId: string;
  verbalScore: number;
  quantitativeScore: number;
  overallAverage: number;
  strengths: CategoryPerformance[];
  weaknesses: CategoryPerformance[];
  improvementAdvice: string;
  createdAt: Date;
}

export interface CategoryPerformance {
  category: string;
  score: number;
}
```

**Usage Example**:
```typescript
// In ExamSetupScreen.tsx
const examService = useExamService();

const handleStartExam = async () => {
  const eligibility = await examService.checkExamEligibility(user.id);

  if (!eligibility.eligible) {
    Alert.alert('Limit Reached', eligibility.reason);
    return;
  }

  setLoading(true);
  const session = await examService.startExam(user.id, profile.academicTrack);
  setLoading(false);

  navigation.navigate('ExamTaking', { session });
};

// In ExamTakingScreen.tsx
const handleSubmitExam = async () => {
  const result = await examService.submitExam(session.id, userAnswers);
  navigation.navigate('ExamResults', { result });
};
```

---

## 5. Practice Service

### 5.1 PracticeService Interface

**File**: `src/services/supabase/practice.service.ts`

```typescript
export interface PracticeService {
  /**
   * Get available categories for selected section
   */
  getAvailableCategories(section: Section): Promise<Category[]>;

  /**
   * Start practice session with user configuration
   */
  startPractice(config: PracticeConfig): Promise<PracticeSession>;

  /**
   * Get practice session by ID
   */
  getPracticeSession(sessionId: string): Promise<PracticeSession | null>;

  /**
   * Submit practice answers and calculate results
   */
  submitPractice(sessionId: string, answers: QuestionAnswer[]): Promise<PracticeResult>;

  /**
   * Get practice result by session ID
   */
  getPracticeResult(sessionId: string): Promise<PracticeResult | null>;

  /**
   * Get user's practice history
   */
  getPracticeHistory(userId: string, limit?: number): Promise<PracticeSession[]>;
}

// Types
export interface Category {
  id: string;
  name: string;
  nameArabic: string;
  section: Section;
  description: string;
}

export interface PracticeConfig {
  userId: string;
  section: Section;
  categories: string[]; // Category IDs
  difficulty: Difficulty;
  questionCount: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  section: Section;
  categories: string[];
  difficulty: Difficulty;
  questionCount: number;
  status: ExamStatus;
  startedAt: Date;
  completedAt: Date | null;
  timeSpentSeconds: number;
  questions: Question[];
}

export interface PracticeResult {
  id: string;
  practiceSessionId: string;
  userId: string;
  overallScore: number;
  categoryBreakdown: Record<string, number>; // {geometry: 85.5, roots_exponents: 72.0}
  strengths: CategoryPerformance[];
  weaknesses: CategoryPerformance[];
  improvementAdvice: string;
  createdAt: Date;
}
```

**Usage Example**:
```typescript
// In PracticeSetupScreen.tsx
const practiceService = usePracticeService();

const handleStartPractice = async () => {
  const config: PracticeConfig = {
    userId: user.id,
    section: selectedSection,
    categories: selectedCategories,
    difficulty: selectedDifficulty,
    questionCount: hasPremium ? customCount : 5
  };

  setLoading(true);
  const session = await practiceService.startPractice(config);
  setLoading(false);

  navigation.navigate('PracticeTaking', { session });
};
```

---

## 6. Analytics Service

### 6.1 AnalyticsService Interface

**File**: `src/services/supabase/analytics.service.ts`

```typescript
export interface AnalyticsService {
  /**
   * Get user's aggregated performance analytics
   */
  getUserAnalytics(userId: string): Promise<UserAnalytics>;

  /**
   * Get category-specific performance breakdown
   */
  getCategoryPerformance(userId: string): Promise<CategoryPerformance[]>;

  /**
   * Get exam performance trend over time
   */
  getExamTrend(userId: string, limit?: number): Promise<ExamTrendData[]>;

  /**
   * Get practice session trend over time
   */
  getPracticeTrend(userId: string, limit?: number): Promise<PracticeTrendData[]>;

  /**
   * Export performance report (premium feature)
   */
  exportPerformanceReport(userId: string, format: 'pdf' | 'csv'): Promise<string>; // Returns download URL
}

// Types
export interface UserAnalytics {
  id: string;
  userId: string;
  lastExamVerbalScore: number | null;
  lastExamQuantitativeScore: number | null;
  lastExamOverallAverage: number | null;
  totalExamsCompleted: number;
  totalPracticesCompleted: number;
  totalPracticeHours: number;
  strongestCategory: string | null;
  weakestCategory: string | null;
  lastActivityAt: Date;
  updatedAt: Date;
}

export interface ExamTrendData {
  examDate: Date;
  verbalScore: number;
  quantitativeScore: number;
  overallAverage: number;
}

export interface PracticeTrendData {
  practiceDate: Date;
  overallScore: number;
  categories: string[];
  questionCount: number;
}
```

**Usage Example**:
```typescript
// In DashboardScreen.tsx
const analyticsService = useAnalyticsService();

useEffect(() => {
  const loadAnalytics = async () => {
    const analytics = await analyticsService.getUserAnalytics(user.id);
    const categoryPerf = await analyticsService.getCategoryPerformance(user.id);
    setAnalytics(analytics);
    setCategoryPerformance(categoryPerf);
  };

  loadAnalytics();
}, [user.id]);
```

---

## 7. Notification Service

### 7.1 NotificationService Interface

**File**: `src/services/notifications/notification.service.ts`

```typescript
export interface NotificationService {
  /**
   * Request push notification permissions
   */
  requestPermissions(): Promise<PermissionStatus>;

  /**
   * Register device for push notifications (get Expo push token)
   */
  registerDevice(userId: string): Promise<string>; // Returns push token

  /**
   * Update notification preferences
   */
  updatePreferences(userId: string, prefs: NotificationPreferences): Promise<void>;

  /**
   * Get notification preferences
   */
  getPreferences(userId: string): Promise<NotificationPreferences>;

  /**
   * Schedule local notification (exam reminder)
   */
  scheduleLocalNotification(notification: LocalNotification): Promise<string>; // Returns notification ID

  /**
   * Cancel scheduled notification
   */
  cancelNotification(notificationId: string): Promise<void>;
}

// Types
export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export interface NotificationPreferences {
  examRemindersEnabled: boolean;
  milestoneNotificationsEnabled: boolean;
  pushToken: string | null;
}

export interface LocalNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: NotificationTrigger;
}

export interface NotificationTrigger {
  type: 'timeInterval' | 'date';
  seconds?: number; // For timeInterval
  date?: Date;      // For date
  repeats?: boolean;
}
```

---

## 8. Service Implementation Guidelines

### Dependency Injection Pattern

All services should be provided via React Context for easy mocking in tests:

```typescript
// src/contexts/ServicesContext.tsx
export const ServicesContext = createContext<Services | null>(null);

export interface Services {
  auth: AuthService;
  profile: ProfileService;
  subscription: SubscriptionService;
  exam: ExamService;
  practice: PracticeService;
  analytics: AnalyticsService;
  notification: NotificationService;
}

export const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const services: Services = {
    auth: new SupabaseAuthService(),
    profile: new SupabaseProfileService(),
    subscription: new StripeSubscriptionService(),
    exam: new SupabaseExamService(),
    practice: new SupabasePracticeService(),
    analytics: new SupabaseAnalyticsService(),
    notification: new ExpoNotificationService()
  };

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

// Custom hooks
export const useAuthService = () => useContext(ServicesContext)!.auth;
export const useProfileService = () => useContext(ServicesContext)!.profile;
// ... etc
```

### Error Handling

All services should throw typed errors for consistent error handling:

```typescript
export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage in service
if (!eligibility.eligible) {
  throw new ServiceError(
    'EXAM_LIMIT_EXCEEDED',
    'Free tier allows 1 exam per week',
    { nextAvailableAt: eligibility.nextAvailableAt }
  );
}
```

### Loading States

Components should handle loading states consistently:

```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await service.someOperation();
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

---

**Contract Status**: Complete - Ready for implementation
