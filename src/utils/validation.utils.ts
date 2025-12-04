/**
 * Input Validation Utilities
 *
 * Provides validation functions for user inputs with Arabic error messages.
 * Used across authentication, profile setup, and exam/practice forms.
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string; // Arabic error message
}

/**
 * Validate email address format
 * @param email Email address to validate
 * @returns Validation result with Arabic error message
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'البريد الإلكتروني مطلوب',
    };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'البريد الإلكتروني غير صالح',
    };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 *
 * @param password Password to validate
 * @returns Validation result with Arabic error message
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      error: 'كلمة المرور مطلوبة',
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل',
    };
  }

  return { isValid: true };
};

/**
 * Validate password confirmation match
 * @param password Original password
 * @param confirmPassword Confirmation password
 * @returns Validation result
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'كلمات المرور غير متطابقة',
    };
  }

  return { isValid: true };
};

/**
 * Validate OTP (One-Time Password) code
 * @param otp OTP code (6 digits)
 * @returns Validation result
 */
export const validateOTP = (otp: string): ValidationResult => {
  if (!otp || otp.trim() === '') {
    return {
      isValid: false,
      error: 'رمز التحقق مطلوب',
    };
  }

  if (!/^\d{6}$/.test(otp)) {
    return {
      isValid: false,
      error: 'رمز التحقق يجب أن يكون 6 أرقام',
    };
  }

  return { isValid: true };
};

/**
 * Validate academic track selection
 * @param track Academic track ('scientific' | 'literary')
 * @returns Validation result
 */
export const validateAcademicTrack = (
  track: string
): ValidationResult => {
  if (!track || (track !== 'scientific' && track !== 'literary')) {
    return {
      isValid: false,
      error: 'المسار الدراسي مطلوب',
    };
  }

  return { isValid: true };
};

/**
 * Validate question count for practice sessions
 * @param count Question count
 * @param maxCount Maximum allowed count based on subscription tier
 * @returns Validation result
 */
export const validateQuestionCount = (
  count: number,
  maxCount: number
): ValidationResult => {
  if (!count || count < 1) {
    return {
      isValid: false,
      error: 'عدد الأسئلة يجب أن يكون 1 على الأقل',
    };
  }

  if (count > maxCount) {
    return {
      isValid: false,
      error: `عدد الأسئلة لا يمكن أن يتجاوز ${maxCount}`,
    };
  }

  return { isValid: true };
};

/**
 * Validate category selection for practice
 * @param categories Selected categories array
 * @returns Validation result
 */
export const validateCategories = (categories: string[]): ValidationResult => {
  if (!categories || categories.length === 0) {
    return {
      isValid: false,
      error: 'يجب اختيار فئة واحدة على الأقل',
    };
  }

  return { isValid: true };
};

/**
 * Validate file upload size
 * @param fileSize File size in bytes
 * @param maxSizeMB Maximum size in megabytes
 * @returns Validation result
 */
export const validateFileSize = (
  fileSize: number,
  maxSizeMB: number = 5
): ValidationResult => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileSize > maxSizeBytes) {
    return {
      isValid: false,
      error: `حجم الملف يجب أن لا يتجاوز ${maxSizeMB} ميغابايت`,
    };
  }

  return { isValid: true };
};

/**
 * Validate file type for profile pictures
 * @param fileType MIME type (e.g., 'image/jpeg')
 * @param allowedTypes Allowed MIME types
 * @returns Validation result
 */
export const validateFileType = (
  fileType: string,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): ValidationResult => {
  if (!allowedTypes.includes(fileType)) {
    return {
      isValid: false,
      error: 'نوع الملف غير مدعوم. الرجاء استخدام JPEG أو PNG',
    };
  }

  return { isValid: true };
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param input User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate Arabic text input
 * Ensures text contains Arabic characters
 * @param text Text to validate
 * @returns Validation result
 */
export const validateArabicText = (text: string): ValidationResult => {
  if (!text || text.trim() === '') {
    return {
      isValid: false,
      error: 'النص مطلوب',
    };
  }

  // Check if text contains Arabic characters
  const arabicRegex = /[\u0600-\u06FF]/;
  if (!arabicRegex.test(text)) {
    return {
      isValid: false,
      error: 'النص يجب أن يحتوي على أحرف عربية',
    };
  }

  return { isValid: true };
};

/**
 * Validate text length
 * @param text Text to validate
 * @param minLength Minimum length
 * @param maxLength Maximum length
 * @returns Validation result
 */
export const validateTextLength = (
  text: string,
  minLength: number = 1,
  maxLength: number = 1000
): ValidationResult => {
  if (!text || text.trim() === '') {
    return {
      isValid: false,
      error: 'النص مطلوب',
    };
  }

  const trimmedLength = text.trim().length;

  if (trimmedLength < minLength) {
    return {
      isValid: false,
      error: `النص يجب أن يكون ${minLength} أحرف على الأقل`,
    };
  }

  if (trimmedLength > maxLength) {
    return {
      isValid: false,
      error: `النص لا يمكن أن يتجاوز ${maxLength} حرف`,
    };
  }

  return { isValid: true };
};

/**
 * Validate phone number (Saudi format)
 * @param phone Phone number
 * @returns Validation result
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'رقم الهاتف مطلوب',
    };
  }

  // Saudi phone number format: +966XXXXXXXXX or 05XXXXXXXX
  const saudiPhoneRegex = /^(\+966|0)?5\d{8}$/;

  if (!saudiPhoneRegex.test(phone.replace(/\s/g, ''))) {
    return {
      isValid: false,
      error: 'رقم الهاتف غير صالح',
    };
  }

  return { isValid: true };
};
