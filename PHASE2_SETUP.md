# Phase 2 Implementation - Manual Setup Tasks

**Date**: 2025-12-04
**Status**: Automated tasks completed, manual tasks remaining

## ✅ Completed (Automated)

All foundational code and database setup has been completed:

1. **Configuration Files** (T012-T015) ✅
   - `src/config/supabase.config.ts` - Supabase client with AsyncStorage
   - `src/config/stripe.config.ts` - Stripe SDK initialization
   - `src/config/gemini.config.ts` - Edge Function URLs and AI settings
   - `src/config/theme.config.ts` - RTL-enabled theme with Noto Kufi Arabic

2. **Utility Functions** (T016-T018) ✅
   - `src/utils/rtl.utils.ts` - RTL layout helpers
   - `src/utils/validation.utils.ts` - Input validation with Arabic errors
   - `src/utils/network.utils.ts` - Network error handling

3. **Type Definitions** (T019-T025) ✅
   - All entity types created in `src/types/`
   - Generated database types in `src/types/database.types.ts`

4. **Service Layer Foundation** (T026-T028) ✅
   - `src/services/errors/service-error.ts` - Base error class
   - `src/services/errors/gemini-error.ts` - AI-specific errors
   - `src/contexts/ServicesContext.tsx` - Dependency injection

5. **Navigation Foundation** (T029-T032) ✅
   - `src/navigation/types.ts` - Navigation type definitions
   - `src/navigation/AuthStack.tsx` - Auth flow navigator
   - `src/navigation/MainStack.tsx` - Main app navigator
   - `src/navigation/AppNavigator.tsx` - Root navigator

6. **Supabase Database** (T033-T048) ✅
   - pgvector extension enabled
   - All 10 tables created with RLS enabled
   - RLS policies applied
   - Helper functions created
   - Analytics triggers configured

7. **Supabase RPC Functions** (T049-T052) ✅
   - `check_exam_eligibility` - Exam quota validation
   - `calculate_practice_hours` - Practice time aggregation
   - `get_category_performance` - Performance analytics
   - `search_similar_questions` - Vector similarity search

8. **TypeScript Types** (T057) ✅
   - Generated from Supabase schema

9. **Common UI Components** (T058-T062) ✅
   - `LoadingSpinner` - Loading indicator with Arabic text
   - `ErrorMessage` - Error display with retry
   - `Button` - RTL-aware button component
   - `Card` - Reusable card component
   - `Input` - Text input with Arabic support

10. **App Entry Point** (T063) ✅
    - `App.tsx` - Complete setup with RTL, theme, providers

## ⏳ Remaining Manual Tasks

These tasks require manual configuration via web dashboards:

### 1. Supabase Storage Buckets (T053-T054)

**Location**: https://supabase.com/dashboard → Your Project → Storage

Create two buckets:

#### Bucket 1: `question-assets` (Public)
```
Purpose: AI-generated images for questions (geometry diagrams, etc.)
Visibility: Public
File Size Limit: 5MB
Allowed MIME types: image/png, image/jpeg, image/webp
```

**Steps**:
1. Go to Storage → New Bucket
2. Name: `question-assets`
3. Select "Public bucket"
4. Click "Create bucket"

#### Bucket 2: `profile-pictures` (Private)
```
Purpose: User profile pictures
Visibility: Private
File Size Limit: 2MB
Allowed MIME types: image/png, image/jpeg
```

**Steps**:
1. Go to Storage → New Bucket
2. Name: `profile-pictures`
3. Select "Private bucket"
4. Click "Create bucket"
5. Add RLS policy:
   ```sql
   CREATE POLICY "Users can upload own profile picture"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'profile-pictures' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   CREATE POLICY "Users can read own profile picture"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'profile-pictures' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

### 2. Stripe Products & Prices (T055-T056)

**Location**: https://dashboard.stripe.com → Products

#### Product: Tafawoq Premium Monthly

**Steps**:
1. Go to Products → Add Product
2. Fill in details:
   - Name: `Tafawoq Premium Monthly`
   - Description: `Premium subscription with unlimited exams, 100 practice questions, analytics, and solution explanations`
   - Statement descriptor: `TAFAWOQ PREMIUM`

3. Add pricing:
   - Pricing model: `Recurring`
   - Price: `49.99 SAR` (or your chosen amount)
   - Billing period: `Monthly`
   - Currency: `SAR` (Saudi Riyal)

4. Click "Save product"

5. Copy the **Price ID** (starts with `price_...`)

6. Update `.env` file:
   ```bash
   EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxx
   ```

### 3. Environment Configuration

**File**: `.env` (create from `.env.example`)

```bash
cp .env.example .env
```

Then fill in actual values:

```bash
# Supabase (from https://supabase.com/dashboard → Settings → API)
EXPO_PUBLIC_SUPABASE_URL=https://fvstedbsjiqvryqpnmzl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Stripe (from https://dashboard.stripe.com → Developers → API Keys)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-publishable-key>
STRIPE_SECRET_KEY=<your-secret-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID=<price-id-from-step-2>

# Gemini (from https://console.cloud.google.com → Credentials)
EXPO_PUBLIC_GEMINI_API_KEY=<your-gemini-api-key>
```

### 4. Stripe Webhook Configuration

**Location**: https://dashboard.stripe.com → Developers → Webhooks

1. Click "Add endpoint"
2. Endpoint URL: `https://fvstedbsjiqvryqpnmzl.supabase.co/functions/v1/stripe-webhook-handler`
3. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click "Add endpoint"
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Update `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

## 📝 Verification Checklist

Before proceeding to Phase 3:

- [ ] `.env` file created with all required values
- [ ] Supabase storage bucket `question-assets` (public) created
- [ ] Supabase storage bucket `profile-pictures` (private) created with RLS
- [ ] Stripe product "Tafawoq Premium Monthly" created
- [ ] Stripe price created and ID added to `.env`
- [ ] Stripe webhook configured with signing secret in `.env`
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npx expo start` to verify app launches without errors

## 🚀 Next Phase

Once all manual tasks are complete, proceed to **Phase 3: User Story 1 (US1)**
- Authentication & Profile Setup
- Tasks T064-T090 in tasks.md

## 📚 References

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Gemini AI Console**: https://console.cloud.google.com
- **Quickstart Guide**: See `specs/main/quickstart.md` for detailed setup instructions
