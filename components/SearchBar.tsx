import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search tools and files...',
  onClear,
}: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Search size={18} color={colors.textSecondary} strokeWidth={2} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={8}
        >
          <View
            style={[styles.clearButton, { backgroundColor: colors.border }]}
          >
            <X size={12} color={colors.textSecondary} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    paddingVertical: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
