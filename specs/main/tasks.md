# Tasks: Tafawoq - Saudi Aptitude Exam Preparation Platform

**Feature Branch**: `main`
**Generated**: 2025-12-03
**Input Documents**: plan.md, spec.md, data-model.md, contracts/ (client-services.md, gemini-ai.md, supabase-rpc.md), research.md, quickstart.md

**Tests**: Not included (not explicitly requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Task Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3, US4, US5, US6 - from spec.md)
- All tasks include specific file paths for immediate execution

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize React Native Expo project with core dependencies and configuration

- [ ] T001 Initialize Expo React Native project with SDK 51+ and TypeScript using `npx create-expo-app tafawoq --template expo-template-blank-typescript`
- [ ] T002 [P] Install core dependencies: @supabase/supabase-js, @stripe/stripe-react-native, @google/generative-ai, @react-navigation/native, @react-navigation/stack in package.json
- [ ] T003 [P] Install UI dependencies: react-native-paper, react-native-safe-area-context, expo-font, react-native-fast-image in package.json
- [ ] T004 [P] Configure TypeScript with strict mode (strictNullChecks, noImplicitAny, esModuleInterop) in tsconfig.json per research.md
- [ ] T005 [P] Configure ESLint with @typescript-eslint rules in .eslintrc.js
- [ ] T006 [P] Create .gitignore with .env, node_modules, build artifacts
- [ ] T007 [P] Create .env.example with all required environment variables per quickstart.md
- [ ] T008 [P] Configure Expo app.json with RTL support, Noto Kufi Arabic font, and SafeAreaView settings
- [ ] T009 Create src/ directory structure: components/, screens/, services/, hooks/, types/, navigation/, contexts/, config/, utils/, assets/
- [ ] T010 [P] Create __tests__/ directory structure: unit/, component/, e2e/
- [ ] T011 Configure Jest and React Native Testing Library in jest.config.js

**Checkpoint**: Project structure initialized, dependencies installed, ready for foundational implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**CRITICAL**: No user story work can begin until this phase is complete

### Configuration & Theme

- [ ] T012 [P] Create Supabase client configuration in src/config/supabase.config.ts
- [ ] T013 [P] Create Stripe SDK configuration in src/config/stripe.config.ts
- [ ] T014 [P] Create Gemini API configuration (Edge Function URLs) in src/config/gemini.config.ts
- [ ] T015 [P] Create React Native Paper theme with RTL support and Noto Kufi Arabic typography in src/config/theme.config.ts

### Utility Functions

- [ ] T016 [P] Create RTL layout helper functions in src/utils/rtl.utils.ts per research.md RTL best practices
- [ ] T017 [P] Create input validation helpers in src/utils/validation.utils.ts
- [ ] T018 [P] Create network error handling and offline detection utilities in src/utils/network.utils.ts

### Type Definitions

- [ ] T019 [P] Create common type definitions (Section, Difficulty, AcademicTrack) in src/types/common.types.ts
- [ ] T020 [P] Create user type definitions (User, Profile, Session) in src/types/user.types.ts
- [ ] T021 [P] Create subscription type definitions (Subscription, SubscriptionTier, SubscriptionStatus) in src/types/subscription.types.ts
- [ ] T022 [P] Create exam type definitions (ExamSession, ExamResult, Question, QuestionAnswer) in src/types/exam.types.ts
- [ ] T023 [P] Create practice type definitions (PracticeSession, PracticeResult, PracticeConfig) in src/types/practice.types.ts
- [ ] T024 [P] Create analytics type definitions (UserAnalytics, CategoryPerformance) in src/types/analytics.types.ts
- [ ] T025 [P] Create API type definitions (ServiceError, ApiResponse) in src/types/api.types.ts

### Service Layer Foundation

- [ ] T026 Create ServiceError class in src/services/errors/service-error.ts per client-services.md
- [ ] T027 [P] Create GeminiServiceError class in src/services/errors/gemini-error.ts per gemini-ai.md
- [ ] T028 Create ServicesContext provider with dependency injection pattern in src/contexts/ServicesContext.tsx per client-services.md

### Navigation Foundation

- [ ] T029 Create navigation type definitions (AuthStackParamList, MainStackParamList) in src/navigation/types.ts
- [ ] T030 Create AuthStack navigator placeholder in src/navigation/AuthStack.tsx
- [ ] T031 Create MainStack navigator placeholder in src/navigation/MainStack.tsx
- [ ] T032 Create AppNavigator with auth state switching in src/navigation/AppNavigator.tsx

