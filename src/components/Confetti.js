import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';

const { height: H } = Dimensions.get('window');
const COLORS = ['#6C5CE7', '#2ECC71', '#FF4D6D', '#FDCB6E', '#5BC0EB', '#A99CF0'];

// Self-contained confetti burst built on Reanimated (no native dep, safe on
// the new architecture). Mount it to play once; unmount to clear.
function Piece() {
  const p = useSharedValue(0);
  const cfg = useMemo(() => {
    const size = 6 + Math.random() * 8;
    return {
      left: Math.random() * 100,
      size,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 250,
      duration: 1600 + Math.random() * 1400,
      drift: (Math.random() - 0.5) * 220,
      fall: H * 0.7 + Math.random() * H * 0.3,
      turns: Math.random() * 8 - 4,
      radius: Math.random() > 0.5 ? size / 2 : 2,
    };
  }, []);

  useEffect(() => {
    p.value = withDelay(cfg.delay, withTiming(1, { duration: cfg.duration }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: p.value * cfg.fall },
      { translateX: p.value * cfg.drift },
      { rotate: `${p.value * cfg.turns * 360}deg` },
    ],
    opacity: interpolate(p.value, [0, 0.1, 0.85, 1], [0, 1, 1, 0]),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -30,
          left: `${cfg.left}%`,
          width: cfg.size,
          height: cfg.size,
          backgroundColor: cfg.color,
          borderRadius: cfg.radius,
        },
        style,
      ]}
    />
  );
}

export default function Confetti({ count = 60 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((i) => (
        <Piece key={i} />
      ))}
    </View>
  );
}
