# Feature Specification: Tafawoq - Saudi Aptitude Exam Preparation Platform

**Feature Branch**: `main`
**Created**: 2025-12-03
**Status**: Active
**Input**: Comprehensive mobile application for Arabic-speaking students preparing for Saudi aptitude exams (القدرات) with AI-generated practice content, subscription-based access control, and personalized performance analytics.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration & Profile Setup (Priority: P1) 🎯 MVP

Students need to create accounts and configure their academic profile before accessing any exam preparation features.

**Why this priority**: Foundation for all other features - without authentication and profile setup, no personalized content or progress tracking is possible. This is the entry point for all users.

**Independent Test**: New user can register with email/password, verify their email via OTP, select their academic track (scientific/literary), upload a profile picture, and successfully log into the application dashboard. This user story can be fully demonstrated without any exam or practice functionality being implemented.

**Acceptance Scenarios**:

1. **Given** a new student visits the app, **When** they enter valid email and password, **Then** an account is created and email verification OTP is sent
2. **Given** a user has received an OTP code, **When** they enter the correct code, **Then** their email is verified and they proceed to profile setup
3. **Given** a verified user is on profile setup screen, **When** they select academic track (scientific or literary) and optionally upload a profile picture, **Then** their profile is saved and they are directed to the main dashboard
4. **Given** a registered user returns to the app, **When** they enter correct credentials, **Then** they are authenticated and see their personalized dashboard
5. **Given** a user with incorrect credentials, **When** they attempt to log in, **Then** they receive a clear error message in Arabic

---

### User Story 2 - Subscription Management (Priority: P2)

Students need to understand their subscription tier (free vs premium) and upgrade to premium to unlock advanced features like unlimited exams and detailed performance analytics.

**Why this priority**: Enables the business model and unlocks premium features. Must come after authentication (P1) but before heavy feature usage since it gates access to advanced capabilities.

**Independent Test**: Authenticated user can view their current subscription status (free tier by default), initiate a premium subscription upgrade via payment interface, complete payment, and verify that premium features are immediately unlocked. Can also cancel subscription and revert to free tier. This story is independently testable without requiring exam generation or analytics features.

**Acceptance Scenarios**:

1. **Given** a free tier user on the subscription screen, **When** they view their subscription status, **Then** they see "Free Tier" with limitations (1 exam per week, 5 practice questions max)
2. **Given** a free tier user, **When** they initiate premium upgrade and complete payment, **Then** their account is upgraded to premium tier within 30 seconds
3. **Given** a premium user, **When** they access premium-only features, **Then** they have unlimited access without restrictions
4. **Given** a premium user, **When** they cancel their subscription, **Then** their account reverts to free tier at the end of the current billing period
5. **Given** a user attempting upgrade, **When** payment fails, **Then** they receive a clear error message in Arabic and remain on free tier

---

### User Story 3 - Full Integrated Exam Taking (Priority: P3)

Students need to take full-length integrated exams (40 questions covering verbal and quantitative sections) that simulate the real Saudi aptitude test experience, with timer, progress tracking, and detailed scoring results.

**Why this priority**: Core educational feature that delivers primary value. Requires both authentication (P1) and subscription tier checking (P2) to enforce exam limits. This is the main reason students use the platform.

**Independent Test**: Authenticated user (respecting tier limits) can check exam eligibility, start exam generation (receives 40 AI-generated questions), answer questions with timer running, navigate between questions, submit the completed exam, and view detailed results with section scores (verbal, quantitative), performance breakdown, and improvement recommendations. Premium users see solution explanations. This story can be fully tested independently of practice sessions or analytics.

**Acceptance Scenarios**:

1. **Given** a user meeting exam eligibility criteria, **When** they request a new full exam, **Then** 40 questions (20 verbal, 20 quantitative) are generated within 20 seconds
2. **Given** a user taking an exam, **When** they navigate through questions, **Then** they can move forward/backward, see progress indicator, and view remaining time
3. **Given** a user answers exam questions, **When** they select answers and submit the exam, **Then** their answers are scored and results are displayed with verbal score, quantitative score, and overall average
4. **Given** a free tier user, **When** they attempt to start a second exam within the same week, **Then** they are blocked with message explaining the 1-exam-per-week limit
5. **Given** a premium user viewing exam results, **When** they review incorrect answers, **Then** they see detailed solution explanations for each question
6. **Given** a user taking an exam, **When** time expires or they abandon the exam, **Then** the exam is marked as incomplete and does not count toward eligibility limits
7. **Given** a quantitative question requiring visual aids, **When** the question is displayed, **Then** a generated diagram or geometric figure is shown with the question text