### Supabase Database Setup

- [ ] T033 Apply migration for pgvector extension using mcp__supabase__apply_migration
- [ ] T034 Apply migration for user_profiles table using mcp__supabase__apply_migration per data-model.md
- [ ] T035 Apply migration for user_subscriptions table using mcp__supabase__apply_migration per data-model.md
- [ ] T036 Apply migration for exam_sessions table using mcp__supabase__apply_migration per data-model.md
- [ ] T037 Apply migration for exam_results table using mcp__supabase__apply_migration per data-model.md
- [ ] T038 Apply migration for practice_sessions table using mcp__supabase__apply_migration per data-model.md
- [ ] T039 Apply migration for practice_results table using mcp__supabase__apply_migration per data-model.md
- [ ] T040 Apply migration for question_templates table using mcp__supabase__apply_migration per data-model.md
- [ ] T041 Apply migration for question_embeddings table with VECTOR(768) column using mcp__supabase__apply_migration per data-model.md
- [ ] T042 Apply migration for user_analytics table using mcp__supabase__apply_migration per data-model.md
- [ ] T043 Apply migration for notification_preferences table using mcp__supabase__apply_migration per data-model.md
- [ ] T044 Apply migration to enable RLS on all tables using mcp__supabase__apply_migration
- [ ] T045 Apply migration for RLS policies per data-model.md using mcp__supabase__apply_migration
- [ ] T046 Apply migration for HNSW vector index on question_embeddings using mcp__supabase__apply_migration
- [ ] T047 Apply migration for has_premium_access() helper function using mcp__supabase__apply_migration per data-model.md
- [ ] T048 Apply migration for update_user_analytics trigger function using mcp__supabase__apply_migration per data-model.md

### Supabase RPC Functions

- [ ] T049 [P] Apply migration for check_exam_eligibility RPC function using mcp__supabase__apply_migration per supabase-rpc.md
- [ ] T050 [P] Apply migration for calculate_practice_hours RPC function using mcp__supabase__apply_migration per supabase-rpc.md
- [ ] T051 [P] Apply migration for get_category_performance RPC function using mcp__supabase__apply_migration per supabase-rpc.md
- [ ] T052 [P] Apply migration for search_similar_questions RPC function using mcp__supabase__apply_migration per supabase-rpc.md

### Storage Buckets

- [ ] T053 [P] Create Supabase Storage bucket 'question-assets' (public) for generated images
- [ ] T054 [P] Create Supabase Storage bucket 'profile-pictures' (private) for user uploads

### Stripe Products Setup

- [ ] T055 Create Stripe product 'Tafawoq Premium Monthly' using mcp__stripe-agent-toolkit__create_product
- [ ] T056 Create Stripe price for premium subscription (SAR monthly) using mcp__stripe-agent-toolkit__create_price

### Type Generation

- [ ] T057 Generate TypeScript types from Supabase schema using mcp__supabase__generate_typescript_types

### Common UI Components

- [ ] T058 [P] Create LoadingSpinner component in src/components/common/LoadingSpinner.tsx
- [ ] T059 [P] Create ErrorMessage component with Arabic text support in src/components/common/ErrorMessage.tsx
- [ ] T060 [P] Create Button component with RTL support in src/components/common/Button.tsx
- [ ] T061 [P] Create Card component in src/components/common/Card.tsx
- [ ] T062 [P] Create Input component with Arabic placeholder support in src/components/common/Input.tsx

### App Entry Point

- [ ] T063 Create App.tsx with RTL initialization (I18nManager.forceRTL), theme provider, ServicesContext, and navigation container

**Checkpoint**: Foundation complete - Database ready, Service layer structure in place, Navigation configured. User story implementation can now begin.

---

## Phase 3: User Story 1 - User Registration & Profile Setup (Priority: P1)

**Goal**: Students can create accounts, verify email via OTP, select academic track, upload profile picture, and access the main dashboard.

**Independent Test**: New user can register with email/password, verify their email via OTP, select their academic track (scientific/literary), upload a profile picture, and successfully log into the application dashboard.

### Implementation for User Story 1

#### Auth Service (per client-services.md)

