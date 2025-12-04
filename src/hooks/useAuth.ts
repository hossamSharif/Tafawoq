/**
 * useAuth Hook - Authentication state management
 *
 * Provides authentication state, user info, and auth actions.
 * Manages session persistence and auth state changes.
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/supabase/auth.service';
import { ServiceError } from '@/services/errors/service-error';
import {
  AuthCredentials,
  RegistrationData,
  Session,
  User,
} from '@/types/user.types';
import { AuthChangeEvent } from '@supabase/supabase-js';

export interface UseAuthReturn {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: ServiceError | null;

  // Actions
  signUp: (data: RegistrationData) => Promise<{ needsVerification: boolean }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  clearError: () => void;
}

/**
 * T078: useAuth hook for authentication state management
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ServiceError | null>(null);

  // Derived state
  const isAuthenticated = !!user && !!session;

  /**
   * Initialize auth state from stored session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const currentSession = await authService.getCurrentSession();

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (err) {
        // Silent failure - user is not authenticated
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Subscribe to auth state changes
   */
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user || null);

        // Clear loading state on auth events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setIsLoading(false);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Sign up new user
   */
  const signUp = useCallback(async (data: RegistrationData): Promise<{ needsVerification: boolean }> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.signUp(data);

      if (result.user) {
        setUser(result.user);
      }

      return { needsVerification: result.needsVerification };
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'AUTH_REGISTRATION_FAILED',
        'حدث خطأ أثناء إنشاء الحساب',
        'فشل إنشاء الحساب'
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify email with OTP
   */
  const verifyEmail = useCallback(async (email: string, otp: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.verifyEmail(email, otp);
      setUser(result.user);
      setSession(result.session);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'AUTH_EMAIL_VERIFICATION_FAILED',
        'فشل التحقق من البريد الإلكتروني',
        'رمز التحقق غير صحيح'
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign in with credentials
   */
  const signIn = useCallback(async (credentials: AuthCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.signIn(credentials);
      setUser(result.user);
      setSession(result.session);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'AUTH_SIGN_IN_FAILED',
        'فشل تسجيل الدخول',
        'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'AUTH_SIGN_OUT_FAILED',
        'فشل تسجيل الخروج',
        'حدث خطأ أثناء تسجيل الخروج'
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Resend verification OTP
   */
  const resendOTP = useCallback(async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.resendVerificationOTP(email);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'AUTH_OTP_RESEND_FAILED',
        'فشل إعادة إرسال رمز التحقق',
        'حدث خطأ أثناء إعادة إرسال رمز التحقق'
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,
    error,

    // Actions
    signUp,
    verifyEmail,
    signIn,
    signOut,
    resendOTP,
    clearError,
  };
};