---

### User Story 4 - Customized Practice Sessions (Priority: P4)

Students need to create targeted practice sessions by selecting specific sections (verbal/quantitative), categories (e.g., geometry, analogies), difficulty levels, and question counts to focus on weak areas.

**Why this priority**: Enables personalized learning but is secondary to the full exam experience (P3). Requires authentication (P1) and subscription tier (P2) to enforce question count limits. Complements the exam feature rather than replacing it.

**Independent Test**: Authenticated user can configure a practice session by selecting section (verbal/quantitative/mixed), specific categories (e.g., geometry, sentence completion), difficulty level (easy/medium/hard), and question count (5 max for free, 100 max for premium), then start the practice session, answer questions, and view results with category-specific performance breakdown. This can be tested independently of the full exam feature or analytics dashboard.

**Acceptance Scenarios**:

1. **Given** a user on practice setup screen, **When** they select section, categories, difficulty, and question count, **Then** the system validates selections against their subscription tier limits
2. **Given** a free tier user, **When** they attempt to request more than 5 practice questions, **Then** they are blocked with a prompt to upgrade to premium
3. **Given** a user with valid practice configuration, **When** they start the practice session, **Then** AI-generated questions matching their selections are delivered within 10 seconds
4. **Given** a user completing a practice session, **When** they submit answers, **Then** they receive overall score and category-specific performance breakdown
5. **Given** a user viewing practice results, **When** they review weak categories, **Then** they see specific improvement recommendations based on their performance
6. **Given** a user selecting "mixed" section, **When** practice generates, **Then** questions include both verbal and quantitative categories in proportion

---

### User Story 5 - Performance Analytics Dashboard (Priority: P5)

Students need to view aggregated performance metrics, category-specific trends, exam history, and progress over time to understand their learning trajectory and identify improvement areas.

**Why this priority**: Provides valuable insights but depends on having exam and practice data first (P3, P4). Analytics is a secondary feature that enhances the learning experience rather than delivering core educational content.

**Independent Test**: User with exam and practice history can view dashboard showing last exam scores (verbal, quantitative, overall), total exams completed, total practice hours, strongest/weakest categories, exam performance trend chart, and category-specific performance breakdown. Premium users can export performance reports. This story can be tested independently as long as test data exists in the database.

**Acceptance Scenarios**:

1. **Given** a user with completed exams, **When** they view the dashboard, **Then** they see their last exam scores (verbal, quantitative, overall average) prominently displayed
2. **Given** a user with learning history, **When** they view analytics, **Then** they see total exams completed, total practice sessions completed, and total practice hours
3. **Given** a user with multiple exam results, **When** they view the performance trend chart, **Then** they see a line graph showing score progression over time
4. **Given** a user viewing analytics, **When** they check category performance, **Then** they see a breakdown of scores for each category (geometry, analogies, etc.) with strongest and weakest highlighted
5. **Given** a premium user, **When** they request a performance report export, **Then** they receive a downloadable report containing exam history and category breakdowns
6. **Given** a new user with no history, **When** they view the dashboard, **Then** they see an empty state with encouragement to take their first exam

---

### User Story 6 - Notification Preferences & Settings (Priority: P6)

Students need to configure app settings including notification preferences (exam reminders, milestone achievements), view legal information (privacy policy, terms of service), and log out of the application.

**Why this priority**: Supporting functionality that enhances user experience but is not core to the educational mission. Can be implemented last as it doesn't block other features.

**Independent Test**: Authenticated user can navigate to settings screen, toggle notification preferences (exam reminders on/off, milestone notifications on/off), view privacy policy and terms of service, and successfully log out of the application. This story can be tested independently of any other feature once authentication is in place.

**Acceptance Scenarios**:

1. **Given** a user on notification preferences screen, **When** they toggle exam reminders off, **Then** the system saves their preference and stops sending exam reminder notifications
2. **Given** a user with notifications enabled, **When** they toggle milestone notifications on, **Then** they receive notifications when achieving milestones (e.g., 10 exams completed)
3. **Given** a user on settings screen, **When** they select "Privacy Policy" or "Terms of Service", **Then** they can view the full legal text
4. **Given** an authenticated user, **When** they select "Log Out", **Then** they are logged out and redirected to the login screen
5. **Given** a user with push notifications enabled, **When** they receive an exam reminder, **Then** the notification is displayed in Arabic with clear call-to-action

