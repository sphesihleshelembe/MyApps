import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/theme';
import { PrimaryButton } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const IconComponent = (LucideIcons as any)[toPascalCase(icon)];

  return (
    <View style={styles.container}>
      <View
        style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}
      >
        {IconComponent && (
          <IconComponent size={32} color={colors.primary} strokeWidth={1.5} />
        )}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: Spacing.lg }}
        />
      )}
    </View>
  );
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    ...Typography.headingS,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
