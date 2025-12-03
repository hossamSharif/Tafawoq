# Data Model

**Feature**: Tafawoq - Saudi Aptitude Exam Preparation Platform
**Date**: 2025-12-03
**Database**: Supabase PostgreSQL with pgvector extension

## Overview

This document defines all data entities, relationships, validation rules, and state transitions for the Tafawoq platform. The data model supports user authentication, subscription management, AI-generated exams/practices, and performance analytics.

---

## Entity Relationship Diagram

```
users (Supabase Auth)
  ↓ 1:1
user_profiles
  ↓ 1:1
user_subscriptions ← (synced via Stripe webhooks)
  ↓ 1:many
exam_sessions ← exam_results → exam_questions
  ↓ 1:many
practice_sessions ← practice_results → practice_questions
  ↓
user_analytics (aggregated)

question_embeddings (vector search index)
  ↓ references
question_templates (pre-generated content)
```

---

## 1. Core Entities

### 1.1 users (Managed by Supabase Auth)

**Purpose**: Handles authentication and stores Supabase auth.users data.

**Fields** (from Supabase Auth schema):
- `id` (UUID, PK) - Supabase-generated user ID
- `email` (TEXT, UNIQUE, NOT NULL) - User email address
- `encrypted_password` (TEXT) - Managed by Supabase
- `email_confirmed_at` (TIMESTAMPTZ) - Email verification timestamp
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Validation Rules**:
- Email must be valid format
- Password minimum 8 characters with complexity requirements (enforced by Supabase)

**RLS Policies**:
- Users can only read their own auth data via `auth.uid()`

---

### 1.2 user_profiles

**Purpose**: Extended user profile information including academic track and onboarding state.

**Schema**:
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_track TEXT NOT NULL CHECK (academic_track IN ('scientific', 'literary')),
  profile_picture_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  total_practice_hours DECIMAL(10,2) DEFAULT 0.00,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields**:
- `id` (UUID, PK) - Profile identifier
- `user_id` (UUID, FK → auth.users.id, UNIQUE) - Reference to Supabase auth user
- `academic_track` (ENUM: 'scientific' | 'literary') - Academic pathway selection
- `profile_picture_url` (TEXT, nullable) - URL to uploaded profile picture in Supabase Storage
- `onboarding_completed` (BOOLEAN) - Whether user finished registration flow
- `total_practice_hours` (DECIMAL) - Cumulative practice session hours
- `last_active_at` (TIMESTAMPTZ) - Last app activity timestamp
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Validation Rules**:
- `academic_track` must be 'scientific' or 'literary'
- `total_practice_hours` cannot be negative
- Profile picture URL must be valid Supabase Storage path

**State Transitions**:
- `onboarding_completed`: false → true (irreversible)

**RLS Policies**:
```sql
-- Users can read their own profile
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

---

### 1.3 user_subscriptions

**Purpose**: Tracks subscription tier, Stripe customer relationship, and access control.

**Schema**:
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  trial_end_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id, UNIQUE) - One subscription per user
- `stripe_customer_id` (TEXT, UNIQUE) - Stripe Customer ID
- `stripe_subscription_id` (TEXT, UNIQUE, nullable) - Stripe Subscription ID (null for free tier)
- `tier` (ENUM: 'free' | 'premium') - Current subscription tier
- `status` (ENUM: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete') - Subscription state
- `trial_end_at` (TIMESTAMPTZ, nullable) - Trial expiration timestamp
- `current_period_start`, `current_period_end` (TIMESTAMPTZ) - Billing period
- `canceled_at` (TIMESTAMPTZ, nullable) - Cancellation timestamp
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Validation Rules**:
- Free tier users must have `stripe_subscription_id = NULL`
- Premium tier users must have valid `stripe_customer_id` and `stripe_subscription_id`
- `trial_end_at` must be in the future if status = 'trialing'

**State Transitions**:
```
free → trialing (user starts trial)
trialing → active (trial converts to paid)
trialing → free (trial expires without payment)
active → past_due (payment fails)
past_due → active (payment recovered)
active → canceled (user cancels)
canceled → active (user reactivates)
```

**RLS Policies**:
```sql
CREATE POLICY "Users read own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

**Webhook Sync**: Updated by Supabase Edge Function on Stripe webhook events.

---

## 2. Exam & Practice Entities

### 2.1 exam_sessions