---

### Edge Cases

- **What happens when AI generation fails or times out?** Display user-friendly error message in Arabic with option to retry. For exams, allow user to restart generation without counting toward eligibility limits. For practice, allow immediate retry.

- **How does the system handle network disconnections during exam taking?** Locally cache answers in device storage and attempt to sync when connection is restored. If sync fails after 3 attempts, display clear error and allow user to retry submission. Incomplete exams do not count toward eligibility limits.

- **What happens when a user's subscription expires mid-exam or mid-practice?** Allow the current session to complete (grace period). Starting new sessions is blocked until subscription is renewed or user reverts to free tier limits.

- **How does the system handle Stripe webhook delays?** Client polls subscription status after payment completion (every 5 seconds for up to 60 seconds). If webhook hasn't updated status after 60 seconds, display message: "Payment received, subscription activation in progress. Please refresh in a few minutes."

- **What happens when image generation fails for geometry questions?** Fall back to text-only question format with descriptive text replacing the visual element. Indicate to the user that "Diagram unavailable - question presented in text format."

- **How does the system handle users attempting to cheat by manipulating timer or questions?** Implement server-side validation: exam completion timestamp verification, answer submission rate limiting, and session integrity checks. Suspicious patterns are flagged but do not block legitimate users.

- **What happens when a user abandons an exam halfway through?** Save progress as "abandoned" status. Do not count toward eligibility limits. User can view partial results in history but cannot resume the same exam. Must start a fresh exam if they want to try again.

- **How does the system handle identical question generation?** Maintain uniqueness check using question content hashing. If AI generates a duplicate question the user has seen in the last 30 days, regenerate automatically. Track question history per user.

- **What happens when Gemini API quota is exhausted?** Display maintenance message: "Question generation temporarily unavailable due to high demand. Please try again in [X] minutes." Queue premium user requests with priority. Send alerts to administrators when quota reaches 80%.

- **How does the system handle RTL layout bugs or text rendering issues?** Implement automated visual regression tests for all screens. Include manual QA checklist for RTL compliance before each release. Provide in-app feedback button for users to report layout issues.

- **What happens when a free tier user completes their 1 weekly exam but wants more?** Display upgrade prompt immediately after viewing results: "You've completed your free weekly exam! Upgrade to Premium for unlimited exams, detailed explanations, and advanced analytics." Include clear call-to-action button.

- **How does the system handle users in different time zones for "weekly" exam limits?** Use server-side UTC timestamps. "Week" is defined as Sunday 00:00 UTC to Saturday 23:59 UTC. Clearly communicate reset time to users in settings.

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & User Management**

- **FR-001**: System MUST allow students to create accounts using email and password with minimum 8-character password complexity requirements
- **FR-002**: System MUST send email verification OTP codes and validate them before granting full account access
- **FR-003**: System MUST allow users to configure their academic track (scientific or literary) during profile setup
- **FR-004**: System MUST allow users to upload profile pictures stored securely with appropriate access controls
- **FR-005**: System MUST authenticate users via email/password and maintain secure session state
- **FR-006**: System MUST allow authenticated users to log out and terminate their session

**Subscription & Access Control**

- **FR-007**: System MUST assign new users to free tier by default with defined limitations (1 exam per week, 5 practice questions max)
- **FR-008**: System MUST integrate with payment provider to process premium subscription upgrades
- **FR-009**: System MUST enforce tier-based access controls: free tier users limited to 1 exam per 7-day period, premium users unlimited
- **FR-010**: System MUST synchronize subscription status updates from payment provider webhooks within 60 seconds
- **FR-011**: System MUST allow premium users to cancel subscriptions and revert to free tier at billing period end
- **FR-012**: System MUST handle subscription trial periods if offered (7-day trial with automatic conversion to paid)

**Exam Generation & Taking**

