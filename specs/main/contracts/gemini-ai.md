# Gemini AI Integration Contract

**Feature**: Tafawoq Platform
**Date**: 2025-12-03
**Purpose**: Define Gemini AI service interfaces for question generation, embeddings, and image generation.

## Overview

This document specifies the integration contracts for Google Gemini AI models used in the Tafawoq platform. Three distinct Gemini capabilities are utilized: text generation (Gemini 1.5 Flash), text embeddings (text-embedding-004), and image generation (Imagen 3).

---

## 1. Gemini Text Generation Service

### 1.1 QuestionGenerationService Interface

**File**: `src/services/gemini/question-generation.service.ts`

**Purpose**: Generate Arabic exam and practice questions using Gemini 1.5 Flash model.

```typescript
export interface QuestionGenerationService {
  /**
   * Generate full exam questions (40 questions, mixed sections)
   */
  generateExamQuestions(params: ExamGenerationParams): Promise<GeneratedQuestion[]>;

  /**
   * Generate practice questions for specific categories
   */
  generatePracticeQuestions(params: PracticeGenerationParams): Promise<GeneratedQuestion[]>;

  /**
   * Generate improvement advice based on user performance
   */
  generateImprovementAdvice(performance: PerformanceData): Promise<string>;

  /**
   * Generate solution explanation for specific question
   */
  generateExplanation(question: Question, userAnswer: string): Promise<string>;
}

// Types
export interface ExamGenerationParams {
  academicTrack: 'scientific' | 'literary';
  totalQuestions: number; // 40 for full exam
  contextQuestions: ContextQuestion[]; // Retrieved from vector search
}

export interface PracticeGenerationParams {
  section: 'verbal' | 'quantitative' | 'mixed';
  categories: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  contextQuestions: ContextQuestion[];
}

export interface ContextQuestion {
  id: string;
  section: string;
  category: string;
  difficulty: string;
  questionText: string;
  similarityScore: number; // From vector search
}

export interface GeneratedQuestion {
  section: 'verbal' | 'quantitative';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string; // Arabic text
  hasImage: boolean;
  imagePrompt?: string; // For Imagen 3 if hasImage=true
  options: string[]; // 4 options in Arabic
  correctAnswer: string;
  explanation: string; // Solution walkthrough in Arabic
}

export interface PerformanceData {
  verbalScore: number;
  quantitativeScore: number;
  strengths: { category: string; score: number }[];
  weaknesses: { category: string; score: number }[];
  academicTrack: 'scientific' | 'literary';
}
```

### 1.2 Prompt Templates

#### Full Exam Generation Prompt

```typescript
const EXAM_GENERATION_PROMPT = `
أنت مولّد أسئلة اختبارات القدرات السعودية. قم بإنشاء ${totalQuestions} سؤال لاختبار قدرات متكامل.

**المسار الأكاديمي**: ${academicTrack === 'scientific' ? 'علمي' : 'أدبي'}

**التوزيع المطلوب**:
- القسم اللفظي (20 سؤال):
  * التناظر اللفظي: 6 أسئلة
  * إكمال الجمل: 5 أسئلة
  * الخطأ السياقي: 4 أسئلة
  * المفردة الشاذة: 3 أسئلة
  * استيعاب المقروء: 2 أسئلة

- القسم الكمي (20 سؤال):
  * العمليات الأساسية: 8 أسئلة
  * الهندسة: 7 أسئلة (مع رسوم توضيحية)
  * الأسس والجذور: 5 أسئلة

**أسئلة مرجعية للسياق**:
${contextQuestions.map(q => `- ${q.category}: ${q.questionText.substring(0, 100)}...`).join('\n')}

**متطلبات الإخراج**:
1. كل سؤال يجب أن يكون باللغة العربية الفصحى
2. أربعة خيارات لكل سؤال (أ، ب، ج، د)
3. الإجابة الصحيحة واحدة فقط
4. شرح تفصيلي للحل (للمستخدمين المميزين)
5. للأسئلة الهندسية، حدد has_image: true وقدم image_prompt بالإنجليزية

**صيغة JSON المطلوبة**:
[
  {
    "section": "verbal" | "quantitative",
    "category": "string",
    "difficulty": "easy" | "medium" | "hard",
    "questionText": "نص السؤال بالعربية",
    "hasImage": boolean,
    "imagePrompt": "English description if hasImage=true",
    "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"],
    "correctAnswer": "خيار أ",
    "explanation": "شرح الحل خطوة بخطوة"
  }
]

قم بإنشاء الأسئلة الآن بصيغة JSON فقط، بدون نص إضافي.
`;
```

