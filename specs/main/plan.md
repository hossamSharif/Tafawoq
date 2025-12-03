# Implementation Plan: Tafawoq - Saudi Aptitude Exam Preparation Platform

**Branch**: `main` | **Date**: 2025-12-03 | **Spec**: [specs/main/spec.md](./spec.md)
**Input**: Feature specification from user-provided project brief with comprehensive user stories (US1-US6) and 61 functional/non-functional requirements

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Tafawoq is a comprehensive React Native mobile application for Arabic-speaking students preparing for Saudi aptitude exams (القدرات). The platform provides AI-generated full integrated exams (40 questions) and customized practice sessions with subscription-based access control, real-time performance analytics, and personalized learning insights. The technical approach leverages Gemini AI for question generation, Supabase for data persistence and vector-based semantic search, Stripe for subscription management, and React Native Paper for RTL-compliant Arabic UI. The specification defines 6 prioritized user stories (P1-P6) from authentication through exam taking, practice sessions, analytics, and settings management.

## Technical Context

**Language/Version**: JavaScript/TypeScript with React Native (Expo SDK 51+), Node.js 18+ for any tooling scripts
**Primary Dependencies**:
- React Native (Expo managed workflow)
- React Native Paper (Material Design UI components with RTL support)
- Supabase Client SDK (@supabase/supabase-js)
- Stripe React Native SDK (@stripe/stripe-react-native)
- Google Generative AI SDK (@google/generative-ai) for Gemini integration
- React Navigation for routing
- Expo Vector Icons
- Google Font "Noto Kufi Arabic" (loaded via expo-font)
- react-native-fast-image for optimized image caching

**Storage**:
- Supabase PostgreSQL for relational data (users, subscriptions, exam/practice sessions, results)
- Supabase pgvector extension for semantic embeddings and vector search
- Supabase Storage for user-generated content (profile pictures, exported reports)
- Stripe for payment method persistence and subscription status

**Testing**: Jest + React Native Testing Library for unit/component tests, Detox for E2E testing on critical paths (registration flow, subscription upgrade, exam taking flow)

**Target Platform**: iOS 13+ and Android 8.0+ (cross-platform mobile via Expo)

**Project Type**: Mobile application (single React Native codebase targeting iOS and Android)

**Performance Goals**:
- Initial app load < 3 seconds on mid-range devices (SC-001, SC-003 reference)
- AI exam generation < 20 seconds for 40-question exam (SC-002 reference)
- Semantic vector search < 500ms per query (SC-014 reference)
- UI rendering 60 fps on supported devices (SC-012 reference)
- Image lazy loading with progressive enhancement

**Constraints**:
- Strict RTL (Right-to-Left) layout for all Arabic content (NFR-001, SC-015 reference)
- Gemini API rate limits: 1,000 RPM paid tier, 4M TPM (resolved in research.md)
- Mobile memory constraints for image-heavy questions (< 150MB active memory target per SC-013)
- Offline capability not required (online-only app per spec assumptions)
- SafeAreaView compliance for all screens (iOS notch/Android navigation per NFR-014)

**Scale/Scope**:
- Initial launch: 500-5,000 active users
- Database: ~20 tables, 8 core entities, 5-10 vector embedding collections
- UI: ~25-30 screens including onboarding, exam flows, analytics, settings
- AI operations: 100-1,000 exam generations per day during peak periods
- Storage: ~500MB-2GB user data within first year

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Architectural Principles Assessment

✅ **§I. Ref MCP Mandate (Documentation & Reference)**: All documentation and API reference lookups will use `mcp__Ref__ref_search_documentation` and `mcp__Ref__ref_read_url` tools exclusively for React Native, Expo, Supabase, Stripe, and Gemini documentation.

