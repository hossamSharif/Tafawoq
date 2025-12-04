/**
 * API Type Definitions
 *
 * Types for API responses, errors, and service layer
 */

/**
 * Service error codes
 */
export enum ServiceErrorCode {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_NOT_CONFIRMED = 'AUTH_EMAIL_NOT_CONFIRMED',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_EXISTS = 'AUTH_EMAIL_EXISTS',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',

  // Subscription errors
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_PAYMENT_FAILED = 'SUBSCRIPTION_PAYMENT_FAILED',
  SUBSCRIPTION_ALREADY_PREMIUM = 'SUBSCRIPTION_ALREADY_PREMIUM',
  SUBSCRIPTION_INVALID_TIER = 'SUBSCRIPTION_INVALID_TIER',

  // Exam errors
  EXAM_QUOTA_EXCEEDED = 'EXAM_QUOTA_EXCEEDED',
  EXAM_NOT_FOUND = 'EXAM_NOT_FOUND',
  EXAM_ALREADY_COMPLETED = 'EXAM_ALREADY_COMPLETED',
  EXAM_GENERATION_FAILED = 'EXAM_GENERATION_FAILED',
  EXAM_INVALID_SUBMISSION = 'EXAM_INVALID_SUBMISSION',

  // Practice errors
  PRACTICE_QUOTA_EXCEEDED = 'PRACTICE_QUOTA_EXCEEDED',
  PRACTICE_NOT_FOUND = 'PRACTICE_NOT_FOUND',
  PRACTICE_ALREADY_COMPLETED = 'PRACTICE_ALREADY_COMPLETED',
  PRACTICE_GENERATION_FAILED = 'PRACTICE_GENERATION_FAILED',
  PRACTICE_INVALID_CONFIG = 'PRACTICE_INVALID_CONFIG',

  // Storage errors
  STORAGE_UPLOAD_FAILED = 'STORAGE_UPLOAD_FAILED',
  STORAGE_FILE_TOO_LARGE = 'STORAGE_FILE_TOO_LARGE',
  STORAGE_INVALID_FILE_TYPE = 'STORAGE_INVALID_FILE_TYPE',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',

  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // AI errors
  AI_GENERATION_FAILED = 'AI_GENERATION_FAILED',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_TIMEOUT = 'AI_TIMEOUT',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Service error class
 */
export class ServiceError extends Error {
  code: ServiceErrorCode;
  arabicMessage: string;
  statusCode?: number;
  details?: Record<string, any>;

  constructor(
    code: ServiceErrorCode,
    message: string,
    arabicMessage: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.arabicMessage = arabicMessage;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  arabicMessage?: string;
  details?: Record<string, any>;
}

/**
 * API response metadata
 */
export interface ApiMeta {
  timestamp: string;
  request_id?: string;
  version?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

/**
 * Service method result wrapper
 */
export type ServiceResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ServiceError;
};

/**
 * Async service method return type
 */
export type AsyncServiceResult<T> = Promise<ServiceResult<T>>;

/**
 * Service method options
 */
export interface ServiceOptions {
  signal?: AbortSignal; // For request cancellation
  timeout?: number; // Request timeout in ms
  retry?: boolean; // Enable retry on failure
  cache?: boolean; // Enable caching
}

/**
 * Supabase RPC call response
 */
export interface SupabaseRPCResponse<T> {
  data: T | null;
  error: {
    message: string;
    details: string;
    hint: string;
    code: string;
  } | null;
}

/**
 * Edge Function invocation response
 */
export interface EdgeFunctionResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * File upload result
 */
export interface FileUploadResult {
  path: string;
  url: string;
  size: number;
  mime_type: string;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T> {
  succeeded: T[];
  failed: Array<{
    item: T;
    error: ServiceError;
  }>;
  total: number;
  success_count: number;
  failure_count: number;
}
