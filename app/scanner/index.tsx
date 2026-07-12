import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  CameraView,
  useCameraPermissions,
  type CameraType,
  type FlashMode,
} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Zap, ZapOff, Image as ImageIcon, ScanLine } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius } from '@/theme';
import { ScanSession } from '@/services/scanner/ScanSession';
import { saveScanImage } from '@/services/scanner/imageStorage';
import { CameraOverlay } from '@/components/scanner/CameraOverlay';
import { CaptureButton } from '@/components/scanner/CaptureButton';
import { PermissionView } from '@/components/scanner/PermissionView';
import { ScanThumbnail } from '@/components/scanner/ScanThumbnail';
import type { ScanPage } from '@/types';

export default function ScannerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const sessionRef = useRef<ScanSession | null>(null);
  const [facing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturing, setCapturing] = useState(false);
  const [importingGallery, setImportingGallery] = useState(false);
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function initSession() {
        if (!sessionRef.current) {
          sessionRef.current = await ScanSession.createSession();
        }
        // Refresh pages every time we return from preview
        if (sessionRef.current) {
          const freshSession = await ScanSession.load(sessionRef.current.getId());
          if (freshSession) {
            sessionRef.current = freshSession;
          }
          setPages(sessionRef.current.getPages());
        }
      }
      initSession();
    }, [])
  );

  const handleCapture = useCallback(async () => {
    if (capturing || importingGallery || !cameraRef.current || !sessionRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.92,
        skipProcessing: false,
      });
      if (photo) {
        router.push({
          pathname: '/scanner/preview',
          params: {
            uri: photo.uri,
            width: String(photo.width),
            height: String(photo.height),
            sessionId: sessionRef.current.getId(),
          },
        });
      }
    } catch (e) {
      console.warn('Capture failed:', e);
    } finally {
      setCapturing(false);
    }
  }, [capturing, importingGallery, router]);

  const handleFlashToggle = useCallback(() => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const handleDeletePage = useCallback(async (pageId: string) => {
    if (!sessionRef.current) return;
    await sessionRef.current.removePage(pageId);
    setPages(sessionRef.current.getPages());
  }, []);

  const handleGallery = useCallback(async () => {
    if (capturing || importingGallery || !sessionRef.current) return;
    setImportError(null);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setImportError('Photo library permission is required to import images.');
      return;
    }

    setImportingGallery(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        quality: 0.92,
        selectionLimit: 20,
      });

      if (!result.canceled && result.assets.length > 0) {
        for (const asset of result.assets) {
          const permanentUri = await saveScanImage(asset.uri);
          await sessionRef.current.addPage({
            uri: permanentUri,
            width: asset.width,
            height: asset.height,
          });
        }
        setPages(sessionRef.current.getPages());
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to import image(s).';
      setImportError(msg);
    } finally {
      setImportingGallery(false);
    }
  }, [capturing, importingGallery]);

  const handleReviewScan = useCallback(() => {
    if (!sessionRef.current || pages.length === 0) return;
    router.push({
      pathname: '/scanner/review',
      params: { sessionId: sessionRef.current.getId() },
    });
  }, [pages.length, router]);

  const isBusy = capturing || importingGallery;

  // Permission still loading
  if (!permission) {
    return <View style={[styles.loadingContainer, { backgroundColor: '#000000' }]} />;
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <PermissionView
        onRequestPermission={requestPermission}
        onOpenSettings={handleOpenSettings}
      />
    );
  }

  return (
    <View style={styles.root}>
      {/* Camera — no children, overlay is a sibling */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        animateShutter={false}
      />

      {/* Overlay — sibling of CameraView, not a child */}
      <CameraOverlay />

      {/* Top App Bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Close scanner"
          accessibilityHint="Return to the previous screen"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          {pages.length > 0 && (
            <View style={styles.pageCountBadge}>
              <Text style={styles.pageCountText}>
                {pages.length} page{pages.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleFlashToggle}
          hitSlop={12}
          accessibilityLabel={flash === 'on' ? 'Flash is on, tap to turn off' : 'Flash is off, tap to turn on'}
          accessibilityRole="button"
        >
          {flash === 'on' ? (
            <Zap size={22} color="#FFD700" strokeWidth={2} />
          ) : (
            <ZapOff size={22} color="rgba(255,255,255,0.7)" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </SafeAreaView>

      {/* Import Error Banner */}
      {importError && (
        <View style={styles.importErrorBanner}>
          <Text style={styles.importErrorText}>{importError}</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        {/* Thumbnails strip */}
        {pages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
            style={styles.thumbnailScroll}
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
        )}

        {/* Controls row */}
        <View style={styles.controlsRow}>
          {/* Gallery */}
          <TouchableOpacity
            style={[
              styles.sideButton,
              { borderColor: 'rgba(255,255,255,0.35)', opacity: importingGallery ? 0.5 : 1 },
            ]}
            onPress={handleGallery}
            disabled={isBusy}
            accessibilityLabel="Import from photo gallery"
            accessibilityHint="Select one or more photos from your device gallery to add as scan pages"
            accessibilityRole="button"
            accessibilityState={{ disabled: isBusy }}
          >
            {importingGallery ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ImageIcon size={20} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>

          {/* Capture */}
          <CaptureButton onPress={handleCapture} disabled={isBusy} />

          {/* Review / hint */}
          <View style={styles.rightControl}>
            {pages.length > 0 ? (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={handleReviewScan}
                disabled={isBusy}
                accessibilityLabel={`Review scan — ${pages.length} page${pages.length !== 1 ? 's' : ''} captured`}
                accessibilityHint="View and manage all captured pages"
                accessibilityRole="button"
                accessibilityState={{ disabled: isBusy }}
              >
                <ScanLine size={16} color="#000000" strokeWidth={2} />
                <Text style={styles.reviewText}>Review</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.hintText} accessibilityElementsHidden>
                Tap to{'\n'}scan
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pageCountBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  pageCountText: {
    ...Typography.captionMedium,
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  thumbnailScroll: {
    flexGrow: 0,
  },
  thumbnailRow: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightControl: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    minWidth: 60,
  },
  reviewText: {
    ...Typography.label,
    color: '#000000',
    fontSize: 11,
  },
  hintText: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  importErrorBanner: {
    position: 'absolute',
    top: 90,
    left: Spacing.base,
    right: Spacing.base,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    zIndex: 50,
  },
  importErrorText: {
    ...Typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