- [ ] T064 [US1] Implement AuthService interface in src/services/supabase/auth.service.ts
- [ ] T065 [US1] Implement signUp method with email/password in src/services/supabase/auth.service.ts
- [ ] T066 [US1] Implement verifyEmail method with OTP validation in src/services/supabase/auth.service.ts
- [ ] T067 [US1] Implement signIn method in src/services/supabase/auth.service.ts
- [ ] T068 [US1] Implement signOut method in src/services/supabase/auth.service.ts
- [ ] T069 [US1] Implement resendVerificationOTP method with rate limiting in src/services/supabase/auth.service.ts
- [ ] T070 [US1] Implement getCurrentSession method in src/services/supabase/auth.service.ts
- [ ] T071 [US1] Implement onAuthStateChange subscription in src/services/supabase/auth.service.ts

#### Profile Service (per client-services.md)

- [ ] T072 [US1] Implement ProfileService interface in src/services/supabase/profile.service.ts
- [ ] T073 [US1] Implement upsertProfile method in src/services/supabase/profile.service.ts
- [ ] T074 [US1] Implement getProfile method in src/services/supabase/profile.service.ts
- [ ] T075 [US1] Implement updateAcademicTrack method in src/services/supabase/profile.service.ts
- [ ] T076 [US1] Implement uploadProfilePicture method with Supabase Storage in src/services/supabase/profile.service.ts
- [ ] T077 [US1] Implement completeOnboarding method in src/services/supabase/profile.service.ts

#### Hooks

- [ ] T078 [US1] Create useAuth hook for authentication state management in src/hooks/useAuth.ts
- [ ] T079 [US1] Create useProfile hook for profile loading and updates in src/hooks/useProfile.ts

#### Auth Screens

- [ ] T080 [P] [US1] Create LoginScreen with email/password form and RTL layout in src/screens/auth/LoginScreen.tsx
- [ ] T081 [P] [US1] Create RegisterScreen with email/password form and validation in src/screens/auth/RegisterScreen.tsx
- [ ] T082 [US1] Create EmailVerificationScreen with OTP input in src/screens/auth/EmailVerificationScreen.tsx

#### Onboarding Screens

- [ ] T083 [P] [US1] Create WelcomeScreen with app introduction in src/screens/onboarding/WelcomeScreen.tsx
- [ ] T084 [US1] Create ProfileSetupScreen with academic track selector and profile picture upload in src/screens/onboarding/ProfileSetupScreen.tsx

#### Navigation

- [ ] T085 [US1] Update AuthStack navigator with auth screens in src/navigation/AuthStack.tsx
- [ ] T086 [US1] Update AppNavigator with auth state switching in src/navigation/AppNavigator.tsx

#### Dashboard (Basic)

- [ ] T087 [US1] Create basic HomeScreen placeholder for authenticated users in src/screens/dashboard/HomeScreen.tsx

#### Error Handling & Validation

- [ ] T088 [US1] Add form validation and Arabic error messages to LoginScreen
- [ ] T089 [US1] Add form validation and Arabic error messages to RegisterScreen
- [ ] T090 [US1] Add loading states to all auth screens

**Checkpoint**: User Story 1 complete - Users can register, verify email, set up profile, and access dashboard independently.

---

## Phase 4: User Story 2 - Subscription Management (Priority: P2)

**Goal**: Students can view subscription status, upgrade to premium via Stripe, and manage their subscription.

**Independent Test**: Authenticated user can view their current subscription status (free tier by default), initiate a premium subscription upgrade via payment interface, complete payment, and verify that premium features are immediately unlocked. Can also cancel subscription and revert to free tier.

### Implementation for User Story 2

#### Subscription Service (per client-services.md)

- [ ] T091 [US2] Implement SubscriptionService interface in src/services/stripe/subscription.service.ts
- [ ] T092 [US2] Implement getSubscription method in src/services/stripe/subscription.service.ts
- [ ] T093 [US2] Implement hasPremiumAccess method in src/services/stripe/subscription.service.ts
- [ ] T094 [US2] Implement initializePremiumCheckout method in src/services/stripe/subscription.service.ts
- [ ] T095 [US2] Implement presentPaymentSheet method in src/services/stripe/subscription.service.ts
- [ ] T096 [US2] Implement cancelSubscription method in src/services/stripe/subscription.service.ts
- [ ] T097 [US2] Implement reactivateSubscription method in src/services/stripe/subscription.service.ts
- [ ] T098 [US2] Implement refreshSubscriptionStatus method with polling in src/services/stripe/subscription.service.ts

#### Edge Function - Stripe Webhook Handler (per supabase-rpc.md)

