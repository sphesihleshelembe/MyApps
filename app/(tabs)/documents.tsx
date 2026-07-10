import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Scan, Image, Type, Layers, Minimize2, Scissors, FileImage, RotateCw } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { SectionHeader } from '@/components';
import { DOCUMENT_TOOLS, TOOL_ICON_COLORS } from '@/constants/data';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'scan', label: 'Scan' },
  { id: 'pdf', label: 'PDF' },
  { id: 'convert', label: 'Convert' },
  { id: 'ocr', label: 'OCR' },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

export default function DocumentsScreen() {
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTools =
    activeFilter === 'all'
      ? DOCUMENT_TOOLS
      : DOCUMENT_TOOLS.filter((t) => t.category === activeFilter);

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
            Documents
          </Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            Powerful tools for all your document needs
          </Text>
        </View>

        {/* Scan Banner */}
        <View style={styles.bannerWrapper}>
          <TouchableOpacity
            style={[styles.scanBanner, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <View style={styles.scanBannerText}>
              <Text style={styles.scanBannerTitle}>Scan a Document</Text>
              <Text style={styles.scanBannerSubtitle}>
                Use your camera to scan and auto-enhance any document
              </Text>
            </View>
            <View style={styles.scanBannerIcon}>
              <Scan size={36} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {CATEGORY_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  onPress={() => setActiveFilter(filter.id)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.card,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      {
                        color: isActive ? '#FFFFFF' : colors.textSecondary,
                      },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tools List */}
        <View style={styles.toolsSection}>
          <SectionHeader
            title={`${filteredTools.length} Tool${filteredTools.length !== 1 ? 's' : ''}`}
          />
          {filteredTools.map((tool) => {
            const toolColor = TOOL_ICON_COLORS[tool.id] ?? colors.primary;
            const IconComponent = (LucideIcons as any)[toPascalCase(tool.icon)];
            const bgColor = hexToRgba(toolColor, isDark ? 0.15 : 0.09);

            return (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  Shadows.sm,
                ]}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.toolIconContainer,
                    { backgroundColor: bgColor },
                  ]}
                >
                  {IconComponent && (
                    <IconComponent
                      size={22}
                      color={toolColor}
                      strokeWidth={2}
                    />
                  )}
                </View>
                <View style={styles.toolInfo}>
                  <View style={styles.toolLabelRow}>
                    <Text
                      style={[styles.toolLabel, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {tool.label}
                    </Text>
                    {tool.isNew && (
                      <View
                        style={[
                          styles.newBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.toolDescription,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {tool.description}
                  </Text>
                </View>
                <LucideIcons.ChevronRight
                  size={16}
                  color={colors.textDisabled}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
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

  bannerWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  scanBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  scanBannerText: {
    flex: 1,
    marginRight: Spacing.base,
  },
  scanBannerTitle: {
    ...Typography.headingM,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  scanBannerSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },
  scanBannerIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  filterWrapper: {
    paddingTop: Spacing.lg,
  },
  filterRow: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  filterLabel: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },

  toolsSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  toolIconContainer: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toolInfo: {
    flex: 1,
  },
  toolLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  toolLabel: {
    ...Typography.bodyMedium,
  },
  toolDescription: {
    ...Typography.caption,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  newBadgeText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontSize: 9,
  },
});