- **FR-013**: System MUST check user eligibility before allowing exam generation (tier limits, weekly limits for free users)
- **FR-014**: System MUST generate full integrated exams containing exactly 40 questions (20 verbal, 20 quantitative) using AI
- **FR-015**: System MUST complete exam generation within 20 seconds or provide clear error messaging
- **FR-016**: System MUST generate questions across defined categories: Quantitative (basic_operations, geometry, roots_exponents), Verbal (analogies, sentence_completion, contextual_error, odd_word_out, reading_comprehension)
- **FR-017**: System MUST generate visual diagrams or geometric figures for quantitative geometry questions where applicable
- **FR-018**: System MUST display questions with RTL (right-to-left) layout for Arabic text content
- **FR-019**: System MUST provide question navigation controls (next, previous) and visual progress indicators
- **FR-020**: System MUST track time spent per question and overall exam duration
- **FR-021**: System MUST persist user-selected answers locally during exam taking to prevent data loss
- **FR-022**: System MUST allow users to submit completed exams and calculate scores immediately
- **FR-023**: System MUST calculate three separate scores: verbal section percentage, quantitative section percentage, and overall average
- **FR-024**: System MUST identify top 3 strengths (categories with above-average performance) and top 3 weaknesses (categories with below-average performance)
- **FR-025**: System MUST generate personalized improvement advice based on performance patterns
- **FR-026**: System MUST display solution explanations for each question to premium users only
- **FR-027**: System MUST mark exams as "abandoned" if user exits before completion and exclude from eligibility count

**Practice Session Generation & Taking**

- **FR-028**: System MUST allow users to configure practice sessions by selecting section (verbal/quantitative/mixed), categories, difficulty (easy/medium/hard), and question count
- **FR-029**: System MUST enforce tier-based question count limits: free tier maximum 5 questions, premium tier maximum 100 questions
- **FR-030**: System MUST generate practice questions matching user-specified criteria within 10 seconds
- **FR-031**: System MUST allow multi-category selection for focused practice (e.g., geometry + roots_exponents)
- **FR-032**: System MUST display practice questions with same RTL layout and navigation controls as exams
- **FR-033**: System MUST calculate overall practice score and category-specific performance breakdown
- **FR-034**: System MUST generate category-specific improvement recommendations based on practice results
- **FR-035**: System MUST track practice session completion and update total practice hours

**Performance Analytics & Dashboard**

- **FR-036**: System MUST display user dashboard showing last exam scores (verbal, quantitative, overall average)
- **FR-037**: System MUST display total exams completed, total practice sessions completed, and total practice hours
- **FR-038**: System MUST identify and display strongest category (highest average score) and weakest category (lowest average score)
- **FR-039**: System MUST generate exam performance trend visualization showing score progression over time
- **FR-040**: System MUST display category-specific performance breakdown showing average score per category
- **FR-041**: System MUST allow premium users to export performance reports containing exam history and category breakdowns
- **FR-042**: System MUST display empty state messaging for new users with no exam or practice history

**Notifications & Settings**

- **FR-043**: System MUST allow users to enable/disable exam reminder notifications
- **FR-044**: System MUST allow users to enable/disable milestone achievement notifications
- **FR-045**: System MUST send push notifications when enabled, respecting user preferences
- **FR-046**: System MUST display privacy policy and terms of service to users
- **FR-047**: System MUST display current app version in settings

**Non-Functional Requirements**

- **NFR-001**: System MUST support RTL (right-to-left) layout for all Arabic content throughout the application
- **NFR-002**: System MUST render UI at 60 frames per second on supported iOS and Android devices
- **NFR-003**: System MUST load initial app interface within 3 seconds on mid-range mobile devices
- **NFR-004**: System MUST maintain active memory usage under 150MB on mobile devices
- **NFR-005**: System MUST implement image lazy loading with progressive enhancement for geometry question visuals
- **NFR-006**: System MUST complete vector-based semantic search queries within 500 milliseconds
- **NFR-007**: System MUST implement secure storage for authentication tokens and sensitive user data
- **NFR-008**: System MUST enforce row-level security policies ensuring users can only access their own data
- **NFR-009**: System MUST validate payment provider webhook signatures before processing subscription updates
- **NFR-010**: System MUST log security-relevant events (authentication failures, unauthorized access attempts) without exposing sensitive data
- **NFR-011**: System MUST implement rate limiting to prevent abuse (maximum 1 exam generation per 30 seconds per user)
- **NFR-012**: System MUST handle AI generation service failures gracefully with user-friendly error messages in Arabic
- **NFR-013**: System MUST cache frequently requested content to reduce API costs and improve performance
- **NFR-014**: System MUST comply with SafeAreaView requirements for iOS notch and Android navigation bars

### Key Entities

- **User**: Represents a student using the platform. Attributes include email (unique identifier), password (encrypted), email verification status, and authentication session state.

