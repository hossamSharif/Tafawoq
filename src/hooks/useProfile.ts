/**
 * useProfile Hook - User profile management
 *
 * Provides profile data, loading state, and profile update actions.
 * Automatically loads profile when user is authenticated.
 */

import { useState, useEffect, useCallback } from 'react';
import { profileService } from '@/services/supabase/profile.service';
import { ServiceError } from '@/services/errors/service-error';
import { Profile, ProfileSetupData, AcademicTrack } from '@/types/user.types';

export interface UseProfileReturn {
  // State
  profile: Profile | null;
  isLoading: boolean;
  error: ServiceError | null;

  // Computed state
  hasCompletedOnboarding: boolean;

  // Actions
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<Profile>) => Promise<void>;
  updateAcademicTrack: (userId: string, track: AcademicTrack) => Promise<void>;
  uploadProfilePicture: (userId: string, imageUri: string) => Promise<string>;
  completeOnboarding: (userId: string, data: ProfileSetupData) => Promise<void>;
  clearError: () => void;
}

/**
 * T079: useProfile hook for profile loading and updates
 */
export const useProfile = (userId?: string): UseProfileReturn => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ServiceError | null>(null);

  // Computed state
  const hasCompletedOnboarding = profile?.onboardingCompleted || false;

  /**
   * Load profile when userId changes
   */
  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    } else {
      // Clear profile if user is not authenticated
      setProfile(null);
    }
  }, [userId]);

  /**
   * Load user profile
   */
  const loadProfile = useCallback(async (uid: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const userProfile = await profileService.getProfile(uid);
      setProfile(userProfile);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'PROFILE_FETCH_FAILED',
        'فشل تحميل الملف الشخصي',
        'حدث خطأ أثناء تحميل بيانات الملف الشخصي'
      );
      setError(serviceError);
      // Don't throw - allow component to handle gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update profile
   */
  const updateProfile = useCallback(async (uid: string, data: Partial<Profile>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedProfile = await profileService.upsertProfile(uid, data);
      setProfile(updatedProfile);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'PROFILE_UPDATE_FAILED',
        'فشل تحديث الملف الشخصي',
        'حدث خطأ أثناء حفظ التغييرات'
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update academic track
   */
  const updateAcademicTrack = useCallback(async (uid: string, track: AcademicTrack): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedProfile = await profileService.updateAcademicTrack(uid, track);
      setProfile(updatedProfile);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'PROFILE_UPDATE_FAILED',
        'فشل تحديث المسار الأكاديمي',
        'حدث خطأ أثناء حفظ المسار الأكاديمي'
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Upload profile picture
   */
  const uploadProfilePicture = useCallback(async (uid: string, imageUri: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const imageUrl = await profileService.uploadProfilePicture(uid, imageUri);

      // Update profile with new image URL
      const updatedProfile = await profileService.upsertProfile(uid, {
        profilePictureUrl: imageUrl,
      });
      setProfile(updatedProfile);

      return imageUrl;
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'STORAGE_UPLOAD_FAILED',
        'فشل رفع الصورة',
        'حدث خطأ أثناء رفع صورة الملف الشخصي'
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Complete onboarding
   */
  const completeOnboarding = useCallback(async (uid: string, data: ProfileSetupData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedProfile = await profileService.completeOnboarding(uid, data);
      setProfile(updatedProfile);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'PROFILE_UPDATE_FAILED',
        'فشل إكمال الإعداد',
        'حدث خطأ أثناء إكمال إعداد الملف الشخصي'
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
    profile,
    isLoading,
    error,

    // Computed state
    hasCompletedOnboarding,

    // Actions
    loadProfile,
    updateProfile,
    updateAcademicTrack,
    uploadProfilePicture,
    completeOnboarding,
    clearError,
  };
};
