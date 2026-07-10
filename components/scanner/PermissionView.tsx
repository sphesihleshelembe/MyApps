import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Settings as SettingsIcon, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { PrimaryButton, SecondaryButton } from '@/components/Button';

interface PermissionViewProps {
  onRequestPermission: () => void;
  onOpenSettings: () => void;
}

export function PermissionView({
  onRequestPermission,
  onOpenSettings,
}: PermissionViewProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: colors.primaryLight },
          ]}
        >
          <Camera size={40} color={colors.primary} strokeWidth={1.5} />
        </View>

        <Text
          style={[styles.title, { color: colors.text }]}
          accessibilityRole="header"
        >
          Camera Access Required
        </Text>

        <Text
          style={[styles.description, { color: colors.textSecondary }]}
        >
          Noviq needs camera access to scan documents. Your photos are
          processed on your device and never uploaded without your permission.
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.primaryLight,
              borderColor: colors.primary,
            },
          ]}
        >
          <AlertCircle size={18} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            If you denied camera access, you can enable it in your device
            Settings.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Grant Permission"
            onPress={onRequestPermission}
            fullWidth
            size="lg"
          />
          <SecondaryButton
            label="Open Settings"
            onPress={onOpenSettings}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.headingL,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing['2xl'],
  },
  infoText: {
    ...Typography.body,
    flex: 1,
    lineHeight: 20,
    fontSize: 13,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
});
