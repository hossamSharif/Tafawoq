# Supabase RPC & Edge Functions Contract

**Feature**: Tafawoq Platform
**Date**: 2025-12-03
**Purpose**: Define Supabase Remote Procedure Calls (RPC) and Edge Functions for backend logic.

## Overview

This document specifies all Supabase Edge Functions and PostgreSQL RPC functions that handle server-side business logic, webhook processing, and complex database operations.

---

## 1. Edge Functions

### 1.1 stripe-webhook-handler

**Purpose**: Process Stripe webhook events for subscription lifecycle management.

**Endpoint**: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook-handler`

**Method**: POST

**Authentication**: None (validates Stripe signature)

**Request Headers**:
```
Content-Type: application/json
stripe-signature: <signature>
```

**Request Body**: Stripe webhook event object

**Event Handlers**:

#### customer.subscription.created
```typescript
{
  type: "customer.subscription.created",
  data: {
    object: {
      id: string,              // Stripe subscription ID
      customer: string,        // Stripe customer ID
      status: "active" | "trialing",
      trial_end: number | null, // Unix timestamp
      current_period_start: number,
      current_period_end: number
    }
  }
}
```

**Action**:
- Update `user_subscriptions` set tier='premium', status, trial_end_at, period dates
- Create `user_analytics` row if not exists

#### customer.subscription.updated
```typescript
{
  type: "customer.subscription.updated",
  data: {
    object: {
      id: string,
      status: "active" | "past_due" | "canceled",
      cancel_at_period_end: boolean,
      canceled_at: number | null
    }
  }
}
```

**Action**:
- Update `user_subscriptions` status, canceled_at timestamp
- If status='canceled' AND cancel_at_period_end=false, downgrade to free tier immediately

#### customer.subscription.deleted
```typescript
{
  type: "customer.subscription.deleted",
  data: {
    object: {
      id: string
    }
  }
}
```

**Action**:
- Update `user_subscriptions` set tier='free', status='canceled', canceled_at=NOW()

#### invoice.payment_failed
```typescript
{
  type: "invoice.payment_failed",
  data: {
    object: {
      subscription: string,
      customer: string,
      attempt_count: number
    }
  }
}
```

**Action**:
- Update `user_subscriptions` set status='past_due'
- Trigger notification to user about payment failure

**Response**:
```json
{
  "received": true
}
```

**Error Handling**:
- Return 400 for invalid signature
- Return 200 even if processing fails (acknowledge receipt)
- Log errors to Supabase logs for manual reconciliation

**Implementation Notes**:
- Validate Stripe webhook signature using `stripe.webhooks.constructEvent()`
- Use Supabase service role key for database updates (bypass RLS)
- Implement idempotency checks (don't re-process same event ID)

---

### 1.2 generate-exam-questions

**Purpose**: Generate full exam questions using Gemini AI with semantic context retrieval.

**Endpoint**: `https://<project-ref>.supabase.co/functions/v1/generate-exam-questions`

**Method**: POST

**Authentication**: Supabase JWT (required)

**Request Body**:
```typescript
{
  user_id: string,           // Authenticated user ID
  exam_session_id: string,   // Reference to exam_sessions row
  total_questions: number,   // 40 for full exam
  academic_track: "scientific" | "literary"
}
```

**Processing Steps**:
1. Verify user subscription tier (premium = unlimited, free = 1/week limit check)
2. Build prompt context: "Generate 40-question Saudi aptitude exam for {academic_track} track"
3. Generate embedding for prompt using Gemini text-embedding-004
4. Query `question_embeddings` table for top 20 similar questions (semantic search)
5. Pass retrieved questions + prompt to Gemini 1.5 Flash for generation
6. For geometry questions, generate images using Imagen 3
7. Store generated questions in response (not persisted to DB until exam completed)

