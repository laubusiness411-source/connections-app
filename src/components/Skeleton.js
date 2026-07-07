import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Pulsing placeholder blocks shown while content loads.

export function Pulse({ style }) {
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        { backgroundColor: theme.colors.surface2, borderRadius: 8, opacity: anim },
        style,
      ]}
    />
  );
}

// Deck-shaped skeleton for Discover.
export function SkeletonCard() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.card}>
      <Pulse style={styles.banner} />
      <View style={styles.body}>
        <Pulse style={styles.line1} />
        <Pulse style={styles.line2} />
        <Pulse style={styles.line3} />
        <View style={styles.chips}>
          <Pulse style={styles.chip} />
          <Pulse style={styles.chip} />
        </View>
      </View>
    </View>
  );
}

// Row skeletons for the Messages list.
export function SkeletonRows({ count = 3 }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.rows}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.row}>
          <Pulse style={styles.avatar} />
          <View style={styles.rowText}>
            <Pulse style={styles.rowLine1} />
            <Pulse style={styles.rowLine2} />
          </View>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: 14,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      overflow: 'hidden',
    },
    banner: { height: 230, borderRadius: 0 },
    body: { padding: 20 },
    line1: { height: 22, width: '55%' },
    line2: { height: 14, width: '40%', marginTop: 12 },
    line3: { height: 14, width: '70%', marginTop: 10 },
    chips: { flexDirection: 'row', gap: 8, marginTop: 20 },
    chip: { height: 30, width: 110 },
    rows: { paddingHorizontal: 16, paddingTop: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: 12,
      marginBottom: 10,
    },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    rowText: { flex: 1, marginLeft: 12 },
    rowLine1: { height: 14, width: '45%' },
    rowLine2: { height: 12, width: '70%', marginTop: 8 },
  });
