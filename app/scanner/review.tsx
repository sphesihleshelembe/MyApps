import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  X,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { ScanSession } from '@/services/scanner/ScanSession';
import { generatePdf, timestampName } from '@/services/pdf/PdfService';
import { saveDocument } from '@/services/documents/DocumentStore';
import type { ScanPage } from '@/types';
import { SquarePen } from 'lucide-react-native';
import { savePdf } from "@/services/export";

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
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [docName, setDocName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveProgress, setSaveProgress] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);


  

  useEffect(() => {
    if (saveModalVisible) {
      setDocName(timestampName());
      setGenerateError(null);
      setSaveProgress('');
    }
  }, [saveModalVisible]);

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

  const handleFinish = useCallback(() => {
    if (finishing || pages.length === 0) return;
    setFinishing(true);
    setSaveModalVisible(true);
  }, [finishing, pages.length]);

  const handleCancelSave = useCallback(() => {
    setSaveModalVisible(false);
    setFinishing(false);
    setGenerating(false);
    setGenerateError(null);
    setSaveProgress('');
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (generating || pages.length === 0 || !sessionId) return;
    setGenerating(true);
    setGenerateError(null);

    try {
      setSaveProgress('Loading pages…');
      const session = await ScanSession.load(sessionId);
      if (!session) {
        throw new Error('Scan session could not be found.');
      }
      const allPages = session.getPages();
      if (allPages.length === 0) {
        throw new Error('No pages to save.');
      }

      setSaveProgress('Generating PDF…');
      const name = docName.trim() || timestampName();
      const result = await generatePdf(allPages, name);

      setSaveProgress('Saving document…');
      await saveDocument({
        name,
        path: result.path,
        pageCount: result.pageCount,
        thumbnailUri: result.thumbnailUri,

      });

         Alert.alert(
  "Document Saved",
  "Your scan has been saved to Noviq. Would you also like to save a copy to your device?",
  [
    {
      text: "Not Now",
      style: "cancel",
    },
    {
      text: "Save Copy",
      onPress: async () => {
        const success = await savePdf(
          result.path,
          `${name}.pdf`
        );

        if (success) {
          Alert.alert(
            "Success",
            "PDF saved to your selected folder."
          );
        } else {
          Alert.alert(
            "Cancelled",
            "No PDF was exported."
          );
        }
      },
    },
  ]
);

   

      setSaveProgress('Cleaning up…');
      try {
        await session.destroy();
      } catch {
        // Non-critical
      }

      setSaveModalVisible(false);
      setFinishing(false);
      setGenerating(false);
      setSaveProgress('');

      router.replace('/(tabs)/documents');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate PDF. Please try again.';
      setGenerateError(msg);
      setGenerating(false);
      setSaveProgress('');
    }
  }, [generating, pages.length, sessionId, docName, router]);

 
  const renderPageTile = useCallback(
    ({ item, index }: { item: ScanPage; index: number }) => {
      const isDeleting = deletingId === item.id;


      return (
       <TouchableOpacity
  onPress={() => setSelectedPageIndex(index)}
        style={[
          styles.tile,
          {
            backgroundColor: colors.surface,
            borderWidth: index === selectedPageIndex ? 3 : 0,
            borderColor: colors.primary,
          },
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
</TouchableOpacity>
      );
    },
    [colors, deletingId, handleDeleteConfirm, selectedPageIndex,]
  );

  const keyExtractor = useCallback((item: ScanPage) => item.id, []);

const handleEdit = () => {
  if (!pages[selectedPageIndex]) retotateurn;

  router.push({
    pathname: "/edit-scan",
    params: {
      sessionId,
      pageId: pages[selectedPageIndex].id,
    },
  });
};
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

           <TouchableOpacity
  style={styles.topBarButton}
  onPress={handleEdit}
  hitSlop={12}
  accessibilityLabel="Edit scan"
  accessibilityRole="button"
>
<SquarePen
  size={22}
  color={colors.text}
  strokeWidth={2}
/>
</TouchableOpacity>
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
            {finishing ? (<ArrowLeft
  size={22}
  color={colors.text}
/>
            ) : (
              <>
                <FileCheck size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.finishText}>Save as PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Save Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={saveModalVisible}
        onRequestClose={handleCancelSave}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card },
              Shadows.lg,
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Save Document
              </Text>
              {!generating && (
                <TouchableOpacity
                  onPress={handleCancelSave}
                  hitSlop={12}
                  accessibilityLabel="Cancel save"
                  accessibilityRole="button"
                >
                  <X size={20} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {generating ? (
              <View style={styles.generatingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.generatingText, { color: colors.textSecondary }]}>
                  {saveProgress || 'Generating PDF…'}
                </Text>
                <Text style={[styles.generatingSubtext, { color: colors.textSecondary }]}>
                  {pages.length} page{pages.length !== 1 ? 's' : ''} • This may take a moment
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Document Name
                </Text>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={docName}
                  onChangeText={setDocName}
                  placeholder="Enter a name for your document"
                  placeholderTextColor={colors.textDisabled}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  blurOnSubmit
                  selectTextOnFocus
                />
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Leave blank to use a timestamp-based name.
                </Text>

                {generateError && (
                  <View
                    style={[
                      styles.errorBox,
                      { backgroundColor: colors.errorLight },
                    ]}
                  >
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {generateError}
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelButton,
                      { borderColor: colors.border },
                    ]}
                    onPress={handleCancelSave}
                    activeOpacity={0.75}
                    accessibilityLabel="Cancel"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirmButton, { backgroundColor: colors.primary }]}
                    onPress={handleConfirmSave}
                    activeOpacity={0.85}
                    accessibilityLabel="Save PDF"
                    accessibilityRole="button"
                  >
                    <FileCheck size={18} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.modalConfirmText}>Save PDF</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.headingM,
  },
  inputLabel: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  textInput: {
    ...Typography.body,
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  hintText: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  errorBox: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  modalCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  modalCancelText: {
    ...Typography.button,
  },
  modalConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  modalConfirmText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  generatingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  generatingText: {
    ...Typography.bodyMedium,
  },
  generatingSubtext: {
    ...Typography.caption,
  },
});
