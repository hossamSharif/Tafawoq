import { I18nManager } from 'react-native';

/**
 * RTL (Right-to-Left) Layout Helper Functions
 *
 * These utilities help manage RTL layout for Arabic language support
 * as per NFR-001 requirement and research.md section 4.
 *
 * Key Principles:
 * - Use paddingStart/paddingEnd instead of paddingLeft/paddingRight
 * - Use marginStart/marginEnd instead of marginLeft/marginRight
 * - Icons and navigation automatically flip via I18nManager
 * - Text alignment defaults to 'right' for Arabic
 */

/**
 * Check if RTL mode is enabled
 * @returns true if RTL is active
 */
export const isRTL = (): boolean => {
  return I18nManager.isRTL;
};

/**
 * Force RTL mode (Arabic layout)
 * Should be called once during app initialization in App.tsx
 *
 * @param allowRTL Enable RTL layout
 * @param forceRTL Force RTL direction
 */
export const setRTL = (allowRTL: boolean = true, forceRTL: boolean = true): void => {
  I18nManager.allowRTL(allowRTL);
  I18nManager.forceRTL(forceRTL);
};

/**
 * Get flex direction based on RTL state
 * @returns 'row' | 'row-reverse'
 */
export const getFlexDirection = (): 'row' | 'row-reverse' => {
  return isRTL() ? 'row-reverse' : 'row';
};

/**
 * Get text alignment based on RTL state
 * @returns 'left' | 'right'
 */
export const getTextAlign = (): 'left' | 'right' => {
  return isRTL() ? 'right' : 'left';
};

/**
 * Get icon rotation for directional icons (arrows, back buttons)
 * @param rotate180 Whether to rotate 180 degrees in RTL mode
 * @returns Rotation in degrees
 */
export const getIconRotation = (rotate180: boolean = true): number => {
  return isRTL() && rotate180 ? 180 : 0;
};

/**
 * Convert left/right properties to start/end for RTL compatibility
 *
 * Usage:
 * ```typescript
 * const styles = StyleSheet.create({
 *   container: {
 *     ...rtlStyle({ paddingLeft: 16, marginRight: 8 })
 *     // Converts to: { paddingStart: 16, marginEnd: 8 }
 *   }
 * });
 * ```
 *
 * @param style Style object with left/right properties
 * @returns Style object with start/end properties
 */
export const rtlStyle = (style: Record<string, any>): Record<string, any> => {
  const converted: Record<string, any> = { ...style };

  // Convert padding
  if ('paddingLeft' in style) {
    converted.paddingStart = style.paddingLeft;
    delete converted.paddingLeft;
  }
  if ('paddingRight' in style) {
    converted.paddingEnd = style.paddingRight;
    delete converted.paddingRight;
  }

  // Convert margin
  if ('marginLeft' in style) {
    converted.marginStart = style.marginLeft;
    delete converted.marginLeft;
  }
  if ('marginRight' in style) {
    converted.marginEnd = style.marginRight;
    delete converted.marginRight;
  }

  // Convert positioning
  if ('left' in style) {
    converted.start = style.left;
    delete converted.left;
  }
  if ('right' in style) {
    converted.end = style.right;
    delete converted.right;
  }

  return converted;
};

/**
 * Get transform for RTL flipping
 * Useful for custom icons or elements that need manual flipping
 *
 * @returns Transform array for StyleSheet
 */
export const rtlTransform = (): Array<{ scaleX: number }> => {
  return isRTL() ? [{ scaleX: -1 }] : [{ scaleX: 1 }];
};

/**
 * Get padding/margin values with RTL awareness
 *
 * Usage:
 * ```typescript
 * const styles = StyleSheet.create({
 *   container: {
 *     ...rtlSpacing('padding', { start: 16, end: 8, top: 4, bottom: 4 })
 *   }
 * });
 * ```
 *
 * @param type 'padding' | 'margin'
 * @param values Spacing values object
 * @returns Style object with appropriate properties
 */
export const rtlSpacing = (
  type: 'padding' | 'margin',
  values: {
    start?: number;
    end?: number;
    top?: number;
    bottom?: number;
    vertical?: number;
    horizontal?: number;
  }
): Record<string, number> => {
  const result: Record<string, number> = {};

  if (values.vertical !== undefined) {
    result[`${type}Vertical`] = values.vertical;
  }
  if (values.horizontal !== undefined) {
    result[`${type}Horizontal`] = values.horizontal;
  }
  if (values.top !== undefined) {
    result[`${type}Top`] = values.top;
  }
  if (values.bottom !== undefined) {
    result[`${type}Bottom`] = values.bottom;
  }
  if (values.start !== undefined) {
    result[`${type}Start`] = values.start;
  }
  if (values.end !== undefined) {
    result[`${type}End`] = values.end;
  }

  return result;
};

/**
 * Check if device needs RTL restart
 * Some Android devices require app restart after changing RTL settings
 *
 * @returns true if restart needed
 */
export const needsRTLRestart = (): boolean => {
  return I18nManager.doLeftAndRightSwapInRTL;
};

/**
 * Force app restart for RTL changes (Android only)
 * Warning: This is a destructive operation
 */
export const restartForRTL = (): void => {
  if (needsRTLRestart()) {
    // This method is deprecated but necessary for RTL restart
    // Alternative: Inform user to manually restart the app
    console.warn('App restart required for RTL changes. Please restart the app manually.');
  }
};

/**
 * Get absolute positioning for RTL-aware placement
 *
 * @param position Position type ('left' | 'right')
 * @param value Position value in pixels
 * @returns Style object with RTL-aware positioning
 */
export const rtlPosition = (
  position: 'left' | 'right',
  value: number
): { left?: number; right?: number } => {
  if (isRTL()) {
    return position === 'left' ? { right: value } : { left: value };
  }
  return position === 'left' ? { left: value } : { right: value };
};
