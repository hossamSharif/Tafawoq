# Research & Technical Decisions

**Feature**: Tafawoq - Saudi Aptitude Exam Preparation Platform
**Date**: 2025-12-03
**Status**: Phase 0 Research Complete

## Overview

This document consolidates research findings for all technical unknowns identified during Technical Context analysis. Each section addresses a NEEDS CLARIFICATION item or technology integration pattern.

---

## 1. Gemini API Rate Limits & Quotas

### Decision
Use Gemini 1.5 Flash for text generation and Imagen 3 for image generation with tiered request quotas.

### Rationale
- **Gemini 1.5 Flash**: 15 requests per minute (RPM) free tier, 1,000 RPM paid tier, 4M tokens per minute
- **Embedding Model (text-embedding-004)**: 1,500 RPM free tier
- **Imagen 3**: 100 images per day free tier, higher limits on paid plans
- Token costs: Gemini 1.5 Flash is cost-effective at $0.075 per 1M input tokens

**Implementation Strategy**:
- Implement request queuing for exam generation (sequential question generation if needed)
- Cache embeddings for frequently used prompt patterns
- Pre-generate common question templates to reduce live API calls
- Implement exponential backoff for rate limit errors
- Monitor usage via Google Cloud Console

### Alternatives Considered
- **GPT-4**: Rejected due to higher cost ($10/1M tokens vs $0.075/1M) and similar rate limits
- **Claude 3.5**: Rejected due to limited multimodal image generation capabilities
- **Self-hosted models**: Rejected due to infrastructure complexity and Arabic language quality

### Risk Mitigation
- Set up usage alerts at 70% of quota
- Implement graceful degradation (text-only questions if image generation fails)
- Premium tier users get priority queue access

---

## 2. Testing Strategy Depth

### Decision
Three-tier testing approach: Unit tests (Jest), Component tests (React Native Testing Library), E2E tests (Detox) for critical paths only.

### Rationale
**Unit Testing (Jest + React Native Testing Library)**:
- Test coverage target: 70% for services, 60% for components
- Focus areas: AI prompt generation, subscription validation, scoring algorithms
- Mock external services (Supabase, Stripe, Gemini) for isolation

**Component Testing**:
- Snapshot tests for UI consistency (RTL layout verification)
- Interaction tests for form validation, navigation flows
- Accessibility tests (screen reader compatibility for Arabic)

**E2E Testing (Detox - Critical Paths Only)**:
- Registration → Profile Setup → First Practice Session
- Free Tier → Upgrade → Premium Access Verification
- Exam Taking → Result Display → Analytics Update
- Not full coverage due to Detox complexity and maintenance cost

### Alternatives Considered
- **Appium**: Rejected due to slower execution and more brittle tests
- **Maestro**: Rejected due to limited React Native integration maturity
- **Manual testing only**: Rejected due to regression risk with frequent AI integration changes

### Implementation Notes
- Run Jest/RNTL tests on every PR via GitHub Actions
- Run Detox E2E weekly or pre-release (too slow for every commit)
- Use Detox with iPhone 14 simulator and Pixel 6 emulator as reference devices

---

## 3. TypeScript Strict Mode Enforcement

### Decision
Enable TypeScript strict mode with gradual enforcement via ESLint progressive rules.

### Rationale
- **Strict Mode Benefits**: Catches null/undefined errors, enforces type safety for Supabase/Stripe SDK responses
- **Progressive Adoption**: Start with `strictNullChecks: true`, add `strict: true` after initial implementation
- **Developer Experience**: VS Code IntelliSense provides autocomplete for Supabase table schemas

**tsconfig.json Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**ESLint Rules**:
- `@typescript-eslint/no-explicit-any`: warn (error in Phase 2)
- `@typescript-eslint/explicit-function-return-type`: off (too verbose for React components)

### Alternatives Considered
- **JavaScript only**: Rejected due to lack of type safety for complex data structures (exam questions, user profiles)
- **TypeScript non-strict**: Rejected due to high risk of runtime errors with external API integrations

---

## 4. React Native Paper RTL Best Practices

### Decision
Use React Native Paper with `react-native-paper`'s built-in RTL support via `I18nManager`.

### Rationale
- React Native Paper respects `I18nManager.forceRTL(true)` automatically
- Material Design components (Appbar, Card, List) have built-in RTL layouts
- Custom components need manual RTL handling via `I18nManager.isRTL`

**Implementation Pattern**:
```typescript
import { I18nManager } from 'react-native';

// In App.tsx initialization
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

// For custom styles
const styles = StyleSheet.create({
  container: {
    paddingStart: 16, // Automatically becomes paddingRight in RTL
    marginEnd: 8,     // Automatically becomes marginLeft in RTL
  }
});
```

**Testing Strategy**:
- Visual regression tests with screenshot comparison
- Manual QA checklist for all screens (icon placement, text alignment)

### Alternatives Considered
- **Manual RTL logic**: Rejected due to high maintenance burden
- **react-native-rtl**: Rejected because React Native Paper already handles RTL

---

## 5. Supabase pgvector Setup & Optimization

### Decision
Use Supabase pgvector extension with pre-computed embeddings stored in dedicated `question_embeddings` table.

### Rationale
- **Vector Dimensionality**: Gemini text-embedding-004 produces 768-dimensional vectors
- **Indexing**: Create HNSW index for fast approximate nearest neighbor search (<500ms)
- **Storage Pattern**: Separate table for embeddings to avoid bloating main `questions` table

**Schema Design**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE question_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_prompt TEXT NOT NULL,
  embedding VECTOR(768) NOT NULL,
  metadata JSONB, -- category, difficulty, section
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON question_embeddings USING hnsw (embedding vector_cosine_ops);
```

**Query Pattern**:
```sql
SELECT id, question_prompt, metadata,
       1 - (embedding <=> $1::vector) AS similarity