✅ **§II. Supabase MCP Mandate (Database & Backend)**: All database operations (schema listing, migrations, type generation, edge functions, logs, advisors) will use Supabase MCP tool suite exclusively:
- `mcp__supabase__list_tables`, `mcp__supabase__apply_migration`, `mcp__supabase__list_migrations` for schema management
- `mcp__supabase__generate_typescript_types` for codegen
- `mcp__supabase__deploy_edge_function`, `mcp__supabase__list_edge_functions` for serverless functions
- `mcp__supabase__execute_sql` for queries (migrations use apply_migration)
- `mcp__supabase__get_logs`, `mcp__supabase__get_advisors` for monitoring

✅ **§III. Stripe MCP Mandate (Payments)**: All payment, subscription, and billing operations will use Stripe MCP tool suite exclusively:
- `mcp__stripe-agent-toolkit__create_customer`, `mcp__stripe-agent-toolkit__list_customers` for customer management
- `mcp__stripe-agent-toolkit__create_product`, `mcp__stripe-agent-toolkit__create_price` for subscription products
- `mcp__stripe-agent-toolkit__create_payment_link` for checkout flows
- `mcp__stripe-agent-toolkit__list_subscriptions`, `mcp__stripe-agent-toolkit__update_subscription`, `mcp__stripe-agent-toolkit__cancel_subscription` for subscription lifecycle
- `mcp__stripe-agent-toolkit__list_invoices`, `mcp__stripe-agent-toolkit__create_invoice` for billing

✅ **§IV. Security & Configuration**:
- Environment variables for all secrets: SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_PUBLISHABLE_KEY, GEMINI_API_KEY (per spec assumption and research.md security section)
- .env.example created with required variables and validation rules
- Expo SecureStore for runtime auth tokens (iOS Keychain, Android Keystore per research.md)
- Logging excludes sensitive PII (passwords, tokens, payment cards, email content)
- All Supabase tables have RLS policies defined in data-model.md

✅ **§V. Technology Stack Alignment**:
- Primary: JavaScript/TypeScript with React Native (Expo SDK 51+) ✅
- Backend tooling: Node.js 18+ for scripts ✅
- Project structure: src/ for source, tests/ for test suites ✅ (defined below)
- Code style: Standard TypeScript/React Native conventions ✅
- Quality gates: npm test, npm run lint ✅ (Jest, ESLint configured)

**Gate Status**: ✅ PASSED - All constitution principles align with technical approach

### Potential Concerns (Resolved in Research)

✅ **Testing Strategy**: Three-tier approach defined in research.md - Jest unit tests (70% coverage), RNTL component tests (60% coverage), Detox E2E for critical paths only (3 flows)

✅ **API Rate Limiting**: Gemini API quotas researched - 1,000 RPM paid tier, 4M TPM. Mitigation: request queuing, caching, usage alerts at 80%, graceful degradation

✅ **Error Handling**: Comprehensive edge cases defined in spec.md (12 scenarios). Strategy: user-friendly Arabic error messages, retry options, server-side validation, session integrity checks

✅ **Security**: Multi-layered approach in research.md - Supabase RLS policies, API key management via env vars, rate limiting (client + server), webhook signature validation (HMAC SHA-256)

### Complexity Justifications

| Decision | Justification | Alternative Rejected |
|----------|--------------|---------------------|
| Multiple external services (Supabase, Stripe, Gemini) | Each provides specialized functionality not feasible to build in-house (vector search, PCI-compliant payments, Arabic AI generation) | Custom backend would require 6+ months additional development and ongoing maintenance for features that are commoditized |
| Vector database (pgvector) | Semantic search for AI context retrieval is core feature requirement (FR-054 for practice, exam generation logic) | Traditional text search insufficient for question relevance matching and category-specific generation |
| Expo managed workflow | Simplifies native module integration (Stripe SDK, push notifications) and OTA updates without manual native configuration | Bare React Native would require manual iOS/Android native configuration maintenance and complicate deployment |
| React Native Paper | Provides RTL-compliant Material Design components out-of-the-box, reducing custom RTL layout implementation burden | Custom UI components would require extensive RTL testing and maintenance across all screens |

**Gate Status**: ✅ PASSED - All complexity justified by feature requirements