#### Practice Generation Prompt

```typescript
const PRACTICE_GENERATION_PROMPT = `
أنت مولّد أسئلة تدريب لاختبارات القدرات السعودية.

**القسم**: ${section === 'verbal' ? 'اللفظي' : section === 'quantitative' ? 'الكمي' : 'مختلط'}
**الفئات المطلوبة**: ${categories.join(', ')}
**مستوى الصعوبة**: ${difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'}
**عدد الأسئلة**: ${questionCount}

**أسئلة مرجعية للسياق**:
${contextQuestions.map(q => `- ${q.category} (${q.similarityScore.toFixed(2)}): ${q.questionText.substring(0, 100)}...`).join('\n')}

**متطلبات**:
1. ركّز على الفئات المحددة فقط
2. التزم بمستوى الصعوبة المطلوب
3. تنويع أنماط الأسئلة ضمن نفس الفئة
4. استخدم السياق من الأسئلة المرجعية للحفاظ على الجودة

**صيغة JSON المطلوبة** (نفس الصيغة السابقة)
`;
```

#### Improvement Advice Prompt

```typescript
const IMPROVEMENT_ADVICE_PROMPT = `
أنت مستشار تعليمي لطلاب اختبار القدرات السعودية.

**نتائج الطالب**:
- الدرجة اللفظية: ${performanceData.verbalScore}%
- الدرجة الكمية: ${performanceData.quantitativeScore}%
- المسار الأكاديمي: ${performanceData.academicTrack === 'scientific' ? 'علمي' : 'أدبي'}

**نقاط القوة**:
${performanceData.strengths.map(s => `- ${s.category}: ${s.score}%`).join('\n')}

**نقاط الضعف**:
${performanceData.weaknesses.map(w => `- ${w.category}: ${w.score}%`).join('\n')}

**المطلوب**:
قدم نصائح تحسين شخصية (200-300 كلمة) تتضمن:
1. تحليل النقاط القوية والضعيفة
2. استراتيجيات محددة للتحسين في المجالات الضعيفة
3. توصيات بتدريبات مخصصة (مع ذكر الفئات المحددة)
4. تحفيز إيجابي ونصائح عملية
5. توزيع مقترح لوقت الدراسة

اكتب النصيحة باللغة العربية الفصحى، بأسلوب محفز وداعم.
`;
```

### 1.3 API Configuration

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiQuestionGenerator implements QuestionGenerationService {
  private genAI: GoogleGenerativeAI;
  private model: any; // GenerativeModel

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.9, // Higher creativity for question variety
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    });
  }

  async generateExamQuestions(params: ExamGenerationParams): Promise<GeneratedQuestion[]> {
    const prompt = this.buildExamPrompt(params);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const questions = JSON.parse(response);

      // Validate response structure
      if (!Array.isArray(questions) || questions.length !== params.totalQuestions) {
        throw new Error('Invalid question count from AI');
      }

      return questions;
    } catch (error) {
      throw new GeminiServiceError('GENERATION_FAILED', error.message);
    }
  }

  async generateImprovementAdvice(performance: PerformanceData): Promise<string> {
    const prompt = this.buildImprovementPrompt(performance);

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7, // More focused advice
        maxOutputTokens: 1024
      }
    });

    return result.response.text();
  }

  private buildExamPrompt(params: ExamGenerationParams): string {
    // Implementation of EXAM_GENERATION_PROMPT with variable substitution
  }

  private buildImprovementPrompt(performance: PerformanceData): string {
    // Implementation of IMPROVEMENT_ADVICE_PROMPT with variable substitution
  }
}
```

---

## 2. Gemini Embedding Service

### 2.1 EmbeddingService Interface

**File**: `src/services/gemini/embedding.service.ts`

**Purpose**: Generate text embeddings for semantic search using Gemini text-embedding-004 model.

```typescript
export interface EmbeddingService {
  /**
   * Generate embedding for user's exam/practice selection
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Generate embeddings in batch for multiple texts
   */
  generateEmbeddingsBatch(texts: string[]): Promise<number[][]>;

  /**
   * Embed question template for storage in vector database
   */
  embedQuestionTemplate(question: QuestionTemplate): Promise<QuestionEmbedding>;
}

// Types
export interface QuestionTemplate {
  id: string;
  section: string;
  category: string;
  difficulty: string;
  questionText: string;
}

