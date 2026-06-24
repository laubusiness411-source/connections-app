import React from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
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

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.28;

export default function SwipeCard({ profile, isTop, onSwipe, onReport }) {
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
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>
              {profile.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.role}>{profile.role}</Text>
          <Text style={styles.meta}>
            {profile.location}  ·  {profile.commitment}
          </Text>

          <View style={styles.pill}>
            <Text style={styles.pillText}>{profile.ideaStatus}</Text>
          </View>

          <Text style={styles.bio}>{profile.bio}</Text>

          <Text style={styles.label}>Looking for</Text>
          <Text style={styles.lookingFor}>{profile.lookingFor}</Text>

          <View style={styles.tags}>
            {profile.skills.map((s) => (
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

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_W - 32,
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    overflow: 'hidden',
  },
  behind: { transform: [{ scale: 0.95 }] },
  avatarWrap: {
    height: 220,
    backgroundColor: '#1E1E28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 34, fontWeight: '700' },
  body: { padding: 20, flex: 1 },
  name: { color: '#fff', fontSize: 24, fontWeight: '700' },
  role: { color: '#6C5CE7', fontSize: 15, fontWeight: '600', marginTop: 2 },
  meta: { color: '#8A8A99', fontSize: 13, marginTop: 6 },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#232331',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  pillText: { color: '#B8B8C7', fontSize: 12, fontWeight: '600' },
  bio: { color: '#C8C8D4', fontSize: 14, lineHeight: 20, marginTop: 14 },
  label: { color: '#6A6A78', fontSize: 11, fontWeight: '700', marginTop: 16, letterSpacing: 1 },
  lookingFor: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 3 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 },
  tag: {
    backgroundColor: '#232331',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: { color: '#A8A8B8', fontSize: 12, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: 28,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 3,
  },
  likeBadge: { right: 20, borderColor: '#2ECC71', transform: [{ rotate: '12deg' }] },
  nopeBadge: { left: 20, borderColor: '#FF4D6D', transform: [{ rotate: '-12deg' }] },
  likeText: { color: '#2ECC71', fontSize: 22, fontWeight: '800' },
  nopeText: { color: '#FF4D6D', fontSize: 22, fontWeight: '800' },
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