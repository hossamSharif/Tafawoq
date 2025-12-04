import NetInfo from '@react-native-community/netinfo';

/**
 * Network Utilities
 *
 * Handles network connectivity detection, error handling, and offline scenarios.
 * As per spec assumptions, the app is online-only (no offline support required).
 */

/**
 * Network connection state
 */
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string; // 'wifi' | 'cellular' | 'none' | 'unknown'
}

/**
 * Check current network connectivity status
 * @returns Network state
 */
export const checkNetworkStatus = async (): Promise<NetworkState> => {
  const state = await NetInfo.fetch();

  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
  };
};

/**
 * Subscribe to network status changes
 * @param callback Callback function called on network change
 * @returns Unsubscribe function
 */
export const subscribeToNetworkChanges = (
  callback: (state: NetworkState) => void
): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    callback({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });
  });

  return unsubscribe;
};

/**
 * Network error types
 */
export enum NetworkErrorType {
  NO_CONNECTION = 'NO_CONNECTION',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Network error class with Arabic messages
 */
export class NetworkError extends Error {
  type: NetworkErrorType;
  statusCode?: number;
  arabicMessage: string;

  constructor(
    type: NetworkErrorType,
    message: string,
    arabicMessage: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'NetworkError';
    this.type = type;
    this.arabicMessage = arabicMessage;
    this.statusCode = statusCode;
  }
}

/**
 * Parse HTTP error response
 * @param error Error object from fetch or axios
 * @returns NetworkError with appropriate type and Arabic message
 */
export const parseNetworkError = (error: any): NetworkError => {
  // No internet connection
  if (!error.response && error.message?.includes('Network request failed')) {
    return new NetworkError(
      NetworkErrorType.NO_CONNECTION,
      'No internet connection',
      'لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك.'
    );
  }

  // Timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new NetworkError(
      NetworkErrorType.TIMEOUT,
      'Request timeout',
      'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.'
    );
  }

  // HTTP status codes
  const statusCode = error.response?.status;

  switch (statusCode) {
    case 401:
      return new NetworkError(
        NetworkErrorType.UNAUTHORIZED,
        'Unauthorized',
        'الجلسة منتهية. يرجى تسجيل الدخول مرة أخرى.',
        401
      );

    case 403:
      return new NetworkError(
        NetworkErrorType.FORBIDDEN,
        'Forbidden',
        'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
        403
      );

    case 404:
      return new NetworkError(
        NetworkErrorType.NOT_FOUND,
        'Not found',
        'المحتوى المطلوب غير موجود.',
        404
      );

    case 429:
      return new NetworkError(
        NetworkErrorType.RATE_LIMIT,
        'Rate limit exceeded',
        'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.',
        429
      );

    case 500:
    case 502:
    case 503:
      return new NetworkError(
        NetworkErrorType.SERVER_ERROR,
        'Server error',
        'خطأ في الخادم. يرجى المحاولة لاحقاً.',
        statusCode
      );

    default:
      return new NetworkError(
        NetworkErrorType.UNKNOWN,
        error.message || 'Unknown error',
        'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
        statusCode
      );
  }
};

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Retry function with exponential backoff
 * @param fn Async function to retry
 * @param config Retry configuration
 * @returns Result of the function
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig
): Promise<T> => {
  let lastError: Error;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on these error types
      const networkError = parseNetworkError(error);
      if (
        networkError.type === NetworkErrorType.UNAUTHORIZED ||
        networkError.type === NetworkErrorType.FORBIDDEN ||
        networkError.type === NetworkErrorType.NOT_FOUND
      ) {
        throw networkError;
      }

      // Last attempt - throw error
      if (attempt === config.maxRetries) {
        throw networkError;
      }

      // Wait before retry
      await sleep(delay);

      // Exponential backoff
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }
  }

  throw lastError!;
};

/**
 * Sleep utility for delays
 * @param ms Milliseconds to sleep
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if device has internet connectivity
 * Shows alert if offline (online-only app)
 * @returns true if connected
 */
export const ensureOnline = async (): Promise<boolean> => {
  const { isConnected, isInternetReachable } = await checkNetworkStatus();

  if (!isConnected || isInternetReachable === false) {
    return false;
  }

  return true;
};

/**
 * Fetch with timeout
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds
 * @returns Fetch response
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);

    if ((error as Error).name === 'AbortError') {
      throw new NetworkError(
        NetworkErrorType.TIMEOUT,
        'Request timeout',
        'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.'
      );
    }

    throw parseNetworkError(error);
  }
};

/**
 * Get Arabic error message for network error
 * @param error Error object
 * @returns Arabic error message
 */
export const getArabicErrorMessage = (error: any): string => {
  if (error instanceof NetworkError) {
    return error.arabicMessage;
  }

  const networkError = parseNetworkError(error);
  return networkError.arabicMessage;
};

/**
 * Check if error is retryable
 * @param error Error object
 * @returns true if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  const networkError = parseNetworkError(error);

  return (
    networkError.type === NetworkErrorType.TIMEOUT ||
    networkError.type === NetworkErrorType.SERVER_ERROR ||
    networkError.type === NetworkErrorType.NO_CONNECTION ||
    networkError.type === NetworkErrorType.RATE_LIMIT
  );
};

/**
 * Ping server to check connectivity
 * @param url URL to ping (default: Supabase URL)
 * @returns true if server is reachable
 */
export const pingServer = async (url?: string): Promise<boolean> => {
  const pingUrl = url || process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!pingUrl) {
    return false;
  }

  try {
    const response = await fetchWithTimeout(pingUrl, {}, 5000);
    return response.ok;
  } catch {
    return false;
  }
};