### Post-Phase 1 Re-evaluation

**Date**: 2025-12-03 (After design completion and spec.md creation)

✅ **Architecture Validation**: Data model follows normalized database design with clear separation of concerns (8 core entities, proper foreign keys, computed columns)

✅ **Service Layer Design**: Client services properly abstract Supabase/Stripe/Gemini integrations with typed interfaces (contracts/ directory defines API contracts)

✅ **Security Implementation**: RLS policies defined for all tables in data-model.md, webhook signature validation specified in research.md Stripe section

✅ **Testing Strategy**: Clear testing approach defined - Jest unit tests, RNTL component tests, Detox E2E for critical paths (research.md testing section)

✅ **Performance Considerations**: Vector indexing (HNSW), image caching (react-native-fast-image), rate limiting strategies documented in research.md

✅ **Documentation Quality**: Comprehensive contracts/ (client-services.md, gemini-ai.md, supabase-rpc.md) and quickstart.md provide clear implementation roadmap

✅ **Spec Alignment**: All 6 user stories (US1-US6) from spec.md map to data entities in data-model.md and API contracts in contracts/. 61 functional/non-functional requirements covered by design artifacts.

**Updated Gate Status**: ✅ PASSED - Design artifacts complete, architecturally sound, and fully aligned with spec.md

No new complexity concerns identified during design phase or spec creation. All research clarifications successfully resolved (research.md). Spec defines clear success criteria (SC-001 to SC-024) with measurable outcomes.

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── spec.md              # Feature specification with user stories US1-US6 (NEW)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (technical decisions, 8 research topics)
├── data-model.md        # Phase 1 output (8 core entities, RLS policies)
├── quickstart.md        # Phase 1 output (setup guide, testing scenarios)
├── contracts/           # Phase 1 output (API contracts)
│   ├── client-services.md    # Supabase client service contracts
│   ├── gemini-ai.md          # Gemini AI integration contracts
│   └── supabase-rpc.md       # RPC function contracts
├── checklists/          # Specification quality validation
│   └── requirements.md  # Spec validation checklist (12/12 passed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - 220 tasks)
```

### Source Code (repository root)

```text
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Button, Card, Input, LoadingSpinner, ErrorMessage)
│   ├── exam/            # Exam-specific components (QuestionCard, Timer, ProgressBar)
│   ├── practice/        # Practice session components (CategorySelector, DifficultySelector, QuestionCountPicker)
│   └── analytics/       # Performance visualization components (ScoreCard, CategoryPerformanceChart, ExamTrendChart)
│
├── screens/             # Screen-level components (navigation targets)
│   ├── auth/           # Login, Register, EmailVerification (US1)
│   ├── onboarding/     # Welcome, Tutorial, ProfileSetup (US1)
│   ├── exam/           # ExamSetup, ExamTaking, ExamResults (US3)
│   ├── practice/       # PracticeSetup, PracticeTaking, PracticeResults (US4)
│   ├── dashboard/      # Home, Analytics, Profile (US5)
│   └── settings/       # Settings, Subscription, Legal, NotificationPreferences (US2, US6)
│
├── services/           # Business logic and external integrations
│   ├── supabase/       # Database client, auth, storage (AuthService, ProfileService, ExamService, PracticeService, AnalyticsService)
│   ├── stripe/         # Payment processing, subscription management (SubscriptionService)
│   ├── gemini/         # AI generation (questions, images, embeddings) - abstraction over Edge Functions
│   └── notifications/  # Push notification handlers (NotificationService)
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts           # Authentication state (US1)
│   ├── useProfile.ts        # Profile loading/updates (US1)
│   ├── useSubscription.ts   # Subscription state/upgrade (US2)
│   ├── useExamSession.ts    # Exam state management (US3)
│   ├── usePracticeSession.ts # Practice state management (US4)
│   ├── useAnalytics.ts      # Analytics data loading (US5)
│   └── useNotifications.ts  # Notification state (US6)
│
├── types/              # TypeScript type definitions
│   ├── common.types.ts      # Section, Difficulty, AcademicTrack
│   ├── user.types.ts        # User, Profile, Session
│   ├── subscription.types.ts # Subscription, SubscriptionTier, SubscriptionStatus
│   ├── exam.types.ts        # ExamSession, ExamResult, Question, QuestionAnswer
│   ├── practice.types.ts    # PracticeSession, PracticeResult, PracticeConfig
│   ├── analytics.types.ts   # UserAnalytics, CategoryPerformance
│   └── api.types.ts         # ServiceError, ApiResponse
│
├── navigation/         # React Navigation configuration
│   ├── types.ts            # AuthStackParamList, MainStackParamList
│   ├── AppNavigator.tsx    # Root navigator with auth state switching
│   ├── AuthStack.tsx       # Authentication flow navigation (US1)
│   └── MainStack.tsx       # Main app navigation (US2-US6)
│
├── contexts/           # React Context providers
│   └── ServicesContext.tsx # Dependency injection for services
│
├── config/            # App configuration
│   ├── supabase.config.ts   # Supabase client initialization
│   ├── stripe.config.ts     # Stripe SDK configuration
│   ├── gemini.config.ts     # Gemini API configuration (Edge Function URLs)
│   └── theme.config.ts      # React Native Paper theme with RTL support
│
├── utils/             # Utility functions
│   ├── rtl.utils.ts         # RTL layout helpers (NFR-001 compliance)
│   ├── validation.utils.ts  # Input validation helpers
│   ├── analytics.utils.ts   # Analytics tracking helpers
│   └── network.utils.ts     # Offline detection, network error handling
│
└── assets/            # Static assets
    ├── fonts/         # Noto Kufi Arabic (loaded via expo-font)
    ├── images/        # Static images (logos, placeholders)
    └── design/        # Reference design files (screen.html, screen.png)