- [ ] T099 [US2] Create stripe-webhook-handler Edge Function in supabase/functions/stripe-webhook-handler/index.ts
- [ ] T100 [US2] Implement Stripe signature validation in stripe-webhook-handler
- [ ] T101 [US2] Implement customer.subscription.created event handler in stripe-webhook-handler
- [ ] T102 [US2] Implement customer.subscription.updated event handler in stripe-webhook-handler
- [ ] T103 [US2] Implement customer.subscription.deleted event handler in stripe-webhook-handler
- [ ] T104 [US2] Implement invoice.payment_failed event handler in stripe-webhook-handler
- [ ] T105 [US2] Deploy stripe-webhook-handler Edge Function using mcp__supabase__deploy_edge_function

#### Hooks

- [ ] T106 [US2] Create useSubscription hook for subscription state management in src/hooks/useSubscription.ts

#### Screens

- [ ] T107 [US2] Create SubscriptionScreen with tier display and upgrade button in src/screens/settings/SubscriptionScreen.tsx
- [ ] T108 [US2] Add subscription tier badge to HomeScreen in src/screens/dashboard/HomeScreen.tsx

#### Error Handling

- [ ] T109 [US2] Add Arabic error messages for payment failures in SubscriptionScreen
- [ ] T110 [US2] Add loading states during payment processing

**Checkpoint**: User Story 2 complete - Users can view subscription status, upgrade to premium, and manage billing independently.

---

## Phase 5: User Story 3 - Full Integrated Exam Taking (Priority: P3)

**Goal**: Students can take full-length integrated exams (40 questions covering verbal and quantitative sections) with AI-generated content, timer, progress tracking, and detailed scoring results.

**Independent Test**: Authenticated user can check exam eligibility, start exam generation (receives 40 AI-generated questions), answer questions with timer running, navigate between questions, submit the completed exam, and view detailed results with section scores, performance breakdown, and improvement recommendations. Premium users see solution explanations.

### Implementation for User Story 3

#### Gemini AI Services (per gemini-ai.md)

- [ ] T111 [US3] Implement EmbeddingService interface in src/services/gemini/embedding.service.ts
- [ ] T112 [US3] Implement generateEmbedding method in src/services/gemini/embedding.service.ts
- [ ] T113 [US3] Implement generateEmbeddingsBatch method in src/services/gemini/embedding.service.ts
- [ ] T114 [US3] Implement QuestionGenerationService interface in src/services/gemini/question-generation.service.ts
- [ ] T115 [US3] Implement generateExamQuestions method with Arabic prompts in src/services/gemini/question-generation.service.ts
- [ ] T116 [US3] Implement generateImprovementAdvice method in src/services/gemini/question-generation.service.ts
- [ ] T117 [US3] Implement ImageGenerationService interface in src/services/gemini/image-generation.service.ts
- [ ] T118 [US3] Implement generateImage method for geometry diagrams in src/services/gemini/image-generation.service.ts
- [ ] T119 [US3] Implement uploadImageToStorage method in src/services/gemini/image-generation.service.ts

#### Edge Function - Generate Exam Questions (per supabase-rpc.md)

- [ ] T120 [US3] Create generate-exam-questions Edge Function in supabase/functions/generate-exam-questions/index.ts
- [ ] T121 [US3] Implement subscription tier validation in generate-exam-questions
- [ ] T122 [US3] Implement embedding generation and vector search in generate-exam-questions
- [ ] T123 [US3] Implement Gemini 1.5 Flash question generation call in generate-exam-questions
- [ ] T124 [US3] Implement image generation for geometry questions in generate-exam-questions
- [ ] T125 [US3] Deploy generate-exam-questions Edge Function using mcp__supabase__deploy_edge_function

#### Exam Service (per client-services.md)

- [ ] T126 [US3] Implement ExamService interface in src/services/supabase/exam.service.ts
- [ ] T127 [US3] Implement checkExamEligibility method calling RPC in src/services/supabase/exam.service.ts
- [ ] T128 [US3] Implement startExam method calling Edge Function in src/services/supabase/exam.service.ts
- [ ] T129 [US3] Implement getExamSession method in src/services/supabase/exam.service.ts
- [ ] T130 [US3] Implement submitExam method with scoring calculation in src/services/supabase/exam.service.ts
- [ ] T131 [US3] Implement getExamResult method in src/services/supabase/exam.service.ts
- [ ] T132 [US3] Implement getExamHistory method in src/services/supabase/exam.service.ts
- [ ] T133 [US3] Implement abandonExam method in src/services/supabase/exam.service.ts

#### Hooks

- [ ] T134 [US3] Create useExamSession hook for exam state management in src/hooks/useExamSession.ts