**Response**:
```typescript
{
  exam_session_id: string,
  questions: Array<{
    id: string,                    // Temporary client-side ID
    section: "verbal" | "quantitative",
    category: string,
    difficulty: "easy" | "medium" | "hard",
    question_text: string,
    has_image: boolean,
    image_url?: string,           // Signed Supabase Storage URL if has_image=true
    options: string[],            // 4 options
    correct_answer: string,
    explanation: string           // Shown to premium users after completion
  }>,
  generation_metadata: {
    duration_ms: number,
    tokens_used: number,
    images_generated: number
  }
}
```

**Error Responses**:
```typescript
// Free tier limit exceeded
{
  error: "EXAM_LIMIT_EXCEEDED",
  message: "Free tier allows 1 exam per week. Upgrade to premium for unlimited access.",
  next_available_at: "2025-12-10T10:00:00Z"
}

// Gemini API quota exceeded
{
  error: "AI_QUOTA_EXCEEDED",
  message: "AI generation capacity reached. Please try again in 5 minutes.",
  retry_after_seconds: 300
}
```

**Rate Limiting**:
- Free tier: 1 request per week per user (enforced by checking `exam_sessions` count)
- Premium tier: 10 requests per hour per user (prevent abuse)

---

### 1.3 generate-practice-questions

**Purpose**: Generate customized practice session questions based on user selection.

**Endpoint**: `https://<project-ref>.supabase.co/functions/v1/generate-practice-questions`

**Method**: POST

**Authentication**: Supabase JWT (required)

**Request Body**:
```typescript
{
  user_id: string,
  practice_session_id: string,
  section: "verbal" | "quantitative" | "mixed",
  categories: string[],         // e.g., ["geometry", "roots_exponents"]
  difficulty: "easy" | "medium" | "hard",
  question_count: number        // 5 for free, up to 100 for premium
}
```

**Processing Steps**:
1. Verify subscription tier and question_count limit
2. Build category-specific prompt
3. Generate embedding for prompt
4. Query `question_embeddings` with category filter
5. Generate questions via Gemini 1.5 Flash
6. Generate images for applicable questions (geometry)

**Response**: Same structure as generate-exam-questions

**Error Responses**:
```typescript
// Free tier question limit
{
  error: "QUESTION_LIMIT_EXCEEDED",
  message: "Free tier allows 5 questions per practice. Current request: 20.",
  allowed_count: 5,
  requested_count: 20
}
```

---

## 2. PostgreSQL RPC Functions

### 2.1 check_exam_eligibility

**Purpose**: Check if user can start a new full exam based on tier limits.

**SQL Definition**:
```sql
CREATE OR REPLACE FUNCTION check_exam_eligibility(check_user_id UUID)
RETURNS TABLE(
  eligible BOOLEAN,
  reason TEXT,
  next_available_at TIMESTAMPTZ
) AS $$
DECLARE
  user_tier TEXT;
  exams_this_week INTEGER;
  last_exam_at TIMESTAMPTZ;
BEGIN
  -- Get user tier
  SELECT tier INTO user_tier
  FROM user_subscriptions
  WHERE user_id = check_user_id;

  -- Premium users always eligible
  IF user_tier = 'premium' THEN
    RETURN QUERY SELECT TRUE, 'Premium access'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Free tier: count exams in last 7 days
  SELECT COUNT(*), MAX(started_at)
  INTO exams_this_week, last_exam_at
  FROM exam_sessions
  WHERE user_id = check_user_id
    AND status = 'completed'
    AND started_at > NOW() - INTERVAL '7 days';

  IF exams_this_week >= 1 THEN
    RETURN QUERY SELECT
      FALSE,
      'Free tier limit: 1 exam per week'::TEXT,
      last_exam_at + INTERVAL '7 days';
  ELSE
    RETURN QUERY SELECT TRUE, 'Eligible'::TEXT, NULL::TIMESTAMPTZ;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Client Usage**:
```typescript
const { data, error } = await supabase.rpc('check_exam_eligibility', {
  check_user_id: user.id
});