__tests__/
├── unit/              # Unit tests for services and utils (Jest)
│   ├── services/      # AuthService, ExamService, SubscriptionService tests
│   └── utils/         # Utility function tests
├── component/         # Component tests (React Native Testing Library)
│   ├── common/        # Common component tests
│   ├── exam/          # Exam component tests (QuestionCard, Timer)
│   └── screens/       # Screen integration tests
└── e2e/              # End-to-end tests (Detox - critical paths only)
    ├── auth.e2e.ts    # Registration → Email verification → Profile setup
    ├── subscription.e2e.ts # Free tier → Payment → Premium unlock
    └── exam.e2e.ts    # Exam eligibility → Generation → Taking → Results

supabase/              # Supabase Edge Functions (server-side)
├── functions/
│   ├── stripe-webhook-handler/
│   │   └── index.ts   # Stripe webhook processing (US2)
│   ├── generate-exam-questions/
│   │   └── index.ts   # Exam generation with Gemini + vector search (US3)
│   └── generate-practice-questions/
│       └── index.ts   # Practice generation with Gemini (US4)
└── migrations/        # Database migrations (SQL files)

scripts/               # Utility scripts (Node.js 18+)
├── validate-env.js    # Environment variable validation (from quickstart.md)
└── seed-questions.ts  # Database seeding with sample questions