- **User Profile**: Extended profile information for each user. Attributes include academic track selection (scientific or literary), profile picture reference, onboarding completion status, total practice hours accumulated, and last activity timestamp.

- **Subscription**: Tracks subscription tier and status for each user. Attributes include tier (free or premium), status (active, trialing, past_due, canceled, incomplete), payment provider customer identifier, subscription identifier, trial end date, billing period dates, and cancellation timestamp.

- **Exam Session**: Represents a single full integrated exam attempt. Attributes include status (in_progress, completed, abandoned), start timestamp, completion timestamp, total question count (40), questions answered count, and total time spent in seconds.

- **Exam Result**: Stores scoring and performance data for completed exams. Attributes include verbal section score (0-100 percentage), quantitative section score (0-100 percentage), overall average (computed), top 3 strengths (categories above average), top 3 weaknesses (categories below average), and AI-generated improvement advice.

- **Practice Session**: Represents a customized practice session. Attributes include section selection (verbal, quantitative, or mixed), category array (selected categories), difficulty level (easy, medium, hard), question count requested, status (in_progress, completed, abandoned), timestamps, and time spent.

- **Practice Result**: Stores scoring data for completed practice sessions. Attributes include overall score (0-100 percentage), category-specific breakdown (score per category), identified strengths and weaknesses, and improvement recommendations.

- **Question Template**: Pre-generated or AI-generated question content. Attributes include section (verbal or quantitative), category, difficulty level, question text in Arabic, image requirement flag, image generation prompt (for geometry questions), correct answer, multiple choice options array, and solution explanation.

- **Question Embedding**: Vector representation of question content for semantic search. Attributes include reference to question template, prompt context text, 768-dimensional embedding vector, and metadata (section, categories, difficulty).

- **User Analytics**: Aggregated performance metrics per user. Attributes include last exam scores (verbal, quantitative, overall), total completed exams count, total completed practice sessions count, cumulative practice hours, strongest category, weakest category, and last activity timestamp.

- **Notification Preferences**: User notification settings. Attributes include exam reminders enabled flag, milestone notifications enabled flag, and push notification device token.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can complete account registration, email verification, and profile setup within 3 minutes on first use
- **SC-002**: Students receive AI-generated 40-question exams within 20 seconds of request, 95% of the time during normal operation
- **SC-003**: Students can complete a full 40-question exam including navigation, answer selection, and submission within 60 minutes
- **SC-004**: Free tier students successfully complete at least 1 exam per week, demonstrating consistent engagement with the platform
- **SC-005**: Premium subscription upgrade flow completes within 2 minutes from initiation to feature unlock
- **SC-006**: Students viewing exam results see section-specific scores (verbal, quantitative) and overall performance within 2 seconds of submission
- **SC-007**: Students receive personalized improvement advice based on their performance patterns in 100% of completed exams
- **SC-008**: Premium students can export performance reports covering their full exam history in under 10 seconds
- **SC-009**: Practice session generation matching user-specified criteria (section, categories, difficulty) completes within 10 seconds
- **SC-010**: Students can configure and start customized practice sessions within 1 minute of accessing the practice setup screen
- **SC-011**: Students viewing analytics dashboard see aggregated performance metrics (scores, trends, category breakdown) within 3 seconds
- **SC-012**: Application maintains consistent 60 FPS UI rendering during question navigation and image loading on supported devices
- **SC-013**: Application memory usage remains under 150MB during typical exam-taking sessions with image-heavy content
- **SC-014**: Vector-based question search retrieves relevant content within 500 milliseconds per query
- **SC-015**: RTL (right-to-left) layout renders correctly for all Arabic content across 100% of screens with no visual misalignment
- **SC-016**: Students receive clear, actionable error messages in Arabic when AI generation fails or network issues occur
- **SC-017**: Payment webhook processing synchronizes subscription status updates within 60 seconds of payment completion, 99% of the time
- **SC-018**: Security policies ensure students can only access their own exam results, practice history, and analytics data (zero unauthorized access incidents)
- **SC-019**: Application handles 100 concurrent exam generation requests without degradation in response time or success rate
- **SC-020**: Students successfully complete the primary user journey (register → verify → profile setup → take exam → view results) without abandonment, 80% of the time
- **SC-021**: New students can navigate to their first exam within 5 minutes of completing registration
- **SC-022**: Students report satisfaction with question quality and relevance, as measured by in-app feedback or post-exam surveys (target: 4.0/5.0 average rating)
- **SC-023**: Support tickets related to authentication, payment, or exam generation represent less than 5% of total active users per month
- **SC-024**: Students demonstrate learning progress with measurable score improvement of at least 10% between their first exam and fifth exam