**Purpose**: Represents a full integrated exam attempt (verbal + quantitative sections).

**Schema**:
```sql
CREATE TABLE exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_questions INTEGER NOT NULL DEFAULT 40,
  questions_answered INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);
```

**Fields**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id)
- `status` (ENUM: 'in_progress' | 'completed' | 'abandoned')
- `started_at` (TIMESTAMPTZ) - Exam start timestamp
- `completed_at` (TIMESTAMPTZ, nullable) - Exam completion timestamp
- `total_questions` (INTEGER) - Total questions in exam (default 40)
- `questions_answered` (INTEGER) - Number of questions answered
- `time_spent_seconds` (INTEGER) - Total exam duration in seconds
- `created_at` (TIMESTAMPTZ)

**Validation Rules**:
- `completed_at` must be after `started_at`
- `questions_answered` ≤ `total_questions`
- Free tier users: Max 1 completed exam per week (enforced at application level)

**State Transitions**:
```
in_progress → completed (user finishes exam)
in_progress → abandoned (user exits without completing)
```

**RLS Policies**:
```sql
CREATE POLICY "Users CRUD own exam sessions" ON exam_sessions
  FOR ALL USING (auth.uid() = user_id);
```

---

### 2.2 exam_results

**Purpose**: Stores scoring results for completed exams with section-level performance.

**Schema**:
```sql
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_session_id UUID NOT NULL UNIQUE REFERENCES exam_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verbal_score DECIMAL(5,2) NOT NULL CHECK (verbal_score BETWEEN 0 AND 100),
  quantitative_score DECIMAL(5,2) NOT NULL CHECK (quantitative_score BETWEEN 0 AND 100),
  overall_average DECIMAL(5,2) GENERATED ALWAYS AS ((verbal_score + quantitative_score) / 2) STORED,
  strengths JSONB, -- Top 3 categories above average
  weaknesses JSONB, -- Top 3 categories below average
  improvement_advice TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);
```

**Fields**:
- `id` (UUID, PK)
- `exam_session_id` (UUID, FK → exam_sessions.id, UNIQUE) - One result per exam
- `user_id` (UUID, FK → auth.users.id)
- `verbal_score` (DECIMAL 0-100) - Verbal section percentage
- `quantitative_score` (DECIMAL 0-100) - Quantitative section percentage
- `overall_average` (DECIMAL, computed) - `(verbal_score + quantitative_score) / 2`
- `strengths` (JSONB) - `[{category: string, score: number}, ...]`
- `weaknesses` (JSONB) - `[{category: string, score: number}, ...]`
- `improvement_advice` (TEXT) - AI-generated personalized recommendations
- `created_at` (TIMESTAMPTZ)

**Validation Rules**:
- All scores must be between 0 and 100
- `strengths` and `weaknesses` arrays max 3 items each

**RLS Policies**:
```sql
CREATE POLICY "Users read own exam results" ON exam_results
  FOR SELECT USING (auth.uid() = user_id);
```

---

### 2.3 practice_sessions

**Purpose**: Tracks customized practice sessions with category/difficulty selection.

**Schema**:
```sql
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('verbal', 'quantitative', 'mixed')),
  categories TEXT[] NOT NULL, -- Array of selected category names
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
```

**Fields**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id)
- `section` (ENUM: 'verbal' | 'quantitative' | 'mixed')
- `categories` (TEXT[]) - Selected categories (e.g., `['geometry', 'roots_exponents']`)
- `difficulty` (ENUM: 'easy' | 'medium' | 'hard')
- `question_count` (INTEGER) - Number of questions requested
- `status` (ENUM: 'in_progress' | 'completed' | 'abandoned')
- `started_at`, `completed_at` (TIMESTAMPTZ)
- `time_spent_seconds` (INTEGER)
- `created_at` (TIMESTAMPTZ)

**Validation Rules**:
- Free tier: `question_count` ≤ 5
- Premium tier: `question_count` ≤ 100
- `categories` array must not be empty

**State Transitions**: Same as exam_sessions

**RLS Policies**:
```sql
CREATE POLICY "Users CRUD own practice sessions" ON practice_sessions
  FOR ALL USING (auth.uid() = user_id);
```

---

### 2.4 practice_results

**Purpose**: Stores scoring results for completed practice sessions.