App.tsx                # Root component with providers (RTL init, navigation, theme)
app.json              # Expo configuration (RTL support, fonts, SafeAreaView)
package.json          # Dependencies and scripts (test, lint)
tsconfig.json         # TypeScript strict mode configuration
.eslintrc.js          # ESLint + Prettier configuration
.detoxrc.json         # Detox E2E test configuration
jest.config.js        # Jest configuration
.env.example          # Environment variable template
.gitignore            # Excludes .env, node_modules, build artifacts
```

**Structure Decision**: React Native mobile project using Expo managed workflow. Feature-based organization with clear separation between UI (components/screens), business logic (services), and shared utilities. Supabase Edge Functions in separate `supabase/` directory for server-side AI generation and webhook handling. Design reference files organized under `assets/design/` hierarchy matching screen names for visual implementation guidance. All 6 user stories (US1-US6) from spec.md map to specific directories and files in the structure above.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles (§I-§V) pass validation. See Constitution Check section above for detailed compliance assessment.

---

## Phase 0: Research & Technical Decisions

**Status**: ✅ COMPLETE
**Artifact**: [research.md](./research.md)

### Research Topics Resolved

All "NEEDS CLARIFICATION" items from initial Technical Context have been researched and resolved:

1. **Gemini API Rate Limits & Quotas** ✅
   - Decision: Gemini 1.5 Flash paid tier (1,000 RPM, 4M TPM)
   - Mitigation: Request queuing, caching, usage alerts, graceful degradation
   - Cost: $0.075 per 1M tokens

2. **Testing Strategy Depth** ✅
   - Decision: Three-tier approach - Jest (70% services), RNTL (60% components), Detox (3 critical paths)
   - Critical paths: Registration flow, Subscription upgrade, Exam taking flow
   - Rationale: Balance coverage with maintenance cost

3. **TypeScript Strict Mode Enforcement** ✅
   - Decision: Enable strict mode with progressive ESLint rules
   - Configuration: strictNullChecks, noImplicitAny, esModuleInterop
   - Rationale: Type safety for Supabase/Stripe SDK responses

4. **React Native Paper RTL Best Practices** ✅
   - Decision: Use I18nManager.forceRTL(true) with React Native Paper built-in RTL support
   - Implementation: paddingStart/marginEnd for automatic RTL conversion
   - Testing: Visual regression tests + manual QA checklist

5. **Supabase pgvector Setup & Optimization** ✅
   - Decision: 768-dimensional embeddings with HNSW index (<500ms queries)
   - Schema: Separate question_embeddings table with vector column
   - Optimization: Pre-compute 1,000+ sample questions, batch embed off-peak

6. **Stripe Subscription Handling in React Native** ✅
   - Decision: Stripe Payment Sheet + Supabase Edge Function webhook handler
   - Architecture: Mobile → Payment Sheet → Webhook → Edge Function → DB
   - Events: subscription.created/updated/deleted, invoice.payment_failed

7. **React Native Performance for Image-Heavy Apps** ✅
   - Decision: react-native-fast-image with progressive loading
   - Strategy: FlatList windowSize=5, lazy generation, WebP compression
   - Memory: 150MB target (50MB core, 100MB image cache with LRU eviction)

8. **Security Best Practices** ✅
   - Decision: Multi-layered - Supabase RLS, env var secrets, rate limiting, webhook signature validation
   - RLS: All tables with user_id policies, premium access helper function
   - Secrets: .env (git-ignored), Expo SecureStore for runtime tokens

### Technology Integration Summary

| Technology | Version/Tier | Purpose | Rate Limit/Quota |
|------------|--------------|---------|------------------|
| Gemini 1.5 Flash | Paid tier | Question generation | 1,000 RPM, 4M TPM |
| Gemini Embedding | Free tier | Semantic search embeddings | 1,500 RPM |
| Imagen 3 | Paid tier | Diagram/image generation | 100/day free, higher paid |
| Supabase | Pro tier | Database + auth + storage | 500K requests/month |
| Stripe | Standard | Subscription payments | No hard limits |
| React Native | 0.74+ | Mobile framework | N/A |
| React Native Paper | 5.x | UI component library | N/A |
| Expo | SDK 51 | Build and deployment | N/A |

---

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETE
**Artifacts**: [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

### Data Model Summary

**Entities Defined**: 8 core entities with complete schemas, validation rules, and RLS policies

1. **Authentication & User Management**
   - `users` (Supabase Auth managed) - Email, password, verification
   - `user_profiles` - Academic track (scientific/literary), profile picture, onboarding status
   - User Story Mapping: US1 (Registration & Profile Setup)

2. **Subscription & Access Control**
   - `user_subscriptions` - Tier (free/premium), status, Stripe IDs, billing periods
   - Tier Limits: Free (1 exam/week, 5 practice questions), Premium (unlimited)
   - User Story Mapping: US2 (Subscription Management)

3. **Exam & Practice Sessions**
   - `exam_sessions` - 40-question integrated exams, status, timing
   - `exam_results` - Verbal/quantitative scores, strengths/weaknesses, improvement advice
   - `practice_sessions` - Customized practice (section, categories, difficulty, count)
   - `practice_results` - Overall score, category breakdown, recommendations
   - User Story Mapping: US3 (Exam Taking), US4 (Practice Sessions)

4. **Question Content**
   - `question_templates` - Pre-generated questions (section, category, difficulty, Arabic text, options, explanations)
   - `question_embeddings` - 768-dim vectors for semantic search (HNSW index)
   - Categories: Quantitative (basic_operations, geometry, roots_exponents), Verbal (analogies, sentence_completion, contextual_error, odd_word_out, reading_comprehension)

5. **Analytics & Notifications**
   - `user_analytics` - Aggregated metrics (last exam scores, totals, strongest/weakest categories)
   - `notification_preferences` - Push token, exam reminders, milestone notifications
   - User Story Mapping: US5 (Analytics Dashboard), US6 (Settings)

**RLS Policies**: All tables have Row Level Security enabled with `auth.uid()` checks. Helper function `has_premium_access()` for tier-based access control.

**Triggers**: `update_user_analytics_trigger` automatically updates analytics on exam/practice completion.

**Validation Rules**: Check constraints for enums, score ranges (0-100), tier limits, foreign key integrity.

### API Contracts

**Contract Files**:
1. **client-services.md** - Client-side service interfaces (AuthService, ProfileService, SubscriptionService, ExamService, PracticeService, AnalyticsService, NotificationService)
2. **gemini-ai.md** - AI generation contracts (question generation, image generation, embedding generation)
3. **supabase-rpc.md** - Database RPC function contracts (check_exam_eligibility, calculate_practice_hours, get_category_performance, search_similar_questions)

**Edge Functions** (Supabase Functions):
- `stripe-webhook-handler` - Processes Stripe webhooks (subscription lifecycle, payment failures)
- `generate-exam-questions` - Creates 40-question exams with Gemini + vector search
- `generate-practice-questions` - Creates customized practice questions with category filtering

### Quickstart Guide

**quickstart.md** provides:
- Environment setup (Node.js 18+, Expo CLI, Supabase CLI, Stripe CLI)
- Dependency installation (npm install)
- Environment variable configuration (.env setup)
- Database schema initialization (Supabase migrations)
- Edge Function deployment (Supabase CLI)
- Stripe webhook configuration (local testing with Stripe CLI)
- Testing scenarios (9 sections covering auth, subscription, exam generation, practice, analytics)
- Development server launch (expo start)
- Troubleshooting guide (common errors, solutions)

### Agent Context Update

**Status**: PENDING (to be executed after plan validation)
**Command**: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`
**Purpose**: Update CLAUDE.md with React Native + Expo SDK 51+ technology stack (if not already present)

