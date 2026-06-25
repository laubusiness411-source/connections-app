import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  useEngagement,
  SWIPE_GOAL,
  INTRO_GOAL,
} from '../context/EngagementContext';

function Quest({ done, label, progress }) {
  return (
    <View style={styles.quest}>
      <View style={[styles.check, done && styles.checkDone]}>
        {done && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={[styles.questLabel, done && styles.questLabelDone]}>
        {label}
        {progress ? `  ${progress}` : ''}
      </Text>
    </View>
  );
}

export default function StreakCard() {
  const engagement = useEngagement();
  const state = engagement?.state;
  if (!state) return null;

  const streak = state.currentStreak || 0;
  const swipes = state.daily?.swipes || 0;
  const intros = state.daily?.intros || 0;

  const swipeDone = swipes >= SWIPE_GOAL;
  const introDone = intros >= INTRO_GOAL;
  const allDone = swipeDone && introDone; // check-in is implicit (you're here)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.flame}>🔥</Text>
        <View style={styles.headText}>
          <Text style={styles.streakNum}>
            {streak} day{streak === 1 ? '' : 's'}
          </Text>
          <Text style={styles.streakSub}>
            {allDone
              ? 'daily goal complete — streak secured!'
              : 'keep your streak alive today'}
          </Text>
        </View>
        {state.longestStreak > 1 && (
          <View style={styles.best}>
            <Text style={styles.bestNum}>{state.longestStreak}</Text>
            <Text style={styles.bestLabel}>best</Text>
          </View>
        )}
      </View>

      <View style={styles.quests}>
        <Quest done label="opened the app" />
        <Quest
          done={swipeDone}
          label="swipe on 5 people"
          progress={`(${Math.min(swipes, SWIPE_GOAL)}/${SWIPE_GOAL})`}
        />
        <Quest
          done={introDone}
          label="request an intro"
          progress={`(${Math.min(intros, INTRO_GOAL)}/${INTRO_GOAL})`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A140F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4A3320',
    padding: 16,
    marginTop: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  flame: { fontSize: 32, marginRight: 12 },
  headText: { flex: 1 },
  streakNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  streakSub: { color: '#C9A98A', fontSize: 13, marginTop: 2 },
  best: { alignItems: 'center', paddingHorizontal: 8 },
  bestNum: { color: '#FDCB6E', fontSize: 18, fontWeight: '800' },
  bestLabel: { color: '#8A7A60', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  quests: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#2E2418',
    paddingTop: 12,
    gap: 10,
  },
  quest: { flexDirection: 'row', alignItems: 'center' },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4A3320',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: '#2ECC71', borderColor: '#2ECC71' },
  checkMark: { color: '#0B0B0F', fontSize: 12, fontWeight: '900' },
  questLabel: { color: '#C8C8D4', fontSize: 14, fontWeight: '600' },
  questLabelDone: { color: '#6A6A78', textDecorationLine: 'line-through' },
});