**Schema**:
```sql
CREATE TABLE practice_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_session_id UUID NOT NULL UNIQUE REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  category_breakdown JSONB NOT NULL, -- {category: score}
  strengths JSONB,
  weaknesses JSONB,
  improvement_advice TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practice_results_user_id ON practice_results(user_id);
```

**Fields**:
- `id` (UUID, PK)
- `practice_session_id` (UUID, FK → practice_sessions.id, UNIQUE)
- `user_id` (UUID, FK → auth.users.id)
- `overall_score` (DECIMAL 0-100) - Overall practice percentage
- `category_breakdown` (JSONB) - `{geometry: 85.5, roots_exponents: 72.0}`
- `strengths`, `weaknesses` (JSONB) - Category-specific performance
- `improvement_advice` (TEXT) - AI-generated recommendations
- `created_at` (TIMESTAMPTZ)

**Validation Rules**:
- `overall_score` between 0 and 100
- `category_breakdown` must contain all categories from practice_sessions.categories

**RLS Policies**:
```sql
CREATE POLICY "Users read own practice results" ON practice_results
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 3. Question Entities

### 3.1 question_templates

**Purpose**: Pre-generated question content used as templates for AI generation and embedding search.

**Schema**:
```sql
CREATE TABLE question_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL CHECK (section IN ('verbal', 'quantitative')),
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  has_image BOOLEAN DEFAULT FALSE,
  image_prompt TEXT, -- Prompt for Gemini image generation
  correct_answer TEXT NOT NULL,
  options JSONB NOT NULL, -- [option1, option2, option3, option4]
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_question_templates_section_category ON question_templates(section, category);
CREATE INDEX idx_question_templates_difficulty ON question_templates(difficulty);
```

**Fields**:
- `id` (UUID, PK)
- `section` (ENUM: 'verbal' | 'quantitative')
- `category` (TEXT) - Specific category (e.g., 'geometry', 'analogies')
- `difficulty` (ENUM: 'easy' | 'medium' | 'hard')
- `question_text` (TEXT) - Arabic question content
- `has_image` (BOOLEAN) - Whether question requires visual
- `image_prompt` (TEXT, nullable) - Prompt for Imagen 3 generation
- `correct_answer` (TEXT) - Correct answer option
- `options` (JSONB) - `["option1", "option2", "option3", "option4"]`
- `explanation` (TEXT) - Solution explanation for premium users
- `created_at` (TIMESTAMPTZ)

**Categories Reference**:

**Quantitative**:
- `basic_operations` (العمليات الأساسية)
- `geometry` (قسم الهندسة)
- `roots_exponents` (قسم الأسس والجذور)

**Verbal**:
- `analogies` (التناظر اللفظي)
- `sentence_completion` (إكمال الجمل)
- `contextual_error` (الخطأ السياقي)
- `odd_word_out` (المفردة الشاذة)
- `reading_comprehension` (استيعاب المقروء)

**RLS Policies**:
```sql
-- Questions readable by all authenticated users
CREATE POLICY "Authenticated users read questions" ON question_templates
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

### 3.2 question_embeddings

**Purpose**: Vector embeddings for semantic search of question contexts.

**Schema**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE question_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_template_id UUID REFERENCES question_templates(id) ON DELETE CASCADE,
  prompt_context TEXT NOT NULL, -- User selection serialized as text
  embedding VECTOR(768) NOT NULL, -- Gemini text-embedding-004
  metadata JSONB NOT NULL, -- {section, categories[], difficulty}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_question_embeddings_hnsw ON question_embeddings
  USING hnsw (embedding vector_cosine_ops);
```

**Fields**:
- `id` (UUID, PK)
- `question_template_id` (UUID, FK → question_templates.id, nullable)
- `prompt_context` (TEXT) - Serialized user selection (e.g., "quantitative geometry medium")
- `embedding` (VECTOR(768)) - 768-dimensional Gemini embedding
- `metadata` (JSONB) - `{section: "quantitative", categories: ["geometry"], difficulty: "medium"}`
- `created_at` (TIMESTAMPTZ)

**Query Pattern**:
```sql
SELECT qt.*,
       1 - (qe.embedding <=> $1::vector) AS similarity
FROM question_embeddings qe
JOIN question_templates qt ON qt.id = qe.question_template_id
WHERE qe.metadata->>'section' = 'quantitative'
ORDER BY qe.embedding <=> $1::vector
LIMIT 10;
```

**RLS Policies**:
```sql
CREATE POLICY "Authenticated users search embeddings" ON question_embeddings
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 4. Analytics Entities

