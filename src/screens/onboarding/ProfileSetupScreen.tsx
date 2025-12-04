/**
 * ProfileSetupScreen - Academic track selection and profile picture upload
 *
 * Features:
 * - Academic track selector (scientific/literary)
 * - Optional profile picture upload with image picker
 * - RTL layout for Arabic
 * - Validation and error handling
 * - Loading state during profile creation
 * - Navigation to main app after completion
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { theme } from '@/config/theme.config';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AcademicTrack } from '@/types/user.types';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSetup'>;

export const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { completeOnboarding, isLoading, error, clearError } = useProfile(user?.id);

  const [academicTrack, setAcademicTrack] = useState<AcademicTrack | null>(null);
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(null);
  const [trackError, setTrackError] = useState<string | undefined>();

  /**
   * Request media library permissions and pick image
   */
  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'إذن مطلوب',
          'نحتاج إلى إذن للوصول إلى معرض الصور لتحميل صورة الملف الشخصي.',
          [{ text: 'حسناً' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePictureUri(result.assets[0].uri);
        clearError();
      }
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  /**
   * Remove selected profile picture
   */
  const handleRemoveImage = () => {
    setProfilePictureUri(null);
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    if (!academicTrack) {
      setTrackError('يرجى اختيار المسار الأكاديمي');
      return false;
    }
    setTrackError(undefined);
    return true;
  };

  /**
   * Handle profile setup completion
   */
  const handleComplete = async () => {
    // Clear previous errors
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert('خطأ', 'لم يتم العثور على معلومات المستخدم');
      return;
    }

    try {
      await completeOnboarding(user.id, {
        academicTrack: academicTrack!,
        profilePictureUri: profilePictureUri || undefined,
      });

      // Navigation to main app is handled by AppNavigator auth state change
      // User's profile now has onboardingCompleted = true
    } catch (err) {
      // Error is handled by useProfile hook
    }
  };

  /**
   * Handle track selection
   */
  const handleTrackChange = (track: AcademicTrack) => {
    setAcademicTrack(track);
    setTrackError(undefined);
    clearError();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            إعداد الملف الشخصي
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            أكمل معلوماتك للبدء
          </Text>
        </View>

        {/* Profile Picture Upload */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              صورة الملف الشخصي (اختياري)
            </Text>

            <View style={styles.imageContainer}>
              {profilePictureUri ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: profilePictureUri }}
                    style={styles.profileImage}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={handleRemoveImage}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imagePlaceholder}
                  onPress={handlePickImage}
                >
                  <Text variant="displaySmall" style={styles.cameraIcon}>
                    📷
                  </Text>
                  <Text variant="bodyMedium" style={styles.uploadText}>
                    اضغط لاختيار صورة
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {profilePictureUri && (
              <Button
                mode="outlined"
                onPress={handlePickImage}
                style={styles.changeImageButton}
                compact
              >
                تغيير الصورة
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Academic Track Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              المسار الأكاديمي *
            </Text>

            <RadioButton.Group
              onValueChange={(value) => handleTrackChange(value as AcademicTrack)}
              value={academicTrack || ''}
            >
              <View style={styles.radioOption}>
                <View style={styles.radioContent}>
                  <Text variant="titleMedium" style={styles.radioLabel}>
                    علمي
                  </Text>
                  <Text variant="bodyMedium" style={styles.radioDescription}>
                    للطلاب في التخصصات العلمية (رياضيات، فيزياء، كيمياء، أحياء)
                  </Text>
                </View>
                <RadioButton value="scientific" />
              </View>

              <View style={styles.radioOption}>
                <View style={styles.radioContent}>
                  <Text variant="titleMedium" style={styles.radioLabel}>
                    أدبي
                  </Text>
                  <Text variant="bodyMedium" style={styles.radioDescription}>
                    للطلاب في التخصصات الأدبية (لغة عربية، تاريخ، جغرافيا)
                  </Text>
                </View>
                <RadioButton value="literary" />
              </View>
            </RadioButton.Group>

            {trackError && (
              <Text variant="bodyMedium" style={styles.errorText}>
                {trackError}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error.arabicMessage}
            onRetry={handleComplete}
            style={styles.errorMessage}
          />
        )}

        {/* Complete Button */}
        <Button
          mode="contained"
          onPress={handleComplete}
          loading={isLoading}
          disabled={isLoading}
          style={styles.completeButton}
          contentStyle={styles.completeButtonContent}
        >
          إكمال الإعداد
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    color: theme.colors.onSurface,
    fontFamily: 'NotoKufiArabic_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'NotoKufiArabic_700Bold',
    color: theme.colors.onSurface,
    marginBottom: 16,
    textAlign: 'right',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: theme.colors.onError,
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'NotoKufiArabic_400Regular',
  },
  changeImageButton: {
    alignSelf: 'center',
  },
  radioOption: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontFamily: 'NotoKufiArabic_700Bold',
    color: theme.colors.onSurface,
    marginBottom: 4,
    textAlign: 'right',
  },
  radioDescription: {
    fontFamily: 'NotoKufiArabic_400Regular',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'right',
    lineHeight: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: 'NotoKufiArabic_400Regular',
    marginTop: 8,
    textAlign: 'right',
  },
  errorMessage: {
    marginBottom: 16,
  },
  completeButton: {
    marginTop: 'auto',
    marginBottom: 16,
  },
  completeButtonContent: {
    paddingVertical: 8,
  },
});
