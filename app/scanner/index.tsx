import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  CameraView,
  useCameraPermissions,
  type CameraType,
  type FlashMode,
} from 'expo-camera';
import { ArrowLeft, Zap, ZapOff, Image as ImageIcon, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius } from '@/theme';
import { ScanSession } from '@/services/scanner/ScanSession';
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
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturing, setCapturing] = useState(false);
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function initSession() {
        if (!sessionRef.current) {
          sessionRef.current = await ScanSession.createSession();
          setSessionId(sessionRef.current.getId());
        }
        if (sessionRef.current) {
          setPages(sessionRef.current.getPages());
        }
      }
      initSession();
      return () => {
        // Keep session alive across navigation to preview
      };
    }, [])
  );

  const handleCapture = useCallback(async () => {
    if (capturing || !cameraRef.current || !sessionRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
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
  }, [capturing, router]);

  const handleFlashToggle = useCallback(() => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const handleDeletePage = useCallback(
    async (pageId: string) => {
      if (!sessionRef.current) return;
      await sessionRef.current.removePage(pageId);
      setPages(sessionRef.current.getPages());
    },
    []
  );

  // Permission still loading
  if (!permission) {
    return <View style={[styles.loadingContainer, { backgroundColor: colors.background }]} />;
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

  // Camera ready
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        animateShutter={false}
      >
        <CameraOverlay />
      </CameraView>

      {/* Top App Bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          {pages.length > 0 && (
            <View style={styles.pageCountBadge}>
              <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.pageCountText}>
                {pages.length} page{pages.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleFlashToggle}
          hitSlop={12}
          accessibilityLabel={flash === 'on' ? 'Turn off flash' : 'Turn on flash'}
          accessibilityRole="button"
        >
          {flash === 'on' ? (
            <Zap size={22} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <ZapOff size={22} color="rgba(255,255,255,0.7)" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Controls */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.bottomContent}>
          {/* Gallery placeholder */}
          <TouchableOpacity
            style={[
              styles.galleryButton,
              { borderColor: 'rgba(255,255,255,0.3)' },
            ]}
            activeOpacity={0.75}
            accessibilityLabel="Import from gallery"
            accessibilityRole="button"
          >
            <ImageIcon size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* Capture Button */}
          <View style={styles.captureWrapper}>
            <CaptureButton onPress={handleCapture} disabled={capturing} />
          </View>

          {/* Done / Page count */}
          <View style={styles.rightControl}>
            {pages.length > 0 ? (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.back()}
                hitSlop={12}
                accessibilityLabel="Finish scanning"
                accessibilityRole="button"
              >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.helperText}>Scan</Text>
            )}
          </View>
        </View>

        {/* Thumbnails */}
        {pages.length > 0 && (
          <View style={styles.thumbnailRow}>
            {pages.map((page, index) => (
              <ScanThumbnail
                key={page.id}
                page={page}
                index={index}
                onDelete={handleDeletePage}
              />
            ))}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
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
    paddingVertical: Spacing.sm,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pageCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  pageCountText: {
    ...Typography.captionMedium,
    color: '#FFFFFF',
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightControl: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  doneText: {
    ...Typography.button,
    color: '#000000',
    fontSize: 14,
  },
  helperText: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    minHeight: 88,
    alignItems: 'center',
  },
});
