/**
 * Design tokens — mirrors the desktop palette at /frontend/app/globals.css
 * so the mobile experience feels like the same product.
 *
 * Brand: VibeHub purple (#9333EA) — modern Tailwind purple-600.
 * Brand gradient: purple-500 → pink-500 (signature CTA / hero / logo treatment).
 *
 * The previous mobile palette used #7C3AED which is violet-600 — close to
 * desktop but with a noticeably bluer cast. Switching to #9333EA aligns the
 * two products visually.
 */

export const Palette = {
  // Brand
  brand: '#9333EA',          // purple-600 — primary CTA, accents, focus rings
  brandHover: '#7E22CE',     // purple-700 — pressed state
  brandSoft: '#F5F3FF',      // purple-50 — chip backgrounds in light mode
  brandSoftDark: 'rgba(147,51,234,0.15)', // subtle purple tint in dark mode

  gradientStart: '#A855F7',  // purple-500
  gradientMid:   '#EC4899',  // pink-500
  gradientEnd:   '#F59E0B',  // amber-500 (text-gradient-brand third stop)

  // Semantic colors (consistent with desktop)
  success: '#10B981',        // emerald-500
  warning: '#F59E0B',        // amber-500
  danger:  '#EF4444',        // red-500
  info:    '#3B82F6',        // blue-500
} as const;

/**
 * Light theme — matches desktop :root in globals.css
 */
export const Light = {
  bgBody:        '#F8F9FB',
  bgCard:        '#FFFFFF',
  bgCardHover:   '#F9FAFB',
  bgMuted:       '#F3F4F6',
  bgInput:       '#FFFFFF',
  borderPrimary: '#E5E7EB',
  borderSecondary: '#D1D5DB',
  textPrimary:   '#111827',
  textSecondary: '#4B5563',
  textMuted:     '#9CA3AF',
  textInverse:   '#FFFFFF',
  navBg:         '#FFFFFF',
  navBorder:     '#E5E7EB',
  overlayBg:     'rgba(0, 0, 0, 0.4)',
  shadow:        '#00000010', // 6% black for cards
  ringFocus:     '#A855F7',   // purple-500 with opacity in usage
} as const;

/**
 * Dark theme — matches desktop .dark in globals.css
 */
export const Dark = {
  bgBody:        '#070A12',
  bgCard:        '#111827',
  bgCardHover:   '#1A2332',
  bgMuted:       '#1F2937',
  bgInput:       '#111827',
  borderPrimary: '#1F2937',
  borderSecondary: '#374151',
  textPrimary:   '#FFFFFF',
  textSecondary: '#D1D5DB',
  textMuted:     '#6B7280',
  textInverse:   '#111827',
  navBg:         '#000000',
  navBorder:     '#1F2937',
  overlayBg:     'rgba(0, 0, 0, 0.7)',
  shadow:        '#00000060',
  ringFocus:     '#A855F7',
} as const;

/** Widen the literal types so Light and Dark are interchangeable. */
export type Theme = { [K in keyof typeof Light]: string };

/**
 * Backwards-compat alias so existing screens that hardcoded the old
 * violet `#7C3AED` keep working — but the next refactor pass should
 * pull from Palette.brand directly.
 */
export const LEGACY_VIOLET = '#7C3AED';

/**
 * Common spacing scale (matches Tailwind for parity with desktop).
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

/**
 * Type scale (matches desktop font sizes).
 */
export const FontSize = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

/**
 * Radius scale (matches Tailwind rounded-*).
 */
export const Radius = {
  sm:   6,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;