### 4.1 user_analytics

**Purpose**: Aggregated performance metrics for dashboard display.

**Schema**:
```sql
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_exam_verbal_score DECIMAL(5,2),
  last_exam_quantitative_score DECIMAL(5,2),
  last_exam_overall_average DECIMAL(5,2),
  total_exams_completed INTEGER DEFAULT 0,
  total_practices_completed INTEGER DEFAULT 0,
  total_practice_hours DECIMAL(10,2) DEFAULT 0.00,
  strongest_category TEXT,
  weakest_category TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
```

**Fields**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id, UNIQUE)
- `last_exam_verbal_score`, `last_exam_quantitative_score`, `last_exam_overall_average` (DECIMAL)
- `total_exams_completed` (INTEGER) - Count of completed full exams
- `total_practices_completed` (INTEGER) - Count of completed practice sessions
- `total_practice_hours` (DECIMAL) - Cumulative practice hours
- `strongest_category` (TEXT) - Category with highest average score
- `weakest_category` (TEXT) - Category with lowest average score
- `last_activity_at`, `updated_at` (TIMESTAMPTZ)

**Update Triggers**:
- Automatically updated via database trigger when `exam_results` or `practice_results` inserted
- Recalculates aggregates on each new result

**RLS Policies**:
```sql
CREATE POLICY "Users read own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 5. Supporting Entities

### 5.1 notification_preferences

**Purpose**: User notification settings for exam reminders and milestones.

**Schema**:
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_reminders_enabled BOOLEAN DEFAULT TRUE,
  milestone_notifications_enabled BOOLEAN DEFAULT TRUE,
  push_token TEXT, -- Expo push notification token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id, UNIQUE)
- `exam_reminders_enabled` (BOOLEAN) - Send weekly exam reminders
- `milestone_notifications_enabled` (BOOLEAN) - Achievement notifications
- `push_token` (TEXT, nullable) - Expo push notification device token
- `created_at`, `updated_at` (TIMESTAMPTZ)

**RLS Policies**:
```sql
CREATE POLICY "Users manage own notification prefs" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);
```

---

## 6. Database Triggers & Functions

### 6.1 update_user_analytics_trigger

**Purpose**: Automatically update `user_analytics` when exam/practice results are inserted.

```sql
CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total exam count and last exam scores
  IF TG_TABLE_NAME = 'exam_results' THEN
    UPDATE user_analytics
    SET
      last_exam_verbal_score = NEW.verbal_score,
      last_exam_quantitative_score = NEW.quantitative_score,
      last_exam_overall_average = NEW.overall_average,
      total_exams_completed = total_exams_completed + 1,
      last_activity_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  -- Update total practice count
  IF TG_TABLE_NAME = 'practice_results' THEN
    UPDATE user_analytics
    SET
      total_practices_completed = total_practices_completed + 1,
      last_activity_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exam_results_update_analytics
  AFTER INSERT ON exam_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analytics();

CREATE TRIGGER practice_results_update_analytics
  AFTER INSERT ON practice_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analytics();
```

---

## 7. Data Validation Summary

| Entity | Key Validations |
|--------|----------------|
| user_profiles | academic_track ∈ {'scientific', 'literary'}, total_practice_hours ≥ 0 |
| user_subscriptions | tier/status consistency, trial_end_at future timestamp if trialing |
| exam_sessions | completed_at > started_at, questions_answered ≤ total_questions |
| exam_results | All scores 0-100, strengths/weaknesses max 3 items |
| practice_sessions | Free: question_count ≤ 5, Premium: ≤ 100, categories non-empty |
| practice_results | overall_score 0-100, category_breakdown matches session categories |
| question_templates | section/category valid combinations, options array length = 4 |
| question_embeddings | embedding dimension = 768, metadata contains section |

---

## 8. Subscription Access Control Logic

```sql
-- Helper function to check premium access
CREATE OR REPLACE FUNCTION has_premium_access(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = check_user_id
      AND tier = 'premium'
      AND status IN ('active', 'trialing')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example RLS policy using premium check
CREATE POLICY "Premium users access detailed analytics" ON user_analytics
  FOR SELECT USING (
    auth.uid() = user_id AND has_premium_access(auth.uid())
  );
```

---

**Data Model Complete**: All entities, relationships, validation rules, and RLS policies defined. Ready for contract generation.
