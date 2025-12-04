/**
 * Gemini AI Configuration
 *
 * Important: Gemini API calls are made via Supabase Edge Functions for security.
 * The GEMINI_API_KEY is stored as a Supabase secret and NOT exposed to the client.
 *
 * This config file defines Edge Function URLs and client-side settings.
 */

// Environment variables validation
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

if (!SUPABASE_URL) {
  throw new Error(
    'Missing Supabase URL. Please check your .env file contains:\n' +
    '- EXPO_PUBLIC_SUPABASE_URL'
  );
}

/**
 * Supabase Edge Function URLs for Gemini AI operations
 */
export const geminiEdgeFunctions = {
  /**
   * Generate exam questions (40-question integrated exam)
   * POST /functions/v1/generate-exam-questions
   *
   * Request body:
   * - academic_track: 'scientific' | 'literary'
   * - subscription_tier: 'free' | 'premium'
   *
   * Response:
   * - questions: Question[]
   * - generation_time_ms: number
   */
  generateExamQuestions: `${SUPABASE_URL}/functions/v1/generate-exam-questions`,

  /**
   * Generate practice questions (customized practice session)
   * POST /functions/v1/generate-practice-questions
   *
   * Request body:
   * - section: 'verbal' | 'quantitative' | 'mixed'
   * - categories: string[]
   * - difficulty: 'easy' | 'medium' | 'hard'
   * - question_count: number
   * - subscription_tier: 'free' | 'premium'
   *
   * Response:
   * - questions: Question[]
   * - generation_time_ms: number
   */
  generatePracticeQuestions: `${SUPABASE_URL}/functions/v1/generate-practice-questions`,
} as const;

/**
 * Gemini API rate limits and quotas
 *
 * Free tier:
 * - Gemini 1.5 Flash: 15 RPM (requests per minute)
 * - Embedding API: 1,500 RPM
 * - Imagen 3: 100 images/day
 *
 * Paid tier:
 * - Gemini 1.5 Flash: 1,000 RPM, 4M TPM (tokens per minute)
 * - Embedding API: 1,500 RPM (same as free)
 * - Imagen 3: Higher limits
 *
 * Implementation: Edge Functions handle rate limiting server-side
 */
export const geminiQuotas = {
  textGeneration: {
    freeRPM: 15,
    paidRPM: 1000,
    tokenLimit: 4_000_000, // 4M tokens per minute
  },
  embedding: {
    rpm: 1500,
    dimensionality: 768, // text-embedding-004
  },
  imageGeneration: {
    freeDailyLimit: 100,
  },
} as const;

/**
 * Gemini model configurations
 */
export const geminiModels = {
  /**
   * Gemini 1.5 Flash
   * Used for: Question generation, improvement advice
   * Cost: $0.075 per 1M input tokens
   */
  textGeneration: 'gemini-1.5-flash',

  /**
   * Gemini Embedding Model
   * Used for: Semantic search, question similarity
   * Dimensions: 768
   */
  embedding: 'text-embedding-004',

  /**
   * Imagen 3
   * Used for: Geometry diagrams, visual question elements
   */
  imageGeneration: 'imagen-3',
} as const;

/**
 * Client-side request configuration
 */
export const geminiClientConfig = {
  /**
   * Maximum time to wait for AI generation (milliseconds)
   * Exam generation target: < 20 seconds (per spec.md SC-002)
   * Practice generation target: < 10 seconds
   */
  timeout: {
    exam: 30000, // 30 seconds with buffer
    practice: 15000, // 15 seconds with buffer
  },

  /**
   * Retry configuration for failed requests
   */
  retry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
  },

  /**
   * Error messages (Arabic)
   */
  errorMessages: {
    timeout: 'انتهت مهلة توليد الأسئلة. يرجى المحاولة مرة أخرى.',
    quotaExceeded: 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.',
    networkError: 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.',
    unexpectedError: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  },
} as const;

/**
 * Arabic prompt templates
 * These are sent to Edge Functions which inject them into Gemini prompts
 */
export const arabicPromptTemplates = {
  /**
   * System prompt for question generation
   */
  systemPrompt: `أنت مولد أسئلة اختبار القدرات السعودية. يجب أن تكون الأسئلة:
- باللغة العربية الفصحى
- مناسبة للمسار الدراسي (علمي أو أدبي)
- واضحة ودقيقة
- تحتوي على 4 خيارات بإجابة واحدة صحيحة
- متنوعة في الصعوبة والمحتوى`,

  /**
   * Categories in Arabic
   */
  categories: {
    quantitative: {
      basic_operations: 'العمليات الأساسية',
      geometry: 'الهندسة',
      roots_exponents: 'الأسس والجذور',
    },
    verbal: {
      analogies: 'التناظر اللفظي',
      sentence_completion: 'إكمال الجمل',
      contextual_error: 'الخطأ السياقي',
      odd_word_out: 'المفردة الشاذة',
      reading_comprehension: 'استيعاب المقروء',
    },
  },
} as const;
