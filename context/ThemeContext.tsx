import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/theme";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  colors: typeof Colors.light;
  isDark: boolean;
  themeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "noviq_theme";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemTheme = useColorScheme();

  const [theme, setThemeState] = useState<ThemeMode>("system");
const [loaded, setLoaded] = useState(false);

useEffect(() => {
  AsyncStorage.getItem(STORAGE_KEY)
    .then((saved) => {
      if (
        saved === "light" ||
        saved === "dark" ||
        saved === "system"
      ) {
        setThemeState(saved);
      }
    })
    .finally(() => {
      setLoaded(true);
    });
}, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem(STORAGE_KEY, newTheme);
  };

  const isDark =
    theme === "system"
      ? systemTheme === "dark"
      : theme === "dark";

  const colors = isDark ? Colors.dark : Colors.light;

const value = useMemo(
  () => ({
    theme,
    setTheme,
    colors,
    isDark,
    themeLoaded: loaded,
  }),
  [theme, isDark, loaded]
);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useThemeContext must be used inside ThemeProvider"
    );
  }

  return context;
}