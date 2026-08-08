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
import { useRouter } from "expo-router";
import { Share, Linking, Alert } from "react-native";
import { Modal, Pressable } from "react-native";
import { useThemeContext, ThemeMode } from "@/context/ThemeContext";
import { Check, Moon, Sun, Smartphone } from "lucide-react-native";
import * as StoreReview from "expo-store-review";

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

export default function SettingsScreen() {
const { colors, theme, setTheme } = useTheme();
const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [toggleValues, setToggleValues] = useState<Record<string, boolean>>({});

  const handleToggle = (id: string, value: boolean) => {
    setToggleValues((prev) => ({ ...prev, [id]: value }));
  };

  const selectTheme = async (mode: ThemeMode) => {
  await setTheme(mode);
  setThemeModalVisible(false);
};

  const router = useRouter();

  const handleSettingPress = async (id: string) => {
  switch (id) {
    case "theme":
      setThemeModalVisible(true);
      break;

    case "language":
      Alert.alert(
        "Language",
        "More languages will be available in future updates."
      );
      break;

    case "rate":
  Linking.openURL(
    "https://play.google.com/store/apps/details?id=com.shelembestudios.noviq"
  );
  break;

    case "share":
      await Share.share({
        message:
          "Scan documents, extract text (OCR), merge PDFs, generate QR codes, compress PDFs and more with Noviq.\n\nDownload it on Google Play:\nhttps://play.google.com/store/apps/details?id=com.shelembestudios.noviq",
      });
      break;

    case "website":
  Linking.openURL(
    "https://shelembe-studios-website.vercel.app"
  );
  break;

    case "support":
  Linking.openURL(
    "mailto:sphesihleshelembe12@gmail.com?subject=Noviq Support&body=Please describe your issue:"
  );
  break;

  case "privacy": router.push("/settings/privacy"); 
  break;

    case "terms": router.push("/settings/terms"); 
    break;

   case "about":
  Linking.openURL(
    "https://shelembe-studios-website.vercel.app"
  );
  break;
  }
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
            Manage your scanner and application settings
          </Text>
        </View>

 {/* App Card */}
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
      <LucideIcons.Scan
        size={28}
        color={colors.primary}
        strokeWidth={1.8}
      />
    </View>

    <View style={styles.profileInfo}>
      <Text style={[styles.profileName, { color: colors.text }]}>
        Noviq
      </Text>

      <Text
        style={[
          styles.profileMeta,
          { color: colors.textSecondary },
        ]}
      >
        Smart Document Scanner

      </Text>
      <Text
  style={[
    styles.profileMeta,
    {
      color: colors.primary,
      marginTop: 2,
      fontWeight: "600",
    },
  ]}
>
  Version 1.0.0
</Text>
    </View>
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
                  onPress={handleSettingPress}
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
            <LucideIcons.Scan size={32} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.versionName, { color: colors.text }]}>Noviq</Text>
          <Text style={[styles.versionText, { color: colors.textDisabled }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.versionCopy, { color: colors.textDisabled }]}>
            © 2026 Shelembe Studios. All rights reserved.
          </Text>
        </View>
      </ScrollView>
      <Modal
  visible={themeModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setThemeModalVisible(false)}
>
  <Pressable
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    }}
    onPress={() => setThemeModalVisible(false)}
  >
    <Pressable
      onPress={() => {}}
      style={{
        width: "100%",
        maxWidth: 340,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 18,
        }}
      >
        Choose Theme
      </Text>

      {[
        { id: "system", label: "System Default", icon: Smartphone },
        { id: "light", label: "Light", icon: Sun },
        { id: "dark", label: "Dark", icon: Moon },
      ].map((item) => {
        const Icon = item.icon;

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => selectTheme(item.id as ThemeMode)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                size={20}
                color={colors.primary}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
            </View>

            {theme === item.id && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        );
      })}
    </Pressable>
  </Pressable>
</Modal>
    </SafeAreaView>
  );
}


interface SettingsRowProps {
  item: SettingsItem;
  isLast: boolean;
  toggleValue: boolean;
  onToggle: (v: boolean) => void;
  onPress: (id: string) => void;
}

function SettingsRow({
  item,
  isLast,
  toggleValue,
  onToggle,
  onPress,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const IconComponent = (LucideIcons as any)[toPascalCase(item.icon)];

  return (
    <TouchableOpacity
      style={[
        styles.settingsRow,
        !isLast && [styles.settingsRowBorder, { borderBottomColor: colors.divider }],
      ]}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
onPress={
  item.type !== "toggle"
    ? () => onPress(item.id)
    : undefined
}
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
