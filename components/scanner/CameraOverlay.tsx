import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BorderRadius } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUIDE_WIDTH = SCREEN_WIDTH * 0.82;
const GUIDE_HEIGHT = GUIDE_WIDTH * 1.414;
const CORNER_LENGTH = 32;
const CORNER_THICKNESS = 3;

export function CameraOverlay() {
  return null;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  overlaySide: {
    flex: 1,
    height: GUIDE_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  guideFrame: {
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
    borderColor: 'transparent',
    borderWidth: CORNER_THICKNESS,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomRightRadius: 6,
  },
});

export const GUIDE_DIMENSIONS = { width: GUIDE_WIDTH, height: GUIDE_HEIGHT };
