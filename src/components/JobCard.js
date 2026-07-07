import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.28;

function companyInitials(name) {
  return name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
}

export default function JobCard({ job, isTop, onSwipe, me }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const skillFit = useMemo(() => {
    const mine = new Set((me?.skills || []).map((s) => s.toLowerCase()));
    return (job.tags || []).filter((t) => mine.has(t.toLowerCase())).length;
  }, [me, job]);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const dir = e.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(
          Math.sign(e.translationX) * SCREEN_W * 1.5,
          { duration: 250 },
          () => runOnJS(onSwipe)(dir, job)
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_W / 2, 0, SCREEN_W / 2],
      [-8, 0, 8],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const applyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle, !isTop && styles.behind]}>
        <Animated.View style={[styles.badge, styles.applyBadge, applyStyle]}>
          <Text style={styles.applyText}>APPLY</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.passBadge, passStyle]}>
          <Text style={styles.passText}>PASS</Text>
        </Animated.View>

        <View style={styles.headerBand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{companyInitials(job.company)}</Text>
          </View>
          <Text style={styles.company}>{job.company}</Text>
          {job.remote && (
            <View style={styles.remotePill}>
              <Text style={styles.remoteText}>Remote</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.meta}>
            {job.location}  ·  {job.type}
          </Text>
          <Text style={styles.salary}>{job.salary}</Text>
          {skillFit > 0 && (
            <View style={styles.fitRow}>
              <Ionicons name="checkmark-circle" size={15} color={theme.colors.accent} />
              <Text style={styles.fitText}>
                Matches {skillFit} of your skill{skillFit === 1 ? '' : 's'}
              </Text>
            </View>
          )}

          <Text style={styles.description} numberOfLines={6} ellipsizeMode="tail">
            {job.description}
          </Text>

          <View style={styles.spacer} />

          <View style={styles.tags}>
            {(job.tags || []).map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    card: {
      position: 'absolute',
      width: SCREEN_W - 32,
      height: '100%',
      borderRadius: 14,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      overflow: 'hidden',
    },
    behind: { transform: [{ scale: 0.95 }] },
    headerBand: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.surface3,
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    logo: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    logoText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    company: { color: t.colors.text, fontSize: 18, fontWeight: '700', flex: 1 },
    remotePill: {
      backgroundColor: t.colors.surface2,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    remoteText: { color: t.colors.textSoft, fontSize: 11, fontWeight: '700' },
    body: { padding: 20, flex: 1 },
    title: { color: t.colors.text, fontSize: 24, fontWeight: '800' },
    meta: { color: t.colors.textMuted, fontSize: 13, marginTop: 8 },
    salary: { color: t.colors.success, fontSize: 16, fontWeight: '700', marginTop: 6 },
    fitRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    fitText: { color: t.colors.accent, fontSize: 13, fontWeight: '700' },
    description: { color: t.colors.textSoft, fontSize: 14, lineHeight: 21, marginTop: 16 },
    spacer: { flex: 1, minHeight: 8 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
      backgroundColor: t.colors.surface2,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
    },
    tagText: { color: t.colors.textMuted, fontSize: 12, fontWeight: '600' },
    badge: {
      position: 'absolute',
      top: 28,
      zIndex: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 3,
    },
    applyBadge: { right: 20, borderColor: t.colors.success, transform: [{ rotate: '12deg' }] },
    passBadge: { left: 20, borderColor: t.colors.danger, transform: [{ rotate: '-12deg' }] },
    applyText: { color: t.colors.success, fontSize: 22, fontWeight: '800' },
    passText: { color: t.colors.danger, fontSize: 22, fontWeight: '800' },
  });
