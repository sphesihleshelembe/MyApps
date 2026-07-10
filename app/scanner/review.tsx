import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  ScanLine,
  FileCheck,
  Plus,
  FileText,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { ScanSession } from '@/services/scanner/ScanSession';
import type { ScanPage } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_PADDING = Spacing.base;
const GRID_GAP = Spacing.sm;
const TILE_WIDTH =
  (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;
const TILE_HEIGHT = TILE_WIDTH * 1.414;

export default function ReviewScanScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadSession() {
        if (!sessionId) return;
        setLoading(true);
        const session = await ScanSession.load(sessionId);
        if (session) {
          setPages(session.getPages());
        }
        setLoading(false);
      }
      loadSession();
    }, [sessionId])
  );

  const handleDeletePage = useCallback(
    async (pageId: string) => {
      if (!sessionId || deletingId) return;
      setDeletingId(pageId);
      try {
        const session = await ScanSession.load(sessionId);
        if (session) {
          await session.removePage(pageId);
          const updated = session.getPages();
          setPages(updated);
          if (updated.length === 0) {
            router.back();
          }
        }
      } catch (e) {
        console.warn('Delete page failed:', e);
      } finally {
        setDeletingId(null);
      }
    },
    [sessionId, deletingId, router]
  );

  const handleDeleteConfirm = useCallback(
    (page: ScanPage, index: number) => {
      Alert.alert(
        'Delete Page',
        `Remove page ${index + 1} from this scan?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeletePage(page.id),
          },
        ],
        { cancelable: true }
      );
    },
    [handleDeletePage]
  );

  const handleContinueScanning = useCallback(() => {
    router.back();
  }, [router]);

  const handleFinish = useCallback(async () => {
    if (finishing || pages.length === 0) return;
    setFinishing(true);
    Alert.alert(
      'Save Scan',
      `Your ${pages.length}-page scan is ready. PDF export and saving will be available in the next update.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setFinishing(false);
          },
        },
      ]
    );
    setFinishing(false);
  }, [finishing, pages.length]);

  const renderPageTile = useCallback(
    ({ item, index }: { item: ScanPage; index: number }) => {
      const isDeleting = deletingId === item.id;
      return (
        <View
          style={[
            styles.tile,
            { backgroundColor: colors.surface },
            Shadows.sm,
          ]}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.tileImage}
            resizeMode="cover"
            accessible
            accessibilityLabel={`Page ${index + 1}`}
          />
          <View style={styles.tileFooter}>
            <View
              style={[
                styles.pageNumberBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.pageNumberText}>{index + 1}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.deleteTileButton,
                { backgroundColor: colors.errorLight },
                isDeleting && styles.deleteTileButtonDisabled,
              ]}
              onPress={() => handleDeleteConfirm(item, index)}
              disabled={isDeleting || !!deletingId}
              hitSlop={8}
              accessibilityLabel={`Delete page ${index + 1}`}
              accessibilityHint="Hold to confirm deletion of this page"
              accessibilityRole="button"
              accessibilityState={{ disabled: isDeleting || !!deletingId }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Trash2 size={14} color={colors.error} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [colors, deletingId, handleDeleteConfirm]
  );

  const keyExtractor = useCallback((item: ScanPage) => item.id, []);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primaryLight }]}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back to camera"
          accessibilityHint="Return to the camera without discarding your scan"
          accessibilityRole="button"
        >
          <ArrowLeft size={20} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.topBarTitle}>
          <Text style={[styles.titleText, { color: colors.text }]}>
            Review Scan
          </Text>
          {!loading && (
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
              {pages.length} page{pages.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <View style={styles.topBarSpacer} />
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading scan...
          </Text>
        </View>
      ) : (
        <FlatList
          data={pages}
          renderItem={renderPageTile}
          keyExtractor={keyExtractor}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <FileText size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No pages yet
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                Return to the camera to scan your first page.
              </Text>
            </View>
          }
        />
      )}

      {/* Bottom Action Bar */}
      {!loading && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
            ]}
            onPress={handleContinueScanning}
            disabled={finishing}
            accessibilityLabel="Continue scanning"
            accessibilityHint="Return to the camera to capture more pages"
            accessibilityRole="button"
            accessibilityState={{ disabled: finishing }}
          >
            <Plus size={18} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.continueText, { color: colors.primary }]}>
              Add Pages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.finishButton,
              {
                backgroundColor:
                  pages.length === 0 ? colors.border : colors.primary,
                opacity: finishing || pages.length === 0 ? 0.7 : 1,
              },
            ]}
            onPress={handleFinish}
            disabled={finishing || pages.length === 0}
            accessibilityLabel={`Finish scan — ${pages.length} page${pages.length !== 1 ? 's' : ''}`}
            accessibilityHint="Save the current scan as a PDF document"
            accessibilityRole="button"
            accessibilityState={{
              disabled: finishing || pages.length === 0,
            }}
          >
            {finishing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FileCheck size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.finishText}>Save as PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topBarTitle: {
    flex: 1,
  },
  titleText: {
    ...Typography.headingS,
  },
  subtitleText: {
    ...Typography.caption,
    marginTop: 1,
  },
  topBarSpacer: {
    width: 38,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
  },

  grid: {
    padding: GRID_PADDING,
    gap: GRID_GAP,
  },
  gridRow: {
    gap: GRID_GAP,
  },

  tile: {
    width: TILE_WIDTH,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  tileImage: {
    width: '100%',
    height: TILE_HEIGHT,
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  pageNumberBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontSize: 11,
  },
  deleteTileButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteTileButtonDisabled: {
    opacity: 0.5,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...Typography.headingS,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },

  bottomBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  continueText: {
    ...Typography.button,
    fontSize: 14,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  finishText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
