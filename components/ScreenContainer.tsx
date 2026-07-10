import React from 'react';
import {
  View,
  StyleSheet,
  type ViewStyle,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function ScreenContainer({
  children,
  scrollable = true,
  style,
  contentStyle,
}: ScreenContainerProps) {
  const { colors } = useTheme();

  if (scrollable) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }, style]}
        edges={['top']}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }, style]}
      edges={['top']}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});
