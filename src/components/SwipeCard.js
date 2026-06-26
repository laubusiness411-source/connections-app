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
import { useTheme } from '../theme/ThemeContext';
import { computeSimilarities } from '../data/similarities';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.28;

export default function SwipeCard({ profile, isTop, onSwipe, onReport, me }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const sims = useMemo(() => computeSimilarities(me, profile), [me, profile]);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      const shouldSwipe = Math.abs(e.translationX) > SWIPE_THRESHOLD;
      if (shouldSwipe) {
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

        {isTop && onReport && (
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => onReport(profile)}
            hitSlop={10}
          >
            <Text style={styles.reportIcon}>⋯</Text>
          </TouchableOpacity>
        )}

        <View style={styles.avatarWrap}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>
                {profile.name.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.role}>{profile.role}</Text>
          <Text style={styles.meta}>
            {profile.location}  ·  {profile.commitment}
          </Text>
          {profile.school ? (
            <Text style={styles.edu}>
              🎓 {profile.school}
              {profile.gradYear ? `  ·  ${profile.gradYear}` : ''}
            </Text>
          ) : null}

          {sims.length > 0 && (
            <View style={styles.simWrap}>
              {sims.map((s) => (
                <View key={s} style={styles.simChip}>
                  <Text style={styles.simText}>✓ {s}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.pill}>
            <Text style={styles.pillText}>{profile.ideaStatus}</Text>
          </View>

          <Text style={styles.bio} numberOfLines={4} ellipsizeMode="tail">
            {profile.bio}
          </Text>

          <View style={styles.spacer} />

          <Text style={styles.label}>Looking for</Text>
          <Text style={styles.lookingFor}>{profile.lookingFor}</Text>

          <View style={styles.tags}>
            {(profile.skills || []).map((s) => (
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
    avatarWrap: {
      height: 190,
      backgroundColor: t.colors.surface3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: { color: '#fff', fontSize: 34, fontWeight: '700' },
    photo: { width: '100%', height: '100%' },
    body: { padding: 20, flex: 1 },
    name: { color: t.colors.text, fontSize: 24, fontWeight: '700' },
    role: { color: t.colors.accent, fontSize: 15, fontWeight: '600', marginTop: 2 },
    meta: { color: t.colors.textMuted, fontSize: 13, marginTop: 6 },
    edu: { color: t.colors.textMuted, fontSize: 13, marginTop: 4 },
    simWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    simChip: {
      backgroundColor: t.colors.surface2,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
    },
    simText: { color: t.colors.accentSoft, fontSize: 12, fontWeight: '700' },
    pill: {
      alignSelf: 'flex-start',
      backgroundColor: t.colors.surface2,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      marginTop: 12,
    },
    pillText: { color: t.colors.textSoft, fontSize: 12, fontWeight: '600' },
    bio: { color: t.colors.textSoft, fontSize: 14, lineHeight: 20, marginTop: 14 },
    spacer: { flex: 1, minHeight: 8 },
    label: {
      color: t.colors.textFaint,
      fontSize: 11,
      fontWeight: '700',
      marginTop: 16,
      letterSpacing: 1,
    },
    lookingFor: { color: t.colors.text, fontSize: 15, fontWeight: '600', marginTop: 3 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 },
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
    reportBtn: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    reportIcon: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 24 },
  });
