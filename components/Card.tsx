import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({ children, style, padding = 16, shadow = 'sm' }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, padding },
        shadow !== 'none' && Shadows[shadow],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'visible',
  },
});