---

## Validation & Next Steps

### Spec Alignment Validation

✅ **User Story Coverage**: All 6 user stories (US1-US6) from spec.md have corresponding:
- Data entities in data-model.md (8 core entities cover all 6 stories)
- API contracts in contracts/ (7 client services map to user stories)
- Edge Functions for AI generation (US3, US4)
- Webhook handlers for subscription sync (US2)

✅ **Functional Requirements Coverage**: All 47 FR requirements from spec.md are addressed:
- FR-001 to FR-006 (Auth) → AuthService, user_profiles table
- FR-007 to FR-012 (Subscription) → SubscriptionService, user_subscriptions table, Stripe integration
- FR-013 to FR-027 (Exam) → ExamService, exam_sessions/results tables, generate-exam-questions Edge Function
- FR-028 to FR-035 (Practice) → PracticeService, practice_sessions/results tables, generate-practice-questions Edge Function
- FR-036 to FR-042 (Analytics) → AnalyticsService, user_analytics table with triggers
- FR-043 to FR-047 (Notifications/Settings) → NotificationService, notification_preferences table

✅ **Non-Functional Requirements Coverage**: All 14 NFR requirements from spec.md are addressed:
- NFR-001 (RTL) → React Native Paper + I18nManager, research.md section 4
- NFR-002 to NFR-006 (Performance) → Performance optimization research (section 7), memory budgets, caching strategies
- NFR-007 to NFR-010 (Security) → RLS policies, secure storage, webhook validation (research.md section 8)
- NFR-011 to NFR-013 (Reliability) → Rate limiting, error handling, caching (research.md sections 1, 8)
- NFR-014 (SafeAreaView) → Expo configuration in app.json

