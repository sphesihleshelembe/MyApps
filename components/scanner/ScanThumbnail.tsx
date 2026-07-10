import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius } from '@/theme';
import type { ScanPage } from '@/types';

interface ScanThumbnailProps {
  page: ScanPage;
  index: number;
  onDelete?: (pageId: string) => void;
  onPress?: (pageId: string) => void;
  active?: boolean;
}

export const ScanThumbnail = memo(function ScanThumbnail({
  page,
  index,
  onDelete,
  onPress,
  active = false,
}: ScanThumbnailProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: colors.card,
        },
      ]}
      onPress={() => onPress?.(page.id)}
      activeOpacity={0.75}
      accessibilityLabel={`Page ${index + 1} thumbnail`}
      accessibilityHint="Double tap to view this page"
    >
      <Image
        source={{ uri: page.uri }}
        style={styles.image}
        resizeMode="cover"
      />
      <View
        style={[
          styles.pageBadge,
          { backgroundColor: active ? colors.primary : colors.overlay },
        ]}
      >
        <Text
          style={[
            styles.pageBadgeText,
            { color: active ? '#FFFFFF' : '#FFFFFF' },
          ]}
        >
          {index + 1}
        </Text>
      </View>
      {onDelete && (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: colors.overlay },
          ]}
          onPress={(e) => {
            e.stopPropagation?.();
            onDelete(page.id);
          }}
          hitSlop={8}
          accessibilityLabel={`Delete page ${index + 1}`}
          accessibilityRole="button"
        >
          <X size={12} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 80,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    overflow: 'visible',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xs,
  },
  pageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBadgeText: {
    ...Typography.label,
    fontSize: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
