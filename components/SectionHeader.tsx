import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headingS,
  },
  action: {
    ...Typography.bodyMedium,
  },
});
