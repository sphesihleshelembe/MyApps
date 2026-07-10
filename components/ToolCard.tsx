import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ToolCardProps {
  label: string;
  description: string;
  icon: string;
  color: string;
  isNew?: boolean;
  isPremium?: boolean;
  onPress: () => void;
}

export function ToolCard({
  label,
  description,
  icon,
  color,
  isNew,
  isPremium,
  onPress,
}: ToolCardProps) {
  const { colors, isDark } = useTheme();
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

  const IconComponent = (LucideIcons as any)[toPascalCase(icon)];
  const bgColor = hexToRgba(color, isDark ? 0.15 : 0.08);

  return (
    <AnimatedTouchable
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        Shadows.sm,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        {IconComponent ? (
          <IconComponent size={22} color={color} strokeWidth={2} />
        ) : null}
      </View>
      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text
            style={[styles.label, { color: colors.text }]}
            numberOfLines={1}
          >
            {label}
          </Text>
          {isNew && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {description}
        </Text>
      </View>
      <LucideIcons.ChevronRight size={16} color={colors.textDisabled} strokeWidth={2} />
    </AnimatedTouchable>
  );
}

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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  label: {
    ...Typography.bodyMedium,
  },
  description: {
    ...Typography.caption,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontSize: 10,
  },
});
