import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, RotateCcw, Check } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius } from '@/theme';
import { ScanSession } from '@/services/scanner/ScanSession';
import { ScanThumbnail } from '@/components/scanner/ScanThumbnail';
import type { ScanPage } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PreviewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    uri: string;
    width: string;
    height: string;
    sessionId: string;
  }>();

  const [pages, setPages] = useState<ScanPage[]>([]);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadSession() {
        if (!params.sessionId) return;
        const session = await ScanSession.load(params.sessionId);
        if (session) {
          setPages(session.getPages());
        }
      }
      loadSession();
    }, [params.sessionId])
  );

  const handleRetake = useCallback(async () => {
    if (params.uri) {
      try {
        await FileSystem.deleteAsync(params.uri, { idempotent: true });
      } catch {
        // File may already be gone
      }
    }
    router.back();
  }, [params.uri, router]);

  const handleUsePhoto = useCallback(async () => {
    if (saving || !params.sessionId) return;
    setSaving(true);
    try {
      const session = await ScanSession.load(params.sessionId);
      if (session && params.uri) {
        await session.addPage({
          uri: params.uri,
          width: parseInt(params.width || '0', 10),
          height: parseInt(params.height || '0', 10),
        });
      }
      router.back();
    } catch (e) {
      console.warn('Failed to save page:', e);
      setSaving(false);
    }
  }, [saving, params, router]);

  const handleDeletePage = useCallback(
    async (pageId: string) => {
      if (!params.sessionId) return;
      const session = await ScanSession.load(params.sessionId);
      if (session) {
        await session.removePage(pageId);
        setPages(session.getPages());
      }
    },
    [params.sessionId]
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: '#000000' }]}
      edges={['top', 'bottom']}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleRetake}
          hitSlop={12}
          accessibilityLabel="Go back to camera"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} accessibilityRole="header">
          Preview
        </Text>
        <View style={styles.topBarSpacer} />
      </View>

      {/* Image Preview */}
      <View style={styles.previewContainer}>
        {params.uri ? (
          <Image
            source={{ uri: params.uri }}
            style={styles.previewImage}
            resizeMode="contain"
            accessible
            accessibilityLabel="Captured document preview"
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.placeholderText}>No image available</Text>
          </View>
        )}
      </View>

      {/* Thumbnails of saved pages */}
      {pages.length > 0 && (
        <View style={styles.thumbnailSection}>
          <Text style={styles.thumbnailLabel}>
            {pages.length} page{pages.length !== 1 ? 's' : ''} captured
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {pages.map((page, index) => (
              <ScanThumbnail
                key={page.id}
                page={page}
                index={index}
                onDelete={handleDeletePage}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetake}
          activeOpacity={0.75}
          accessibilityLabel="Retake photo"
          accessibilityRole="button"
        >
          <RotateCcw size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.useButton}
          onPress={handleUsePhoto}
          activeOpacity={0.75}
          disabled={saving}
          accessibilityLabel="Use photo and add to scan"
          accessibilityRole="button"
        >
          <Check size={20} color="#000000" strokeWidth={2.5} />
          <Text style={styles.useText}>
            {saving ? 'Saving...' : 'Use Photo'}
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...Typography.headingS,
    color: '#FFFFFF',
  },
  topBarSpacer: {
    width: 40,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  previewImage: {
    width: SCREEN_WIDTH - Spacing['2xl'],
    height: '100%',
    maxHeight: '100%',
    borderRadius: BorderRadius.lg,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
  },
  thumbnailSection: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  thumbnailLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: Spacing.sm,
  },
  thumbnailRow: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retakeText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  useButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
  },
  useText: {
    ...Typography.button,
    color: '#000000',
  },
});
