import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Scan, Image as ImageIcon, Type, Layers, Minimize2, Scissors, FileImage, RotateCw, FileText, Share2, Trash2 } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { SectionHeader } from '@/components';
import { DOCUMENT_TOOLS, TOOL_ICON_COLORS } from '@/constants/data';
import { listDocuments, deleteDocument } from '@/services/documents/DocumentStore';
import type { StoredDocument } from '@/types';

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
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedDocs, setSavedDocs] = useState<StoredDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDocs = useCallback(async () => {
    try {
      const docs = await listDocuments();
      setSavedDocs(docs);
    } catch {
      // ignore
    } finally {
      setLoadingDocs(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDocs();
    }, [loadDocs])
  );

  const handleScanDocument = () => {
    router.push('/scanner');
  };

  const handleOpenDocument = useCallback(async (doc: StoredDocument) => {
    try {
      await Sharing.shareAsync(doc.path, {
        mimeType: 'application/pdf',
        dialogTitle: doc.name,
      });
    } catch (e) {
      console.warn('Failed to open document:', e);
    }
  }, []);

  const handleShareDocument = useCallback(async (doc: StoredDocument) => {
    try {
      await Sharing.shareAsync(doc.path, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${doc.name}`,
      });
    } catch (e) {
      console.warn('Failed to share document:', e);
    }
  }, []);

  const handleDeleteDocument = useCallback(
    async (doc: StoredDocument) => {
      try {
        await deleteDocument(doc.id);
        setSavedDocs((prev) => prev.filter((d) => d.id !== doc.id));
      } catch (e) {
        console.warn('Failed to delete document:', e);
      }
    },
    []
  );

  const filteredTools =
    activeFilter === 'all'
      ? DOCUMENT_TOOLS
      : DOCUMENT_TOOLS.filter((t) => t.category === activeFilter);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days === 0 && d.getDate() === now.getDate()) {
      return hours <= 1 ? 'Just now' : `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
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
            onPress={handleScanDocument}
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

        {/* Saved Documents */}
        <View style={styles.savedSection}>
          <SectionHeader
            title={`Saved (${savedDocs.length})`}
          />
          {loadingDocs ? (
            <View style={styles.savedLoadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.savedLoadingText, { color: colors.textSecondary }]}>
                Loading documents…
              </Text>
            </View>
          ) : savedDocs.length === 0 ? (
            <View
              style={[
                styles.savedEmpty,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <FileText size={28} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={[styles.savedEmptyText, { color: colors.textSecondary }]}>
                No saved documents yet
              </Text>
              <Text style={[styles.savedEmptySub, { color: colors.textDisabled }]}>
                Scan a document to get started
              </Text>
            </View>
          ) : (
            <View>
              {savedDocs.map((doc) => (
                <View
                  key={doc.id}
                  style={[
                    styles.docRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    Shadows.sm,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.docMain}
                    onPress={() => handleOpenDocument(doc)}
                    activeOpacity={0.75}
                    accessibilityLabel={`Open ${doc.name}`}
                    accessibilityRole="button"
                  >
                    {doc.thumbnailUri ? (
                      <Image
                        source={{ uri: doc.thumbnailUri }}
                        style={styles.docThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.docThumbPlaceholder,
                          { backgroundColor: colors.primaryLight },
                        ]}
                      >
                        <FileText size={20} color={colors.primary} strokeWidth={2} />
                      </View>
                    )}
                    <View style={styles.docInfo}>
                      <Text
                        style={[styles.docName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {doc.name}
                      </Text>
                      <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                        {doc.pageCount} page{doc.pageCount !== 1 ? 's' : ''} • {formatDate(doc.createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.docActions}>
                    <TouchableOpacity
                      style={styles.docActionBtn}
                      onPress={() => handleShareDocument(doc)}
                      hitSlop={8}
                      accessibilityLabel={`Share ${doc.name}`}
                      accessibilityRole="button"
                    >
                      <Share2 size={18} color={colors.textSecondary} strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.docActionBtn}
                      onPress={() => handleDeleteDocument(doc)}
                      hitSlop={8}
                      accessibilityLabel={`Delete ${doc.name}`}
                      accessibilityRole="button"
                    >
                      <Trash2 size={18} color={colors.error} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
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
                onPress={tool.id === 'scan-doc' ? handleScanDocument : undefined}
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

  savedSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  savedLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  savedLoadingText: {
    ...Typography.body,
  },
  savedEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: Spacing.xs,
  },
  savedEmptyText: {
    ...Typography.bodyMedium,
  },
  savedEmptySub: {
    ...Typography.caption,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  docMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.md,
  },
  docThumb: {
    width: 44,
    height: 56,
    borderRadius: BorderRadius.sm,
    flexShrink: 0,
  },
  docThumbPlaceholder: {
    width: 44,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docInfo: {
    flex: 1,
    gap: 2,
  },
  docName: {
    ...Typography.bodyMedium,
  },
  docMeta: {
    ...Typography.caption,
  },
  docActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  docActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
