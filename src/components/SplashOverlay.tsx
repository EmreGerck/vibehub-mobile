import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Palette, Light, Dark } from '../theme/tokens';

interface SplashOverlayProps {
  visible: boolean;
}

/**
 * Splash screen — auto-adapts to system color scheme.
 * Logo uses the brand purple (#9333EA, matches desktop).
 */
export default function SplashOverlay({ visible }: SplashOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? Dark : Light;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!visible) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: t.bgBody, opacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.content}>
        <Text style={styles.bolt}>⚡</Text>
        <Text style={[styles.title, { color: Palette.brand }]}>VibeHub</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Sanatçıların resmi merch'i
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  bolt: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
