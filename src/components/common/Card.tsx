/**
 * Card Component
 *
 * Reusable card component with elevation and RTL support
 */

import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { theme, shadows } from '@/config/theme.config';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  elevation?: 1 | 2 | 3 | 4 | 5;
  style?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  elevation = 2,
  style,
}) => {
  return (
    <PaperCard
      mode="elevated"
      elevation={elevation}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {children}
    </PaperCard>
  );
};

Card.Title = PaperCard.Title;
Card.Content = PaperCard.Content;
Card.Actions = PaperCard.Actions;
Card.Cover = PaperCard.Cover;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    marginVertical: 8,
  },
});

export default Card;
