import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius } from '@/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  size = 'md',
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isDisabled = disabled || loading;
  const sizeStyles = SIZE_STYLES[size];

  return (
    <AnimatedTouchable
      style={[
        styles.base,
        sizeStyles.button,
        { backgroundColor: isDisabled ? colors.border : colors.primary },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text
          style={[
            styles.label,
            sizeStyles.label,
            { color: isDisabled ? colors.textDisabled : '#FFFFFF' },
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedTouchable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  size = 'md',
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isDisabled = disabled || loading;
  const sizeStyles = SIZE_STYLES[size];

  return (
    <AnimatedTouchable
      style={[
        styles.base,
        sizeStyles.button,
        {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDisabled ? colors.border : colors.primary,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            sizeStyles.label,
            { color: isDisabled ? colors.textDisabled : colors.primary },
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedTouchable>
  );
}

const SIZE_STYLES = {
  sm: {
    button: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
    label: { fontSize: 13 } as TextStyle,
  },
  md: {
    button: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
    label: { fontSize: 15 } as TextStyle,
  },
  lg: {
    button: { paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.base, borderRadius: BorderRadius.lg },
    label: { fontSize: 16 } as TextStyle,
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    ...Typography.button,
  },
});
