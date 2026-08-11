import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Scan, Layers, Image as ImageIcon, QrCode } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { Card, SectionHeader, SearchBar } from '@/components';
import { QUICK_ACTIONS, POPULAR_TOOLS, TOOL_ICON_COLORS } from '@/constants/data';
import {
  listDocuments,
  deleteDocument,
  StoredDocument,
} from '@/services/documents/DocumentStore';

const QUICK_ACTION_ICONS: Record<string, React.ElementType> = {
  scan: Scan,
  image: ImageIcon,
  'qr-code': QrCode,
  layers: Layers,
};

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedDocs, setSavedDocs] = useState<StoredDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<StoredDocument | null>(null);
  const [, setLoadingDocs] = useState(true);

  const SEARCH_TOOLS = [
    {
      id: 'scan',
      title: 'Scan Document',
      keywords: ['scan', 'camera', 'document'],
      route: '/scanner',
    },
    {
      id: 'merge',
      title: 'Merge PDF',
      keywords: ['merge', 'combine', 'pdf'],
      route: '/merge',
    },
    {
      id: 'split',
      title: 'Split PDF',
      keywords: ['split', 'pdf'],
      route: '/split',
    },
    {
      id: 'compress',
      title: 'Compress PDF',
      keywords: ['compress', 'reduce', 'pdf'],
      route: '/compress',
    },
    {
      id: 'ocr',
      title: 'Extract Text',
      keywords: ['ocr', 'text', 'extract'],
      route: '/ocr',
    },
    {
      id: 'qr',
      title: 'QR Scanner & Generator',
      keywords: ['qr', 'barcode', 'generator'],
      route: '/qr',
    },
  ];

  const filteredTools =
    searchQuery.trim() === ''
      ? []
      : SEARCH_TOOLS.filter((tool) => {
          const query = searchQuery.toLowerCase();
          return (
            tool.title.toLowerCase().includes(query) ||
            tool.keywords.some((k) => k.includes(query))
          );
        });

  const loadDocs = useCallback(async () => {
    try {
      const docs = await listDocuments();
      setSavedDocs(docs);
    } catch {
      // ignore
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDocs();
    }, [loadDocs])
  );

  const openFile = async (file: StoredDocument) => {
    try {
      const uri = file.path.startsWith('file://')
        ? file.path
        : `file://${file.path}`;

      const contentUri = await FileSystem.getContentUriAsync(uri);

      await IntentLauncher.startActivityAsync(
        'android.intent.action.VIEW',
        {
          data: contentUri,
          type: 'application/pdf',
          flags: 1,
        }
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Unable to open PDF',
        'No PDF viewer is installed or the file could not be opened.'
      );
    }
  };

  const shareFile = async (file: StoredDocument) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(file.path, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${file.name}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (file: StoredDocument) => {
    Alert.alert(
      'Delete file?',
      `Are you sure you want to delete "${file.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(file.id);
              await loadDocs();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Unable to delete the file.');
            }
          },
        },
      ]
    );
  };

  const handleQuickAction = (id: string) => {
    switch (id) {
      case 'scan':
        router.push('/scanner');
        break;
      case 'qr':
        router.push('/qr');
        break;
      case 'merge':
        router.push('/merge');
        break;
      default:
        break;
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
      ? 'Good afternoon'
      : 'Good evening';

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
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
              <Scan size={16} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={[styles.brandName, { color: colors.text }]}>Noviq</Text>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingSubtitle, { color: colors.textSecondary }]}>
            {greeting}
          </Text>
          <Text style={[styles.greetingTitle, { color: colors.text }]}>
            What would you like{'\n'}to do today?
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tools, files..."
          />
        </View>

        {filteredTools.length > 0 && (
          <View
            style={[
              styles.searchResults,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {filteredTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.searchResult}
                onPress={() => {
                  setSearchQuery('');
                  router.push(tool.route as any);
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {tool.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map((action) => {
              const Icon = QUICK_ACTION_ICONS[action.icon] ?? LucideIcons.Zap;
              const bgColor = hexToRgba(action.color, isDark ? 0.15 : 0.09);
              return (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleQuickAction(action.id)}
                  style={[
                    styles.quickActionItem,
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
                      styles.quickActionIcon,
                      { backgroundColor: bgColor },
                    ]}
                  >
                    <Icon size={22} color={action.color} strokeWidth={2} />
                  </View>
                  <Text
                    style={[styles.quickActionLabel, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Popular Tools */}
        <View style={styles.section}>
          <SectionHeader
            title="Popular Tools"
            actionLabel="See all"
            onAction={() => router.push('/documents')}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularToolsRow}
          >
            {POPULAR_TOOLS.map((tool) => {
              const toolColor = TOOL_ICON_COLORS[tool.id] ?? colors.primary;
              const IconComponent = (LucideIcons as any)[toPascalCase(tool.icon)];
              const bgColor = hexToRgba(toolColor, isDark ? 0.15 : 0.09);

              return (
                <TouchableOpacity
                  key={tool.id}
                  style={[
                    styles.popularToolCard,
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
                      styles.popularToolIcon,
                      { backgroundColor: bgColor },
                    ]}
                  >
                    {IconComponent && (
                      <IconComponent
                        size={24}
                        color={toolColor}
                        strokeWidth={2}
                      />
                    )}
                  </View>

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

                  <Text
                    style={[
                      styles.popularToolLabel,
                      { color: colors.text },
                    ]}
                    numberOfLines={2}
                  >
                    {tool.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Recent Files */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Files"
            actionLabel="See all"
            onAction={() => router.push('/documents')}
          />

          {savedDocs.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                { color: colors.textSecondary },
              ]}
            >
              No recent files yet.
            </Text>
          ) : (
            savedDocs.slice(0, 5).map((file) => (
              <TouchableOpacity
                key={file.id}
                style={[
                  styles.fileRow,
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
                    styles.fileIconContainer,
                    {
                      backgroundColor: hexToRgba(colors.primary, 0.09),
                    },
                  ]}
                >
                  <LucideIcons.FileText
                    size={20}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                </View>

                <View style={styles.fileInfo}>
                  <Text
                    style={[
                      styles.fileName,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {file.name}
                  </Text>

                  <Text
                    style={[
                      styles.fileMeta,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {file.size} — {file.createdAt}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedFile(file)}
                  hitSlop={10}
                >
                  <LucideIcons.MoreVertical
                    size={18}
                    color={colors.textDisabled}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Tips Card */}
        <View style={[styles.section, styles.lastSection]}>
          <Card
            style={[
              styles.tipsCard,
              {
                borderColor: colors.primaryLight,
                borderWidth: 1.5,
              },
            ]}
            shadow="none"
          >
            <View style={styles.tipsHeader}>
              <View
                style={[
                  styles.tipsBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.tipsBadgeText}>TIP</Text>
              </View>
            </View>

            <Text
              style={[
                styles.tipsTitle,
                { color: colors.text },
              ]}
            >
              Scan in good lighting
            </Text>

            <Text
              style={[
                styles.tipsBody,
                { color: colors.textSecondary },
              ]}
            >
              For the sharpest scans, place your document on a flat, contrasting
              surface and ensure even, bright lighting. Avoid shadows for the best
              OCR results.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Action Sheet Overlay */}
      <Modal
        visible={!!selectedFile}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFile(null)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setSelectedFile(null)}
        >
          <View
            style={[
              styles.fileMenu,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (selectedFile) openFile(selectedFile);
                setSelectedFile(null);
              }}
            >
              <Text style={[styles.menuText, { color: colors.text }]}>Open</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (selectedFile) shareFile(selectedFile);
                setSelectedFile(null);
              }}
            >
              <Text style={[styles.menuText, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (selectedFile) handleDelete(selectedFile);
                setSelectedFile(null);
              }}
            >
              <Text style={[styles.menuText, { color: '#E53935' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing['3xl'] },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...Typography.headingM,
  },

  greetingSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  greetingSubtitle: {
    ...Typography.body,
    marginBottom: 4,
  },
  greetingTitle: {
    ...Typography.headingXL,
    lineHeight: 42,
  },

  searchWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },

  section: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  lastSection: {
    paddingBottom: 0,
  },

  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    ...Typography.captionMedium,
    textAlign: 'center',
  },

  popularToolsRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.base,
  },
  popularToolCard: {
    width: 100,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'flex-start',
    position: 'relative',
  },
  popularToolIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  popularToolLabel: {
    ...Typography.captionMedium,
    lineHeight: 16,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  newBadgeText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontSize: 9,
  },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    ...Typography.bodyMedium,
    marginBottom: 2,
  },
  fileMeta: {
    ...Typography.caption,
  },
  emptyText: {
    ...Typography.body,
    paddingVertical: Spacing.md,
  },

  tipsCard: {
    padding: Spacing.base,
  },
  tipsHeader: {
    marginBottom: Spacing.sm,
  },
  tipsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  tipsBadgeText: {
    ...Typography.label,
    color: '#FFFFFF',
  },
  tipsTitle: {
    ...Typography.headingS,
    marginBottom: Spacing.xs,
  },
  tipsBody: {
    ...Typography.body,
    lineHeight: 22,
  },

  searchResults: {
    marginTop: 8,
    marginHorizontal: Spacing.base,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchResult: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A3441',
  },

  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  fileMenu: {
    width: 220,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: 6,
  },
  menuItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
  },
  menuText: {
    ...Typography.bodyMedium,
  },
});