export interface QuestionEmbedding {
  questionTemplateId: string;
  promptContext: string; // Serialized: "quantitative geometry medium"
  embedding: number[]; // 768-dimensional vector
  metadata: {
    section: string;
    categories: string[];
    difficulty: string;
  };
}
```

### 2.2 API Configuration

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiEmbeddingService implements EmbeddingService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({
      model: 'text-embedding-004'
    });

    try {
      const result = await model.embedContent(text);
      return result.embedding.values; // 768-dimensional vector
    } catch (error) {
      throw new GeminiServiceError('EMBEDDING_FAILED', error.message);
    }
  }

  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const model = this.genAI.getGenerativeModel({
      model: 'text-embedding-004'
    });

    try {
      const result = await model.batchEmbedContents({
        requests: texts.map(text => ({ content: { parts: [{ text }] } }))
      });

      return result.embeddings.map(e => e.values);
    } catch (error) {
      throw new GeminiServiceError('BATCH_EMBEDDING_FAILED', error.message);
    }
  }

  async embedQuestionTemplate(question: QuestionTemplate): Promise<QuestionEmbedding> {
    // Serialize question context for embedding
    const promptContext = `${question.section} ${question.category} ${question.difficulty}`;
    const contextWithText = `${promptContext}\n${question.questionText}`;

    const embedding = await this.generateEmbedding(contextWithText);

    return {
      questionTemplateId: question.id,
      promptContext,
      embedding,
      metadata: {
        section: question.section,
        categories: [question.category],
        difficulty: question.difficulty
      }
    };
  }
}
```

### 2.3 Embedding Usage Workflow

```typescript
// 1. User starts practice: "quantitative, geometry, medium difficulty"
const userSelection = {
  section: 'quantitative',
  categories: ['geometry'],
  difficulty: 'medium'
};

// 2. Serialize to text and embed
const embeddingService = new GeminiEmbeddingService(GEMINI_API_KEY);
const promptText = `${userSelection.section} ${userSelection.categories.join(' ')} ${userSelection.difficulty}`;
const queryEmbedding = await embeddingService.generateEmbedding(promptText);

// 3. Query Supabase vector search
const { data: similarQuestions } = await supabase.rpc('search_similar_questions', {
  query_embedding: queryEmbedding,
  filter_section: userSelection.section,
  filter_difficulty: userSelection.difficulty,
  result_limit: 20
});

// 4. Pass retrieved questions to Gemini for generation
const generatedQuestions = await questionGenerator.generatePracticeQuestions({
  section: userSelection.section,
  categories: userSelection.categories,
  difficulty: userSelection.difficulty,
  questionCount: 10,
  contextQuestions: similarQuestions
});
```

---

## 3. Imagen 3 Image Generation Service

### 3.1 ImageGenerationService Interface

**File**: `src/services/gemini/image-generation.service.ts`

**Purpose**: Generate diagrams and illustrations for geometry and math questions using Imagen 3.

```typescript
export interface ImageGenerationService {
  /**
   * Generate image from text prompt
   */
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<GeneratedImage>;

  /**
   * Generate images in batch for multiple prompts
   */
  generateImagesBatch(prompts: string[]): Promise<GeneratedImage[]>;

  /**
   * Upload generated image to Supabase Storage and return public URL
   */
  uploadImageToStorage(imageData: Buffer, fileName: string): Promise<string>;
}

// Types
export interface ImageGenerationOptions {
  aspectRatio?: '1:1' | '16:9' | '9:16';
  numberOfImages?: number; // Default 1
  safetyLevel?: 'none' | 'low' | 'medium' | 'high';
}

export interface GeneratedImage {
  imageData: Buffer; // Raw image bytes
  mimeType: string;  // e.g., 'image/png'
  width: number;
  height: number;
}
```

### 3.2 API Configuration

**Note**: As of December 2025, Imagen 3 may require separate Google Cloud Vertex AI setup. This contract assumes future SDK integration.

