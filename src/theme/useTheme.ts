import { useColorScheme } from 'react-native';
import { Light, Dark, Palette, type Theme } from './tokens';

/**
 * Returns the active theme based on the system color scheme.
 * Mirrors web's "auto" theme behaviour (no manual toggle yet on mobile —
 * matches device setting). To add a manual toggle later, wire to
 * a Zustand store + AsyncStorage.
 */
export function useTheme(): Theme & { brand: typeof Palette.brand; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const t = isDark ? Dark : Light;
  return { ...t, brand: Palette.brand, isDark };
}

export { Palette, Spacing, FontSize, Radius } from './tokens';