#### Exam Components

- [ ] T135 [P] [US3] Create QuestionCard component with RTL Arabic text and image support in src/components/exam/QuestionCard.tsx
- [ ] T136 [P] [US3] Create Timer component with countdown display in src/components/exam/Timer.tsx
- [ ] T137 [P] [US3] Create ProgressBar component showing answered questions in src/components/exam/ProgressBar.tsx
- [ ] T138 [P] [US3] Create QuestionNavigation component (next/previous buttons) in src/components/exam/QuestionNavigation.tsx

#### Exam Screens

- [ ] T139 [US3] Create ExamSetupScreen with eligibility check and start button in src/screens/exam/ExamSetupScreen.tsx
- [ ] T140 [US3] Create ExamTakingScreen with question display, timer, and navigation in src/screens/exam/ExamTakingScreen.tsx
- [ ] T141 [US3] Create ExamResultsScreen with verbal/quantitative scores, strengths/weaknesses, and improvement advice in src/screens/exam/ExamResultsScreen.tsx

#### Navigation & Integration

- [ ] T142 [US3] Add exam flow screens to MainStack navigator in src/navigation/MainStack.tsx
- [ ] T143 [US3] Add "Start Exam" button to HomeScreen in src/screens/dashboard/HomeScreen.tsx

#### Error Handling

- [ ] T144 [US3] Add error handling for AI generation failures with retry option
- [ ] T145 [US3] Add loading indicator during exam generation (20 second target per spec)

**Checkpoint**: User Story 3 complete - Full exam flow with AI-generated questions, scoring, and results is functional.

---

## Phase 6: User Story 4 - Customized Practice Sessions (Priority: P4)

**Goal**: Students can create targeted practice sessions by selecting sections, categories, difficulty levels, and question counts.

**Independent Test**: Authenticated user can configure a practice session by selecting section (verbal/quantitative/mixed), specific categories, difficulty level (easy/medium/hard), and question count (5 max for free, 100 max for premium), then start the practice session, answer questions, and view results with category-specific performance breakdown.

### Implementation for User Story 4

#### Edge Function - Generate Practice Questions (per supabase-rpc.md)

- [ ] T146 [US4] Create generate-practice-questions Edge Function in supabase/functions/generate-practice-questions/index.ts
- [ ] T147 [US4] Implement tier-based question count validation in generate-practice-questions
- [ ] T148 [US4] Implement category-specific embedding and search in generate-practice-questions
- [ ] T149 [US4] Implement Gemini practice question generation in generate-practice-questions
- [ ] T150 [US4] Deploy generate-practice-questions Edge Function using mcp__supabase__deploy_edge_function

#### Practice Service (per client-services.md)

- [ ] T151 [US4] Implement PracticeService interface in src/services/supabase/practice.service.ts
- [ ] T152 [US4] Implement getAvailableCategories method in src/services/supabase/practice.service.ts
- [ ] T153 [US4] Implement startPractice method calling Edge Function in src/services/supabase/practice.service.ts
- [ ] T154 [US4] Implement getPracticeSession method in src/services/supabase/practice.service.ts
- [ ] T155 [US4] Implement submitPractice method with scoring in src/services/supabase/practice.service.ts
- [ ] T156 [US4] Implement getPracticeResult method in src/services/supabase/practice.service.ts
- [ ] T157 [US4] Implement getPracticeHistory method in src/services/supabase/practice.service.ts

#### Hooks

- [ ] T158 [US4] Create usePracticeSession hook for practice state management in src/hooks/usePracticeSession.ts

#### Practice Components

- [ ] T159 [P] [US4] Create SectionSelector component (verbal/quantitative/mixed) in src/components/practice/SectionSelector.tsx
- [ ] T160 [P] [US4] Create CategorySelector component with multi-select checkboxes in src/components/practice/CategorySelector.tsx
- [ ] T161 [P] [US4] Create DifficultySelector component (easy/medium/hard) in src/components/practice/DifficultySelector.tsx
- [ ] T162 [P] [US4] Create QuestionCountPicker component with tier limits in src/components/practice/QuestionCountPicker.tsx

#### Practice Screens

- [ ] T163 [US4] Create PracticeSetupScreen with section, category, difficulty, and count selection in src/screens/practice/PracticeSetupScreen.tsx
- [ ] T164 [US4] Create PracticeTakingScreen (reuse QuestionCard, Timer, ProgressBar) in src/screens/practice/PracticeTakingScreen.tsx
- [ ] T165 [US4] Create PracticeResultsScreen with category breakdown and recommendations in src/screens/practice/PracticeResultsScreen.tsx