---

## Assumptions *(included when relevant)*

- **Language**: Application is Arabic-only for MVP. All content (questions, UI text, error messages, notifications) is in Arabic with RTL layout. English localization is not required for initial launch.

- **Target Devices**: Application targets iOS 13+ (iPhone 8 and newer) and Android 8.0+ (equivalent mid-range devices from 2018 onwards). Tablet support is not required for MVP.

- **Network Connectivity**: Application requires active internet connection for all core functionality (exam generation, practice sessions, subscription management, analytics). Offline mode is not supported in MVP beyond local answer caching during active exam sessions.

- **User Demographics**: Primary users are Saudi high school students (ages 16-18) preparing for standardized aptitude exams. Users are assumed to have basic smartphone literacy and familiarity with educational apps.

- **Academic Tracks**: Saudi aptitude exam system has two tracks: Scientific (علمي) focusing on STEM subjects and Literary (أدبي) focusing on humanities. This binary classification is sufficient for MVP. Sub-specializations within tracks are not required.

- **Question Categories**: Category taxonomy is fixed based on official Saudi aptitude exam structure. Categories are not user-customizable or extensible in MVP. See FR-016 for complete category list.

- **Exam Format**: Full integrated exam is fixed at 40 questions (20 verbal, 20 quantitative). Variable exam lengths are not supported in MVP. This matches the official exam structure.

- **Scoring Algorithm**: Questions are equally weighted. Scoring is simple percentage calculation (correct answers / total questions * 100). Advanced IRT (Item Response Theory) scoring is not implemented in MVP.

- **Image Generation**: Only geometry questions require visual diagrams. Text-based questions (analogies, sentence completion, reading comprehension) do not use images. Image generation uses AI with fallback to text-only format if generation fails.

- **Subscription Tiers**: Only two tiers exist: Free and Premium. No intermediate or enterprise tiers. Free tier limits are: 1 exam per 7-day period, 5 practice questions maximum. Premium tier has unlimited access to all features.

- **Trial Period**: If offered, trial period is 7 days with automatic conversion to paid subscription unless canceled. Trial users have full premium access during trial period.

- **Payment Processing**: Payment provider handles all PCI compliance, card storage, and recurring billing. Application never stores raw payment card data. One-time payments and annual billing are not supported in MVP (monthly recurring only).

- **Webhook Reliability**: Payment provider webhooks may experience delays up to 60 seconds. Application implements polling as fallback mechanism. Manual subscription reconciliation is available for edge cases.

- **AI Generation Quality**: AI-generated questions are assumed to be grammatically correct and educationally appropriate. Human review/curation of generated questions is out of scope for MVP. Feedback mechanism for reporting low-quality questions may be added in future iterations.

- **Rate Limits**: AI generation API has rate limits (documented in technical research). Application implements queuing and retry logic. Premium users receive priority during high-demand periods. Rate limit exhaustion triggers maintenance messaging to users.

- **Data Retention**: User data (profiles, exam history, practice results, analytics) is retained indefinitely unless user requests deletion. Automated data retention policies are not implemented in MVP.

- **Accessibility**: Basic accessibility (screen reader support for Arabic, sufficient color contrast) is required. Advanced accessibility features (voice control, haptic feedback, custom font sizing beyond OS defaults) are not required for MVP.

- **Analytics Privacy**: User analytics data is used solely for displaying personalized insights to the user. No cross-user analytics, aggregate reporting, or third-party data sharing in MVP. Privacy policy clearly communicates data usage.

- **Notification Timing**: Exam reminders are sent weekly if enabled. Milestone notifications are triggered immediately upon milestone completion. Notification scheduling and frequency customization are not supported in MVP.

- **Question Uniqueness**: System attempts to avoid showing users identical questions within 30-day period. Perfect uniqueness is not guaranteed due to probabilistic nature of AI generation. Acceptable tolerance: <5% duplicate question rate.

- **Performance Benchmarks**: Performance targets (3-second load time, 20-second exam generation, 500ms search queries) are based on mid-range device testing and standard network conditions (4G or WiFi). Performance on low-end devices or poor network connections may degrade gracefully.

---

**Specification Complete**: All user stories prioritized and independently testable. Ready for clarification refinement via `/speckit.clarify` or planning via `/speckit.plan`.
