import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/theme';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message, fullScreen = false }: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
});