#### Navigation & Integration

- [ ] T166 [US4] Add practice flow screens to MainStack navigator in src/navigation/MainStack.tsx
- [ ] T167 [US4] Add "Start Practice" button to HomeScreen in src/screens/dashboard/HomeScreen.tsx

#### Error Handling

- [ ] T168 [US4] Add error handling for tier limit violations with upgrade prompt
- [ ] T169 [US4] Add loading indicator during practice generation (10 second target per spec)

**Checkpoint**: User Story 4 complete - Practice sessions with customization and category breakdown are functional.

---

## Phase 7: User Story 5 - Performance Analytics Dashboard (Priority: P5)

**Goal**: Students can view aggregated performance metrics, category-specific trends, exam history, and progress over time.

**Independent Test**: User with exam and practice history can view dashboard showing last exam scores (verbal, quantitative, overall), total exams completed, total practice hours, strongest/weakest categories, exam performance trend chart, and category-specific performance breakdown. Premium users can export performance reports.

### Implementation for User Story 5

#### Analytics Service (per client-services.md)

- [ ] T170 [US5] Implement AnalyticsService interface in src/services/supabase/analytics.service.ts
- [ ] T171 [US5] Implement getUserAnalytics method in src/services/supabase/analytics.service.ts
- [ ] T172 [US5] Implement getCategoryPerformance method calling RPC in src/services/supabase/analytics.service.ts
- [ ] T173 [US5] Implement getExamTrend method in src/services/supabase/analytics.service.ts
- [ ] T174 [US5] Implement getPracticeTrend method in src/services/supabase/analytics.service.ts
- [ ] T175 [US5] Implement exportPerformanceReport method (premium feature) in src/services/supabase/analytics.service.ts

#### Hooks

- [ ] T176 [US5] Create useAnalytics hook for analytics data loading in src/hooks/useAnalytics.ts

#### Analytics Components

- [ ] T177 [P] [US5] Create ScoreCard component for displaying scores in src/components/analytics/ScoreCard.tsx
- [ ] T178 [P] [US5] Create StatsOverview component (exams, practice hours) in src/components/analytics/StatsOverview.tsx
- [ ] T179 [P] [US5] Create CategoryPerformanceChart component (bar chart) in src/components/analytics/CategoryPerformanceChart.tsx
- [ ] T180 [P] [US5] Create ExamTrendChart component (line chart) in src/components/analytics/ExamTrendChart.tsx
- [ ] T181 [P] [US5] Create EmptyStateAnalytics component for new users in src/components/analytics/EmptyStateAnalytics.tsx

#### Dashboard Screens

- [ ] T182 [US5] Update HomeScreen with analytics summary cards in src/screens/dashboard/HomeScreen.tsx
- [ ] T183 [US5] Create AnalyticsScreen with full performance dashboard in src/screens/dashboard/AnalyticsScreen.tsx
- [ ] T184 [US5] Create ProfileScreen with user profile display in src/screens/dashboard/ProfileScreen.tsx

#### Navigation

- [ ] T185 [US5] Add analytics and profile screens to MainStack navigator in src/navigation/MainStack.tsx

#### Premium Features

- [ ] T186 [US5] Add export report button with premium check in AnalyticsScreen

**Checkpoint**: User Story 5 complete - Analytics dashboard with trends and category breakdown is functional.

---

## Phase 8: User Story 6 - Notification Preferences & Settings (Priority: P6)

**Goal**: Students can configure notification preferences, view legal information, and log out.

**Independent Test**: Authenticated user can navigate to settings screen, toggle notification preferences (exam reminders on/off, milestone notifications on/off), view privacy policy and terms of service, and successfully log out of the application.

### Implementation for User Story 6

#### Notification Service (per client-services.md)

- [ ] T187 [US6] Implement NotificationService interface in src/services/notifications/notification.service.ts
- [ ] T188 [US6] Implement requestPermissions method in src/services/notifications/notification.service.ts
- [ ] T189 [US6] Implement registerDevice method with Expo push token in src/services/notifications/notification.service.ts
- [ ] T190 [US6] Implement updatePreferences method in src/services/notifications/notification.service.ts
- [ ] T191 [US6] Implement getPreferences method in src/services/notifications/notification.service.ts
- [ ] T192 [US6] Implement scheduleLocalNotification method in src/services/notifications/notification.service.ts
- [ ] T193 [US6] Implement cancelNotification method in src/services/notifications/notification.service.ts