FROM question_embeddings
WHERE metadata->>'section' = 'quantitative'
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

### Alternatives Considered
- **Pinecone**: Rejected due to additional service cost and complexity
- **Elasticsearch with dense_vector**: Rejected due to self-hosting requirements
- **In-memory vector search**: Rejected due to mobile memory constraints

### Performance Optimization
- Pre-compute embeddings for 1,000+ sample questions during database seed
- Batch embed new questions during off-peak hours
- Cache top-100 most requested question contexts client-side

---

## 6. Stripe Subscription Handling in React Native

### Decision
Use `@stripe/stripe-react-native` with Supabase webhook integration for subscription status synchronization.

### Rationale
- **Payment Flow**: Stripe Payment Sheet for secure card collection (PCI-compliant)
- **Subscription Sync**: Stripe webhooks → Supabase Edge Function → update `user_subscriptions` table
- **Trial Handling**: 7-day trial via Stripe subscription trial_period_days parameter

**Implementation Architecture**:
```
Mobile App → Stripe Payment Sheet → Stripe API
                                         ↓
                              Webhook (subscription.created)
                                         ↓
                       Supabase Edge Function (webhook handler)
                                         ↓
                          Update user_subscriptions table
                                         ↓
                              Client polls subscription status
```

**Critical Webhook Events**:
- `customer.subscription.created`: Activate premium features
- `customer.subscription.updated`: Handle plan changes
- `customer.subscription.deleted`: Revert to free tier
- `invoice.payment_failed`: Notify user of failed payment

### Alternatives Considered
- **RevenueCat**: Rejected due to additional abstraction layer and cost
- **Manual subscription tracking**: Rejected due to sync reliability concerns

### Security Considerations
- Store Stripe Customer ID in Supabase `users` table
- Verify webhook signatures using Stripe webhook secret
- Never store payment methods in Supabase (Stripe handles PCI compliance)

---

## 7. React Native Performance Optimization for Image-Heavy Apps

### Decision
Implement progressive image loading with `react-native-fast-image` and on-demand Gemini image generation.

### Rationale
- **Image Caching**: react-native-fast-image provides disk caching and priority loading
- **Memory Management**: Load images lazily using `FlatList` with `windowSize={5}`
- **Generation Strategy**: Generate images only when question is displayed (not in batch)

**Implementation Pattern**:
```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  style={styles.questionImage}
  source={{
    uri: imageUrl,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable
  }}
  resizeMode={FastImage.resizeMode.contain}
/>
```

**Optimization Checklist**:
- Use `getSize()` to determine image dimensions before rendering
- Implement placeholder loading states with skeleton screens
- Compress images to WebP format (50-70% size reduction)
- Limit concurrent image generation requests to 3 at a time

### Alternatives Considered
- **React Native Image**: Rejected due to poor caching and slower loading
- **Expo Image**: Acceptable alternative but less mature than react-native-fast-image

### Memory Budget Allocation
- Target 150MB active memory (iOS threshold before warnings)
- Reserve 50MB for app core functionality
- Allocate 100MB for image cache (auto-evicts LRU images)

---

## 8. Security Best Practices

### Decision
Multi-layered security: Supabase RLS policies, API key management via environment variables, and rate limiting.

### Rationale

**Supabase Row-Level Security (RLS)**:
- Enable RLS on all tables
- Users can only read their own exam results and profile data
- Premium content queries check `user_subscriptions.tier` column
```sql
CREATE POLICY "Users can read own results" ON exam_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Premium users access advanced analytics" ON analytics
  FOR SELECT USING (
    auth.uid() = user_id AND
    (SELECT tier FROM user_subscriptions WHERE user_id = auth.uid()) = 'premium'
  );
```

**API Key Management**:
- Store Gemini API key, Supabase anon key, Stripe publishable key in `.env` (git-ignored)
- Use Expo SecureStore for sensitive runtime data (auth tokens)
- Rotate Gemini API key quarterly

**Rate Limiting**:
- Implement client-side rate limiting (max 1 exam generation per 30 seconds)
- Supabase Edge Functions enforce server-side rate limits (100 requests/minute per user)

**Webhook Security**:
- Verify Stripe webhook signatures using `stripe.webhooks.constructEvent()`
- Use HTTPS-only endpoints for all webhook handlers

### Alternatives Considered
- **OAuth for Gemini**: Not available for Gemini API (API key only)
- **Environment-specific keys**: Implement in Phase 2 (dev/staging/prod separation)

---

## Technology Integration Summary

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

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini API quota exceeded | Medium | High | Implement request queue, cache responses, usage alerts |
| Stripe webhook failures | Low | High | Retry logic, manual reconciliation UI for admins |
| RTL layout bugs | Medium | Medium | Comprehensive visual regression tests, manual QA |
| Image memory leaks | Low | High | Strict memory profiling, image cache limits |
| Supabase RLS bypass | Low | Critical | Security audit before launch, penetration testing |

---

## Open Questions for Phase 1

1. **Database Schema**: Exact table relationships between users, exams, questions, results?
2. **Navigation Flow**: Stack vs. Tab navigation for main app sections?
3. **Offline Support**: Should partial offline support be added (e.g., cached results viewing)?
4. **Analytics Events**: Which user actions should trigger analytics tracking?
5. **Localization**: English support needed or Arabic-only sufficient for MVP?

These questions will be addressed during Phase 1 design (data-model.md and contracts/).

---

**Research Complete**: All NEEDS CLARIFICATION items resolved. Proceeding to Phase 1 design.