✅ **Success Criteria Traceability**: All 24 SC metrics from spec.md have implementation paths:
- SC-001, SC-003 (Load times) → Expo optimization, react-native-fast-image
- SC-002 (Exam generation) → Gemini rate limits researched, 1,000 RPM paid tier
- SC-004 to SC-011 (User flows) → Complete service layer + UI structure defined
- SC-012 to SC-015 (Performance/RTL) → Research sections 4, 7 provide technical approach
- SC-016 to SC-019 (Security/Scale) → Research section 8, RLS policies, rate limiting
- SC-020 to SC-024 (UX/Learning) → Complete user journey defined across 6 stories

### Constitution Re-Validation Post-Design

✅ **§I. Ref MCP Mandate**: Documentation lookup strategy confirmed - all React Native, Expo, Supabase, Stripe, Gemini docs will use MCP tools

✅ **§II. Supabase MCP Mandate**: All database operations mapped to MCP tools:
- Schema creation → `mcp__supabase__apply_migration`
- Type generation → `mcp__supabase__generate_typescript_types`
- Edge Functions → `mcp__supabase__deploy_edge_function`
- Monitoring → `mcp__supabase__get_logs`, `mcp__supabase__get_advisors`

✅ **§III. Stripe MCP Mandate**: All payment operations mapped to MCP tools:
- Customer creation → `mcp__stripe-agent-toolkit__create_customer`
- Subscription lifecycle → `mcp__stripe-agent-toolkit__list_subscriptions`, `update_subscription`, `cancel_subscription`
- Checkout → `mcp__stripe-agent-toolkit__create_payment_link`

✅ **§IV. Security & Configuration**: .env.example defined with all secrets, Expo SecureStore for tokens, RLS policies on all tables

✅ **§V. Technology Stack Alignment**: React Native + Expo SDK 51+, Node.js 18+, TypeScript strict mode, Jest/ESLint configured

**Final Gate Status**: ✅ PASSED - All design artifacts align with constitution and spec.md

### Ready for Tasks Generation

**Recommendation**: Proceed with `/speckit.tasks` to generate implementation tasks

**Expected Task Structure**:
- Phase 1: Setup (project initialization, dependencies)
- Phase 2: Foundational (config, types, service layer, navigation, database setup, RLS policies, Edge Functions)
- Phase 3: US1 Implementation (Authentication & Profile Setup) 🎯 MVP
- Phase 4: US2 Implementation (Subscription Management)
- Phase 5: US3 Implementation (Exam Taking)
- Phase 6: US4 Implementation (Practice Sessions)
- Phase 7: US5 Implementation (Analytics Dashboard)
- Phase 8: US6 Implementation (Settings & Notifications)
- Phase 9: Polish & Cross-Cutting Concerns (testing, optimization, documentation)

**MVP Scope Recommendation**: Phases 1-3 (Setup + Foundational + US1) deliver independently testable authentication and profile setup, establishing the foundation for all subsequent features.

---

**Plan Complete**: All phases (0-1) executed successfully. Spec.md created and validated (12/12 checklist items passed). Ready for `/speckit.tasks` command.
