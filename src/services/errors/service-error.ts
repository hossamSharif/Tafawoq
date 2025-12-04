/**
 * Service Error Class
 *
 * Base error class for all service layer errors
 * Per client-services.md contract specification
 */

import { ServiceErrorCode } from '@/types/api.types';

/**
 * Service Error with Arabic messages
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

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      arabicMessage: this.arabicMessage,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };
  }

  /**
   * Get user-facing error message (Arabic)
   */
  getUserMessage(): string {
    return this.arabicMessage;
  }
}

/**
 * Error factory functions for common error scenarios
 */

export const createAuthError = (
  code: ServiceErrorCode,
  message: string,
  arabicMessage: string
): ServiceError => {
  return new ServiceError(code, message, arabicMessage, 401);
};

export const createValidationError = (
  message: string,
  arabicMessage: string,
  details?: Record<string, any>
): ServiceError => {
  return new ServiceError(
    ServiceErrorCode.VALIDATION_ERROR,
    message,
    arabicMessage,
    400,
    details
  );
};

export const createNotFoundError = (
  resource: string,
  arabicMessage: string = 'المحتوى المطلوب غير موجود'
): ServiceError => {
  return new ServiceError(
    ServiceErrorCode.NOT_FOUND,
    `${resource} not found`,
    arabicMessage,
    404
  );
};

export const createUnauthorizedError = (
  arabicMessage: string = 'يجب تسجيل الدخول للوصول إلى هذا المحتوى'
): ServiceError => {
  return new ServiceError(
    ServiceErrorCode.UNAUTHORIZED,
    'Unauthorized',
    arabicMessage,
    401
  );
};

export const createForbiddenError = (
    arabicMessage: string = 'ليس لديك صلاحية للوصول إلى هذا المحتوى'
): ServiceError => {
  return new ServiceError(
    ServiceErrorCode.FORBIDDEN,
    'Forbidden',
    arabicMessage,
    403
  );
};

export const createRateLimitError = (
  arabicMessage: string = 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً'
): ServiceError => {
  return new ServiceError(
    ServiceErrorCode.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded',
    arabicMessage,
    429
  );
};

export const createServerError = (
  message: string = 'Internal server error',
  arabicMessage: string = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً'
): ServiceError => {
  return new ServiceError(
    ServiceErrorCode.SERVER_ERROR,
    message,
    arabicMessage,
    500
  );
};

export const createNetworkError = (
  arabicMessage: string = 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت'
): ServiceError => {
  return new ServiceError(
    ServiceErrorCode.NETWORK_ERROR,
    'Network error',
    arabicMessage
  );
};

/**
 * Parse Supabase error to ServiceError
 */
export const parseSupabaseError = (error: any): ServiceError => {
  // Supabase auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return createAuthError(
      ServiceErrorCode.AUTH_INVALID_CREDENTIALS,
      'Invalid login credentials',
      'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    );
  }

  if (error.message?.includes('Email not confirmed')) {
    return createAuthError(
      ServiceErrorCode.AUTH_EMAIL_NOT_CONFIRMED,
      'Email not confirmed',
      'البريد الإلكتروني غير مؤكد. يرجى التحقق من بريدك الإلكتروني'
    );
  }

  if (error.message?.includes('User not found')) {
    return createAuthError(
      ServiceErrorCode.AUTH_USER_NOT_FOUND,
      'User not found',
      'المستخدم غير موجود'
    );
  }

  if (error.message?.includes('User already registered')) {
    return createAuthError(
      ServiceErrorCode.AUTH_EMAIL_EXISTS,
      'Email already exists',
      'البريد الإلكتروني مستخدم بالفعل'
    );
  }

  if (error.code === '23505') {
    // PostgreSQL unique constraint violation
    return new ServiceError(
      ServiceErrorCode.VALIDATION_ERROR,
      'Duplicate entry',
      'هذا الإدخال موجود بالفعل',
      400
    );
  }

  if (error.code === '23503') {
    // PostgreSQL foreign key violation
    return new ServiceError(
      ServiceErrorCode.VALIDATION_ERROR,
      'Invalid reference',
      'مرجع غير صالح',
      400
    );
  }

  // Default server error
  return createServerError(error.message);
};

/**
 * Parse Stripe error to ServiceError
 */
export const parseStripeError = (error: any): ServiceError => {
  const type = error.type;

  switch (type) {
    case 'card_error':
      return new ServiceError(
        ServiceErrorCode.SUBSCRIPTION_PAYMENT_FAILED,
        error.message,
        'فشلت عملية الدفع. يرجى التحقق من بطاقتك والمحاولة مرة أخرى',
        402
      );

    case 'invalid_request_error':
      return createValidationError(
        error.message,
        'بيانات الطلب غير صالحة'
      );

    case 'rate_limit_error':
      return createRateLimitError();

    default:
      return createServerError(error.message);
  }
};

/**
 * Check if error is a ServiceError
 */
export const isServiceError = (error: any): error is ServiceError => {
  return error instanceof ServiceError;
};

/**
 * Get Arabic error message from any error
 */
export const getErrorMessage = (error: any): string => {
  if (isServiceError(error)) {
    return error.arabicMessage;
  }

  if (error instanceof Error) {
    return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى';
  }

  return 'حدث خطأ غير معروف';
};
