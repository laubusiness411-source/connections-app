import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  useEngagement,
  SWIPE_GOAL,
  INTRO_GOAL,
} from '../context/EngagementContext';
import { useTheme } from '../theme/ThemeContext';

function Quest({ done, label, progress, styles }) {
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
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const state = engagement?.state;
  if (!state) return null;

  const streak = state.currentStreak || 0;
  const swipes = state.daily?.swipes || 0;
  const intros = state.daily?.intros || 0;

  const swipeDone = swipes >= SWIPE_GOAL;
  const introDone = intros >= INTRO_GOAL;
  const allDone = swipeDone && introDone;

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
        <Quest done label="opened the app" styles={styles} />
        <Quest
          done={swipeDone}
          label="swipe on 5 people"
          progress={`(${Math.min(swipes, SWIPE_GOAL)}/${SWIPE_GOAL})`}
          styles={styles}
        />
        <Quest
          done={introDone}
          label="request an intro"
          progress={`(${Math.min(intros, INTRO_GOAL)}/${INTRO_GOAL})`}
          styles={styles}
        />
      </View>
    </View>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      padding: 16,
      marginTop: 12,
    },
    header: { flexDirection: 'row', alignItems: 'center' },
    flame: { fontSize: 32, marginRight: 12 },
    headText: { flex: 1 },
    streakNum: { color: t.colors.text, fontSize: 22, fontWeight: '800' },
    streakSub: { color: t.colors.textMuted, fontSize: 13, marginTop: 2 },
    best: { alignItems: 'center', paddingHorizontal: 8 },
    bestNum: { color: t.colors.warn, fontSize: 18, fontWeight: '800' },
    bestLabel: {
      color: t.colors.textFaint,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    quests: {
      marginTop: 14,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      paddingTop: 12,
      gap: 10,
    },
    quest: { flexDirection: 'row', alignItems: 'center' },
    check: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: t.colors.border,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkDone: { backgroundColor: t.colors.success, borderColor: t.colors.success },
    checkMark: { color: '#0B0B0F', fontSize: 12, fontWeight: '900' },
    questLabel: { color: t.colors.textSoft, fontSize: 14, fontWeight: '600' },
    questLabelDone: {
      color: t.colors.textFaint,
      textDecorationLine: 'line-through',
    },
  });