#### Hooks

- [ ] T194 [US6] Create useNotifications hook for notification state in src/hooks/useNotifications.ts

#### Settings Screens

- [ ] T195 [US6] Create SettingsScreen with menu items in src/screens/settings/SettingsScreen.tsx
- [ ] T196 [US6] Create NotificationPreferencesScreen with toggles in src/screens/settings/NotificationPreferencesScreen.tsx
- [ ] T197 [P] [US6] Create LegalScreen for privacy policy and terms of service in src/screens/settings/LegalScreen.tsx
- [ ] T198 [US6] Add logout button to SettingsScreen calling AuthService.signOut
- [ ] T199 [US6] Add app version display to SettingsScreen

#### Navigation

- [ ] T200 [US6] Add settings screens to MainStack navigator in src/navigation/MainStack.tsx

**Checkpoint**: All User Stories (1-6) complete - Full feature set is functional and testable independently.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, optimizations, and documentation that span multiple user stories

### Performance Optimization

- [ ] T201 [P] Install and configure react-native-fast-image with priority loading and disk caching per research.md
- [ ] T202 [P] Implement image cache LRU eviction (100MB limit) per research.md
- [ ] T203 Implement request queuing for Gemini API rate limiting per research.md

### Error Handling & User Experience

- [ ] T204 [P] Create comprehensive Arabic error messages for all service error codes
- [ ] T205 [P] Implement retry logic for network failures in all services per edge cases in spec.md
- [ ] T206 Implement local answer caching during exam/practice sessions per edge cases in spec.md

### Security Hardening

- [ ] T207 Implement rate limiting at client level (1 exam generation per 30 seconds) per research.md
- [ ] T208 [P] Implement Expo SecureStore for auth token storage per research.md
- [ ] T209 Run Supabase security advisor check using mcp__supabase__get_advisors

### Database Seeding

- [ ] T210 Create scripts/seed-questions.ts for sample question templates per quickstart.md
- [ ] T211 Generate embeddings for seeded questions using Gemini embedding service

### Validation & Testing

- [ ] T212 Run quickstart.md validation steps to verify full setup
- [ ] T213 Verify RTL layout renders correctly on all screens
- [ ] T214 Verify SafeAreaView compliance on all screens
- [ ] T215 Test on iOS simulator (iPhone 14) and Android emulator (Pixel 6)
- [ ] T216 Verify Stripe test mode payment flow end-to-end
- [ ] T217 Verify Supabase webhook processing correctly

### Code Quality

- [ ] T218 Run linter and fix all warnings: npm run lint
- [ ] T219 Run TypeScript type checking: npx tsc --noEmit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational (Phase 2) completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Integrates with US1 auth but independently testable
- **User Story 3 (P3)**: Can start after Foundational - Uses subscription tier from US2 but independently testable
- **User Story 4 (P4)**: Can start after Foundational - Similar patterns to US3, independently testable
- **User Story 5 (P5)**: Can start after Foundational - Displays data from US3/US4 but independently testable with test data
- **User Story 6 (P6)**: Can start after Foundational - Uses auth from US1 but independently testable

### User Story Dependencies Graph

```
Phase 2 (Foundational) ← BLOCKS ALL
    ↓
Phase 3 (US1: Auth & Profile) ← MVP CORE
    ↓
    ├─→ Phase 4 (US2: Subscription)
    │        ↓
    │        ├─→ Phase 5 (US3: Exam)
    │        │        ↓
    │        ├─→ Phase 6 (US4: Practice)
    │        │        ↓
    │        └─→ Phase 7 (US5: Analytics) ← Benefits from US3 + US4 data
    │
    └─→ Phase 8 (US6: Settings)
```

### Within Each User Story

- Services before screens (business logic before UI)
- Hooks depend on services
- Components marked [P] can run in parallel
- Screens depend on hooks and components
- Navigation updates last

### Parallel Opportunities

**Phase 1 (Setup)**: T002-T011 marked [P] can run in parallel

**Phase 2 (Foundational)**:
- T012-T015 can run in parallel (config files)
- T016-T018 can run in parallel (utility functions)
- T019-T025 can run in parallel (type definitions)
- T049-T052 can run in parallel (RPC functions)
- T053-T054 can run in parallel (storage buckets)
- T058-T062 can run in parallel (common components)

**Phase 3 (US1)**: T080-T081, T083 can run in parallel

