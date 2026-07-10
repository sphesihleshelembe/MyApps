import React from 'react';
import { StyleSheet, View, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BorderRadius } from '@/theme';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const OUTER_SIZE = 76;
const INNER_SIZE = 62;
const PRESSED_INNER = 52;

export function CaptureButton({ onPress, disabled = false }: CaptureButtonProps) {
  const innerScale = useSharedValue(1);
  const ringOpacity = useSharedValue(1);

  const animatedInner = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const animatedRing = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const handlePressIn = () => {
    innerScale.value = withSpring(PRESSED_INNER / INNER_SIZE, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    innerScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    ringOpacity.value = withSequence(
      withTiming(0.3, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
  };

  return (
    <Animated.View
      style={[styles.outer, animatedRing, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel="Capture photo"
      accessibilityHint="Double tap to take a photo of your document"
      accessibilityState={{ disabled }}
      accessible
    >
      <Animated.View style={[styles.inner, animatedInner]} />
      <View
        style={styles.touchArea}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchEndCapture={handlePressOut}
        onStartShouldSetResponder={() => !disabled}
        onResponderGrant={handlePressIn}
        onResponderRelease={() => {
          handlePressOut();
          if (!disabled) {
            AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
              if (reduced) {
                innerScale.value = 1;
              }
            });
            onPress();
          }
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  inner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: '#FFFFFF',
  },
  touchArea: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
  },
  disabled: {
    opacity: 0.4,
  },
});
