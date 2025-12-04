/**
 * Gemini Service Error Class
 *
 * Specialized error class for AI generation failures
 * Per gemini-ai.md contract specification
 */

import { ServiceError } from './service-error';
import { ServiceErrorCode } from '@/types/api.types';

/**
 * Gemini Error Types
 */
export enum GeminiErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  INVALID_PROMPT = 'INVALID_PROMPT',
  CONTENT_FILTER = 'CONTENT_FILTER',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Gemini Service Error
 */
export class GeminiServiceError extends ServiceError {
  geminiType: GeminiErrorType;
  retryable: boolean;

  constructor(
    geminiType: GeminiErrorType,
    code: ServiceErrorCode,
    message: string,
    arabicMessage: string,
    retryable: boolean = false,
    details?: Record<string, any>
  ) {
    super(code, message, arabicMessage, undefined, details);
    this.name = 'GeminiServiceError';
    this.geminiType = geminiType;
    this.retryable = retryable;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.retryable;
  }
}

/**
 * Create Gemini error from API response
 */
export const createGeminiError = (
  type: GeminiErrorType,
  message: string,
  arabicMessage: string,
  retryable: boolean = false
): GeminiServiceError => {
  let code: ServiceErrorCode;

  switch (type) {
    case GeminiErrorType.QUOTA_EXCEEDED:
      code = ServiceErrorCode.AI_QUOTA_EXCEEDED;
      break;
    case GeminiErrorType.TIMEOUT:
      code = ServiceErrorCode.AI_TIMEOUT;
      break;
    case GeminiErrorType.INVALID_PROMPT:
      code = ServiceErrorCode.VALIDATION_ERROR;
      break;
    case GeminiErrorType.CONTENT_FILTER:
      code = ServiceErrorCode.VALIDATION_ERROR;
      break;
    case GeminiErrorType.NETWORK_ERROR:
      code = ServiceErrorCode.NETWORK_ERROR;
      break;
    default:
      code = ServiceErrorCode.AI_GENERATION_FAILED;
  }

  return new GeminiServiceError(type, code, message, arabicMessage, retryable);
};

/**
 * Parse Gemini API error response
 */
export const parseGeminiError = (error: any): GeminiServiceError => {
  const errorMessage = error.message || error.error?.message || 'Unknown error';

  // Quota exceeded
  if (
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    error.status === 429
  ) {
    return createGeminiError(
      GeminiErrorType.QUOTA_EXCEEDED,
      'Gemini API quota exceeded',
      'تم تجاوز حد استخدام توليد الأسئلة. يرجى المحاولة لاحقاً',
      true // Retryable after delay
    );
  }

  // Timeout
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('deadline') ||
    error.code === 'ETIMEDOUT'
  ) {
    return createGeminiError(
      GeminiErrorType.TIMEOUT,
      'Gemini API timeout',
      'انتهت مهلة توليد الأسئلة. يرجى المحاولة مرة أخرى',
      true // Retryable
    );
  }

  // Invalid prompt
  if (
    errorMessage.includes('invalid prompt') ||
    errorMessage.includes('invalid request') ||
    error.status === 400
  ) {
    return createGeminiError(
      GeminiErrorType.INVALID_PROMPT,
      'Invalid prompt for Gemini API',
      'خطأ في إعدادات توليد الأسئلة',
      false // Not retryable
    );
  }

  // Content filter (safety)
  if (
    errorMessage.includes('content filter') ||
    errorMessage.includes('safety') ||
    errorMessage.includes('blocked')
  ) {
    return createGeminiError(
      GeminiErrorType.CONTENT_FILTER,
      'Content filtered by Gemini API',
      'تم رفض المحتوى من قبل نظام السلامة',
      false // Not retryable
    );
  }

  // Network error
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND')
  ) {
    return createGeminiError(
      GeminiErrorType.NETWORK_ERROR,
      'Network error connecting to Gemini API',
      'خطأ في الاتصال بخدمة توليد الأسئلة',
      true // Retryable
    );
  }

  // API error (server-side)
  if (error.status >= 500) {
    return createGeminiError(
      GeminiErrorType.API_ERROR,
      'Gemini API server error',
      'خطأ في خدمة توليد الأسئلة. يرجى المحاولة لاحقاً',
      true // Retryable
    );
  }

  // Unknown error
  return createGeminiError(
    GeminiErrorType.UNKNOWN,
    errorMessage,
    'حدث خطأ أثناء توليد الأسئلة. يرجى المحاولة مرة أخرى',
    true // Retryable by default
  );
};

/**
 * Create exam generation error
 */
export const createExamGenerationError = (
  originalError: any
): GeminiServiceError => {
  const geminiError = parseGeminiError(originalError);

  return new GeminiServiceError(
    geminiError.geminiType,
    ServiceErrorCode.EXAM_GENERATION_FAILED,
    'Exam generation failed',
    geminiError.arabicMessage,
    geminiError.retryable,
    {
      originalError: originalError.message,
      type: geminiError.geminiType,
    }
  );
};

/**
 * Create practice generation error
 */
export const createPracticeGenerationError = (
  originalError: any
): GeminiServiceError => {
  const geminiError = parseGeminiError(originalError);

  return new GeminiServiceError(
    geminiError.geminiType,
    ServiceErrorCode.PRACTICE_GENERATION_FAILED,
    'Practice generation failed',
    geminiError.arabicMessage,
    geminiError.retryable,
    {
      originalError: originalError.message,
      type: geminiError.geminiType,
    }
  );
};

/**
 * Check if error is a GeminiServiceError
 */
export const isGeminiError = (error: any): error is GeminiServiceError => {
  return error instanceof GeminiServiceError;
};

/**
 * Get retry delay for Gemini errors (exponential backoff)
 */
export const getRetryDelay = (attemptNumber: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = baseDelay * Math.pow(2, attemptNumber - 1);
  return Math.min(delay, maxDelay);
};