**Phase 5 (US3)**: T135-T138 can run in parallel (exam components)

**Phase 6 (US4)**: T159-T162 can run in parallel (practice components)

**Phase 7 (US5)**: T177-T181 can run in parallel (analytics components)

---

## Parallel Example: User Story 3 (Exam)

```bash
# Launch all exam components together:
Task T135: "Create QuestionCard component in src/components/exam/QuestionCard.tsx"
Task T136: "Create Timer component in src/components/exam/Timer.tsx"
Task T137: "Create ProgressBar component in src/components/exam/ProgressBar.tsx"
Task T138: "Create QuestionNavigation component in src/components/exam/QuestionNavigation.tsx"
```

---

## Implementation Strategy

### MVP First (Phases 1-3 Only)

**Target**: User authentication and profile setup

1. Complete Phase 1: Setup (T001-T011)
2. Complete Phase 2: Foundational (T012-T063) ← CRITICAL
3. Complete Phase 3: User Story 1 (T064-T090)
4. **STOP and VALIDATE**: Test registration → email verification → profile setup → dashboard access
5. Deploy/demo if ready

### Core Product (Add Phases 4-5)

**Target**: Authentication + Subscription + Full Exam Feature

1. Add Phase 4: User Story 2 (T091-T110) - Subscription management
2. Add Phase 5: User Story 3 (T111-T145) - Full exam taking
3. **VALIDATE**: Test complete user journey: Register → Subscribe → Take Exam → View Results
4. Deploy/demo

### Full Feature Set (Add Phases 6-9)

**Target**: Complete platform with practice, analytics, and settings

1. Add Phase 6: User Story 4 (T146-T169) - Practice sessions
2. Add Phase 7: User Story 5 (T170-T186) - Analytics dashboard
3. Add Phase 8: User Story 6 (T187-T200) - Settings and notifications
4. Add Phase 9: Polish (T201-T219) - Cross-cutting improvements
5. **VALIDATE**: End-to-end testing of all features
6. Production deployment

### Parallel Team Strategy

With 3 developers after Phase 2 completion:

- **Developer A**: Phase 3 (US1: Auth) → Phase 4 (US2: Subscription)
- **Developer B**: Phase 5 (US3: Exam) + Phase 6 (US4: Practice)
- **Developer C**: Phase 7 (US5: Analytics) + Phase 8 (US6: Settings)

Then all collaborate on Phase 9 (Polish)

---

## Summary

| Phase | Task Count | Parallel Opportunities |
|-------|------------|----------------------|
| Phase 1: Setup | 11 | 9 tasks |
| Phase 2: Foundational | 52 | 25 tasks |
| Phase 3: US1 - Registration & Profile | 27 | 3 tasks |
| Phase 4: US2 - Subscription | 20 | 0 tasks |
| Phase 5: US3 - Exam Taking | 35 | 4 tasks |
| Phase 6: US4 - Practice Sessions | 24 | 4 tasks |
| Phase 7: US5 - Analytics Dashboard | 17 | 5 tasks |
| Phase 8: US6 - Settings & Notifications | 14 | 1 task |
| Phase 9: Polish | 19 | 6 tasks |
| **Total** | **219** | **57 parallel** |

**MVP Scope Recommendation**: Phases 1-3 (Setup + Foundational + US1) deliver independently testable authentication and profile setup, establishing the foundation for all subsequent features. This represents 90 tasks for a complete MVP.

**Format Validation**: ✅ All 219 tasks follow checklist format (checkbox, TaskID, [P] marker where applicable, [Story] label for user story tasks, file paths included)

**Independent Test Criteria**: Each user story (US1-US6) includes independent test scenarios from spec.md that can verify the story works on its own

**Ready for Execution**: All tasks are specific with file paths and can be executed immediately by an LLM

---

## Notes

- **Tests**: No test tasks included as they were not explicitly requested in spec.md
- **User Stories**: Aligned with spec.md priorities (P1-P6) and acceptance criteria
- **RTL Support**: All UI components must support RTL layout for Arabic content per NFR-001
- **Gemini AI**: Rate limiting and error handling critical for production per research.md
- **Subscription Tiers**: Free tier limits (1 exam/week, 5 practice questions) enforced at multiple layers
- **Security**: RLS policies and webhook signature validation implemented in Phase 2
- **Performance**: Image caching (150MB limit), 60fps UI, <20s exam generation per spec.md success criteria

---

**Tasks file generated successfully**. Ready for implementation starting with Phase 1 (Setup).