```typescript
// Placeholder for Imagen 3 integration (awaiting official SDK)
export class ImagenImageGenerator implements ImageGenerationService {
  private apiKey: string;
  private supabaseStorageClient: any;

  constructor(apiKey: string, storageClient: any) {
    this.apiKey = apiKey;
    this.supabaseStorageClient = storageClient;
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<GeneratedImage> {
    // Example prompt for geometry question:
    // "Create a clear geometric diagram showing a right triangle ABC with angle C = 90 degrees,
    //  side AC = 6 cm, side BC = 8 cm. Label all sides and angles. Use clean lines and Arabic numerals.
    //  High contrast, educational style."

    try {
      // Placeholder for Imagen 3 API call
      const response = await fetch('https://imagen.googleapis.com/v3/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          aspectRatio: options?.aspectRatio || '1:1',
          numberOfImages: options?.numberOfImages || 1,
          safetyLevel: options?.safetyLevel || 'medium'
        })
      });

      const data = await response.json();

      // Parse image data
      const imageBuffer = Buffer.from(data.images[0].bytesBase64Encoded, 'base64');

      return {
        imageData: imageBuffer,
        mimeType: 'image/png',
        width: data.images[0].width,
        height: data.images[0].height
      };
    } catch (error) {
      throw new GeminiServiceError('IMAGE_GENERATION_FAILED', error.message);
    }
  }

  async uploadImageToStorage(imageData: Buffer, fileName: string): Promise<string> {
    const filePath = `question-images/${fileName}`;

    const { data, error } = await this.supabaseStorageClient
      .from('question-assets')
      .upload(filePath, imageData, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new GeminiServiceError('STORAGE_UPLOAD_FAILED', error.message);
    }

    // Get public URL
    const { data: publicUrlData } = this.supabaseStorageClient
      .from('question-assets')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
}
```

### 3.3 Image Prompt Templates

```typescript
// Geometry diagram prompt template
const GEOMETRY_PROMPT_TEMPLATE = `
Create a clear geometric diagram for a Saudi aptitude test question.

Diagram requirements:
- ${geometryDescription} (e.g., "right triangle with sides 3-4-5")
- Label all vertices, sides, and angles in Arabic
- Use clean, professional lines (black on white background)
- High contrast for mobile device readability
- Educational style, not decorative
- Include measurements and angle markers as specified
- Image size: 800x800px, PNG format

The diagram should be suitable for a 15-year-old student preparing for standardized tests.
`;

// Math illustration prompt template
const MATH_ILLUSTRATION_TEMPLATE = `
Create a mathematical illustration for a Saudi aptitude test question.

Illustration content:
- ${mathConcept} (e.g., "number line showing fractions between 0 and 1")
- Use Arabic numerals and labels
- Clean, minimalist style
- High contrast for mobile screens
- No decorative elements
- Professional educational design

Target audience: High school students preparing for college entrance exams.
`;
```

---

## 4. Error Handling

### 4.1 Custom Error Class

```typescript
export class GeminiServiceError extends Error {
  constructor(
    public code: GeminiErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

export type GeminiErrorCode =
  | 'GENERATION_FAILED'
  | 'EMBEDDING_FAILED'
  | 'BATCH_EMBEDDING_FAILED'
  | 'IMAGE_GENERATION_FAILED'
  | 'STORAGE_UPLOAD_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_API_KEY'
  | 'INVALID_RESPONSE_FORMAT';
```

### 4.2 Rate Limit Handling

```typescript
export class RateLimitedGeminiService {
  private requestQueue: (() => Promise<any>)[] = [];
  private processing = false;
  private requestCount = 0;
  private readonly MAX_RPM = 1000; // Gemini 1.5 Flash paid tier

  async enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.requestQueue.length > 0) {
      // Check if we've exceeded rate limit
      if (this.requestCount >= this.MAX_RPM) {
        await this.waitUntilRateLimitReset();
      }

      const request = this.requestQueue.shift();
      if (request) {
        await request();
        this.requestCount++;
      }
    }

    this.processing = false;
  }

  private async waitUntilRateLimitReset() {
    // Wait 60 seconds (1 minute window for RPM)
    await new Promise(resolve => setTimeout(resolve, 60000));
    this.requestCount = 0;
  }
}
```

---

## 5. Cost Monitoring

### 5.1 Token Usage Tracking

```typescript
export interface TokenUsageTracker {
  trackGeneration(tokens: number, model: string): void;
  trackEmbedding(tokens: number): void;
  trackImageGeneration(imageCount: number): void;
  getUsageSummary(): UsageSummary;
}

export interface UsageSummary {
  textGenerationTokens: number;
  embeddingTokens: number;
  imagesGenerated: number;
  estimatedCostUSD: number;
}

// Pricing (as of December 2025)
const PRICING = {
  GEMINI_FLASH_INPUT: 0.075 / 1_000_000,    // Per token
  GEMINI_FLASH_OUTPUT: 0.30 / 1_000_000,    // Per token
  EMBEDDING: 0.00001 / 1_000,                // Per 1K tokens
  IMAGEN_3: 0.04                             // Per image (paid tier estimate)
};
```

---

**Contract Status**: Complete - Ready for implementation

**Implementation Notes**:
- Gemini 1.5 Flash is production-ready via @google/generative-ai SDK
- text-embedding-004 is available via same SDK
- Imagen 3 integration may require Vertex AI setup (monitor Google Cloud documentation for React Native compatibility)
