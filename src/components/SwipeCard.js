import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { computeSimilarities, computeMatchPercent } from '../data/similarities';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.28;

export default function SwipeCard({ profile, isTop, onSwipe, onReport, me }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const sims = useMemo(() => computeSimilarities(me, profile), [me, profile]);
  const pct = useMemo(() => computeMatchPercent(me, profile), [me, profile]);
  const initials = profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

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
          () => runOnJS(onSwipe)(dir, profile)
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

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle, !isTop && styles.behind]}>
        <Animated.View style={[styles.badge, styles.likeBadge, likeStyle]}>
          <Text style={styles.likeText}>CONNECT</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.nopeBadge, nopeStyle]}>
          <Text style={styles.nopeText}>PASS</Text>
        </Animated.View>

        {/* Banner */}
        <View style={styles.banner}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.photo} />
          ) : (
            <LinearGradient
              colors={theme.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.photo}
            >
              <Text style={styles.bannerInitials}>{initials}</Text>
            </LinearGradient>
          )}

          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>{pct}% match</Text>
          </View>

          {isTop && onReport && (
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => onReport(profile)}
              hitSlop={10}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.role}>{profile.role}</Text>
          <Text style={styles.meta}>
            {profile.location}
            {profile.commitment ? `  ·  ${profile.commitment}` : ''}
          </Text>
          {profile.school ? (
            <Text style={styles.meta}>
              🎓 {profile.school}
              {profile.gradYear ? `  ·  ${profile.gradYear}` : ''}
            </Text>
          ) : null}

          {sims.length > 0 && (
            <View style={styles.simSection}>
              <Text style={styles.simLabel}>WHY YOU MATCHED</Text>
              {sims.map((s) => (
                <View key={s} style={styles.simChip}>
                  <View style={styles.simDot} />
                  <Text style={styles.simText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.spacer} />

          <View style={styles.tags}>
            {(profile.skills || []).slice(0, 4).map((s) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
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
      borderRadius: 24,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      overflow: 'hidden',
    },
    behind: { transform: [{ scale: 0.95 }] },
    banner: { height: 230 },
    photo: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    bannerInitials: { color: '#fff', fontSize: 64, fontWeight: '800', letterSpacing: 2 },
    matchBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: 'rgba(11,11,15,0.55)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    matchBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
    reportBtn: {
      position: 'absolute',
      top: 14,
      left: 14,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(11,11,15,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    reportIcon: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 22 },
    body: { padding: 20, flex: 1 },
    name: { color: t.colors.text, fontSize: 24, fontWeight: '800' },
    role: { color: t.colors.textSoft, fontSize: 15, fontWeight: '600', marginTop: 3 },
    meta: { color: t.colors.textMuted, fontSize: 13, marginTop: 6 },
    simSection: { marginTop: 16 },
    simLabel: {
      color: t.colors.accentSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 10,
    },
    simChip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: t.colors.surface2,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 14,
      marginBottom: 8,
    },
    simDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.colors.accent,
      marginRight: 8,
    },
    simText: { color: t.colors.textSoft, fontSize: 13, fontWeight: '600' },
    spacer: { flex: 1, minHeight: 8 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
      backgroundColor: t.colors.surface2,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
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
    likeBadge: { right: 20, borderColor: t.colors.success, transform: [{ rotate: '12deg' }] },
    nopeBadge: { left: 20, borderColor: t.colors.danger, transform: [{ rotate: '-12deg' }] },
    likeText: { color: t.colors.success, fontSize: 22, fontWeight: '800' },
    nopeText: { color: t.colors.danger, fontSize: 22, fontWeight: '800' },
  });