if (!data.eligible) {
  // Show upgrade prompt or wait message
  console.log(data.reason, data.next_available_at);
}
```

---

### 2.2 calculate_practice_hours

**Purpose**: Calculate total practice hours from completed practice sessions.

**SQL Definition**:
```sql
CREATE OR REPLACE FUNCTION calculate_practice_hours(for_user_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_seconds INTEGER;
BEGIN
  SELECT COALESCE(SUM(time_spent_seconds), 0)
  INTO total_seconds
  FROM practice_sessions
  WHERE user_id = for_user_id
    AND status = 'completed';

  RETURN ROUND((total_seconds / 3600.0)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Client Usage**:
```typescript
const { data: practiceHours } = await supabase.rpc('calculate_practice_hours', {
  for_user_id: user.id
});
```

---

### 2.3 get_category_performance

**Purpose**: Aggregate performance statistics per category for analytics dashboard.

**SQL Definition**:
```sql
CREATE OR REPLACE FUNCTION get_category_performance(for_user_id UUID)
RETURNS TABLE(
  category TEXT,
  section TEXT,
  avg_score DECIMAL(5,2),
  attempts_count INTEGER,
  last_attempt_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH practice_categories AS (
    SELECT
      unnest(ps.categories) AS category,
      ps.section,
      (pr.category_breakdown->>unnest(ps.categories))::DECIMAL AS score,
      pr.created_at
    FROM practice_sessions ps
    JOIN practice_results pr ON pr.practice_session_id = ps.id
    WHERE ps.user_id = for_user_id
      AND ps.status = 'completed'
  )
  SELECT
    pc.category,
    pc.section,
    ROUND(AVG(pc.score), 2) AS avg_score,
    COUNT(*)::INTEGER AS attempts_count,
    MAX(pc.created_at) AS last_attempt_at
  FROM practice_categories pc
  GROUP BY pc.category, pc.section
  ORDER BY avg_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Client Usage**:
```typescript
const { data: categoryPerformance } = await supabase.rpc('get_category_performance', {
  for_user_id: user.id
});

// Returns:
// [
//   { category: "geometry", section: "quantitative", avg_score: 85.50, attempts_count: 5, last_attempt_at: "..." },
//   { category: "analogies", section: "verbal", avg_score: 78.25, attempts_count: 3, last_attempt_at: "..." }
// ]
```

---

### 2.4 search_similar_questions

**Purpose**: Perform semantic vector search on question embeddings.

**SQL Definition**:
```sql
CREATE OR REPLACE FUNCTION search_similar_questions(
  query_embedding VECTOR(768),
  filter_section TEXT DEFAULT NULL,
  filter_difficulty TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  question_id UUID,
  similarity_score DECIMAL(5,4),
  section TEXT,
  category TEXT,
  difficulty TEXT,
  question_text TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qt.id AS question_id,
    (1 - (qe.embedding <=> query_embedding))::DECIMAL(5,4) AS similarity_score,
    qt.section,
    qt.category,
    qt.difficulty,
    qt.question_text
  FROM question_embeddings qe
  JOIN question_templates qt ON qt.id = qe.question_template_id
  WHERE
    (filter_section IS NULL OR qt.section = filter_section) AND
    (filter_difficulty IS NULL OR qt.difficulty = filter_difficulty)
  ORDER BY qe.embedding <=> query_embedding
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Client Usage**: Called by Edge Functions, not directly from mobile app

---

## 3. Security & Performance Considerations

### Security
- All Edge Functions validate authentication via Supabase JWT (except webhooks)
- RPC functions use `SECURITY DEFINER` to enforce controlled database access
- Stripe webhooks validate signature before processing
- Rate limiting enforced at Edge Function level

### Performance
- Vector search using HNSW index (<500ms target)
- Edge Functions have 10-second execution timeout
- Implement request queuing for AI generation if needed
- Cache frequently accessed question embeddings

### Monitoring
- Log all Edge Function invocations to Supabase logs
- Track AI token usage for cost monitoring
- Alert on webhook processing failures

---

**Contract Status**: Complete - Ready for implementation
