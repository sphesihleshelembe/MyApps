import { useColorScheme } from 'react-native';
import { Colors } from '@/theme';

export function useTheme(): { colors: typeof Colors.light; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: (isDark ? Colors.dark : Colors.light) as typeof Colors.light,
    isDark,
  };
}
