import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { SETTINGS_SECTIONS } from '@/constants/data';
import type { SettingsItem } from '@/types';

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const [toggleValues, setToggleValues] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string, value: boolean) => {
    setToggleValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>
            Settings
          </Text>
          <Text
            style={[styles.screenSubtitle, { color: colors.textSecondary }]}
          >
            Customize your Noviq experience
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileWrapper}>
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              Shadows.sm,
            ]}
          >
            <View
              style={[
                styles.profileAvatar,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <LucideIcons.User
                size={28}
                color={colors.primary}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                Noviq User
              </Text>
              <Text
                style={[styles.profileMeta, { color: colors.textSecondary }]}
              >
                Free Plan
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.85}
            >
              <LucideIcons.Zap size={14} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.upgradeLabel}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionWrapper}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {section.title.toUpperCase()}
            </Text>
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                Shadows.sm,
              ]}
            >
              {section.items.map((item, index) => (
                <SettingsRow
                  key={item.id}
                  item={item}
                  isLast={index === section.items.length - 1}
                  toggleValue={toggleValues[item.id] ?? false}
                  onToggle={(v) => handleToggle(item.id, v)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionWrapper}>
          <View
            style={[styles.versionBadge, { backgroundColor: colors.primaryLight }]}
          >
            <LucideIcons.Scan size={16} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.versionName, { color: colors.text }]}>Noviq</Text>
          <Text style={[styles.versionText, { color: colors.textDisabled }]}>
            Version 1.0.0 — Shelembe Studios
          </Text>
          <Text style={[styles.versionCopy, { color: colors.textDisabled }]}>
            © 2025 Shelembe Studios. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingsRowProps {
  item: SettingsItem;
  isLast: boolean;
  toggleValue: boolean;
  onToggle: (v: boolean) => void;
}

function SettingsRow({ item, isLast, toggleValue, onToggle }: SettingsRowProps) {
  const { colors } = useTheme();
  const IconComponent = (LucideIcons as any)[toPascalCase(item.icon)];

  return (
    <TouchableOpacity
      style={[
        styles.settingsRow,
        !isLast && [styles.settingsRowBorder, { borderBottomColor: colors.divider }],
      ]}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      onPress={item.type !== 'toggle' ? () => {} : undefined}
    >
      <View
        style={[
          styles.settingsIcon,
          { backgroundColor: colors.primaryLight },
        ]}
      >
        {IconComponent && (
          <IconComponent size={18} color={colors.primary} strokeWidth={2} />
        )}
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsLabel, { color: colors.text }]}>
          {item.label}
        </Text>
        {item.description && (
          <Text
            style={[styles.settingsDescription, { color: colors.textSecondary }]}
          >
            {item.description}
          </Text>
        )}
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <LucideIcons.ChevronRight
          size={16}
          color={colors.textDisabled}
          strokeWidth={2}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing['3xl'] },

  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  screenTitle: {
    ...Typography.headingL,
    marginBottom: 4,
  },
  screenSubtitle: {
    ...Typography.body,
  },

  profileWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.headingS,
    marginBottom: 2,
  },
  profileMeta: {
    ...Typography.caption,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 5,
    flexShrink: 0,
  },
  upgradeLabel: {
    ...Typography.captionMedium,
    color: '#FFFFFF',
    fontSize: 12,
  },

  sectionWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.label,
    marginBottom: Spacing.sm,
    paddingLeft: 2,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    ...Typography.bodyMedium,
    marginBottom: 1,
  },
  settingsDescription: {
    ...Typography.caption,
  },

  versionWrapper: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing['2xl'],
    gap: Spacing.xs,
  },
  versionBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  versionName: {
    ...Typography.headingS,
  },
  versionText: {
    ...Typography.caption,
  },
  versionCopy: {
    ...Typography.caption,
    fontSize: 11,
  },
});
