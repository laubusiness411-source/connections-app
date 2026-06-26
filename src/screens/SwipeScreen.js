import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeCard from '../components/SwipeCard';
import JobCard from '../components/JobCard';
import GradientText from '../components/GradientText';
import { useEngagement } from '../context/EngagementContext';
import { useTheme } from '../theme/ThemeContext';
import { fetchCandidates, recordSwipeRemote } from '../lib/db';
import { JOBS } from '../data/jobs';

export default function SwipeScreen({
  myId,
  myProfile,
  blocked = [],
  onBlock,
  onOpenSettings,
  onMatch,
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const engagement = useEngagement();

  const [mode, setMode] = useState('people'); // 'people' | 'jobs'

  // People
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const blockedIds = useMemo(() => new Set(blocked.map((b) => b.id)), [blocked]);

  // Jobs
  const [seenJobs, setSeenJobs] = useState([]);
  const [nearMe, setNearMe] = useState(false);

  const load = useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    const list = await fetchCandidates(myId, [...blockedIds]);
    setPeople(list);
    setLoading(false);
  }, [myId, blockedIds]);

  useEffect(() => {
    load();
  }, [load]);

  const peopleVisible = useMemo(
    () => people.filter((p) => !blockedIds.has(p.id)),
    [people, blockedIds]
  );

  const myLoc = (myProfile?.location || '').toLowerCase();
  const jobsVisible = useMemo(() => {
    const seen = new Set(seenJobs);
    return JOBS.filter(
      (j) =>
        !seen.has(j.id) &&
        (!nearMe || j.remote || j.location.toLowerCase() === myLoc)
    );
  }, [seenJobs, nearMe, myLoc]);

  // Guard against a second swipe before re-render.
  const lockRef = useRef(false);
  useEffect(() => {
    lockRef.current = false;
  }, [peopleVisible, jobsVisible, mode]);

  const handlePeopleSwipe = useCallback(
    async (direction, profile) => {
      if (lockRef.current || !profile) return;
      lockRef.current = true;
      engagement?.recordSwipe();
      setPeople((d) => d.filter((p) => p.id !== profile.id));
      const res = await recordSwipeRemote(myId, profile.id, direction);
      if (res && direction === 'right') onMatch?.(res.profile);
    },
    [myId, engagement, onMatch]
  );

  const handleJobSwipe = useCallback(
    (direction, job) => {
      if (lockRef.current || !job) return;
      lockRef.current = true;
      engagement?.recordSwipe();
      setSeenJobs((s) => [...s, job.id]);
      if (direction === 'right') {
        Alert.alert(
          'Application sent',
          `Your profile was sent to ${job.company} for the ${job.title} role. You'll be notified when they respond.`
        );
      }
    },
    [engagement]
  );

  const handleReport = useCallback(
    (profile) => {
      Alert.alert(profile.name, 'What would you like to do?', [
        { text: 'Block', style: 'destructive', onPress: () => onBlock?.(profile) },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => onBlock?.(profile, { reported: true }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [onBlock]
  );

  const refresh = () => {
    if (mode === 'people') load();
    else setSeenJobs([]);
  };

  const isJobs = mode === 'jobs';
  const reachedEnd = isJobs ? jobsVisible.length === 0 : peopleVisible.length === 0;
  const topPerson = peopleVisible[0];
  const topJob = jobsVisible[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <GradientText style={styles.logo}>Discover</GradientText>
          <Text style={styles.headerSub}>
            {isJobs ? 'Jobs that fit you' : 'People who fit your goal'}
          </Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.gearBtn} onPress={refresh} hitSlop={10}>
            <Text style={styles.gear}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gearBtn} onPress={onOpenSettings} hitSlop={10}>
            <Text style={styles.gear}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* People / Jobs toggle */}
      <View style={styles.segment}>
        {[
          { key: 'people', label: 'People' },
          { key: 'jobs', label: 'Jobs' },
        ].map((s) => {
          const on = mode === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.segBtn, on && styles.segBtnOn]}
              onPress={() => setMode(s.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.segText, on && styles.segTextOn]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Near me filter (jobs only) */}
      {isJobs && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, nearMe && styles.filterPillOn]}
            onPress={() => setNearMe((v) => !v)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterText, nearMe && styles.filterTextOn]}>
              📍 Near me{myProfile?.location ? ` · ${myProfile.location}` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.deck}>
        {!isJobs && loading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={theme.colors.accent} size="large" />
          </View>
        ) : reachedEnd ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {isJobs ? 'No more jobs right now' : "You're all caught up"}
            </Text>
            <Text style={styles.emptyText}>
              {isJobs
                ? nearMe
                  ? 'Try turning off "Near me" to see jobs everywhere.'
                  : 'New roles are added often. Check back soon.'
                : 'Your list grows as more people join. Check back soon, or invite someone to join.'}
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={refresh}>
              <Text style={styles.emptyBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : isJobs ? (
          jobsVisible
            .slice(0, 2)
            .reverse()
            .map((job, i, arr) => (
              <JobCard
                key={job.id}
                job={job}
                isTop={i === arr.length - 1}
                onSwipe={handleJobSwipe}
              />
            ))
        ) : (
          peopleVisible
            .slice(0, 2)
            .reverse()
            .map((profile, i, arr) => (
              <SwipeCard
                key={profile.id}
                profile={profile}
                isTop={i === arr.length - 1}
                onSwipe={handlePeopleSwipe}
                onReport={handleReport}
              />
            ))
        )}
      </View>

      {!reachedEnd && !(loading && !isJobs) && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.passBtn]}
            onPress={() =>
              isJobs
                ? handleJobSwipe('left', topJob)
                : handlePeopleSwipe('left', topPerson)
            }
          >
            <Text style={styles.passIcon}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.likeBtn]}
            onPress={() =>
              isJobs
                ? handleJobSwipe('right', topJob)
                : handlePeopleSwipe('right', topPerson)
            }
          >
            <Text style={styles.likeIcon}>{isJobs ? '↗' : '✓'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },
    logo: { color: t.colors.accent, fontSize: 26, fontWeight: '800' },
    headerSub: { color: t.colors.textFaint, fontSize: 13, marginTop: 2 },
    headerBtns: { flexDirection: 'row', gap: 10 },
    gearBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    gear: { color: t.colors.textSoft, fontSize: 20 },
    segment: {
      flexDirection: 'row',
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 22,
      marginHorizontal: 20,
      padding: 4,
    },
    segBtn: { flex: 1, paddingVertical: 9, borderRadius: 18, alignItems: 'center' },
    segBtnOn: { backgroundColor: t.colors.accent },
    segText: { color: t.colors.textMuted, fontSize: 14, fontWeight: '700' },
    segTextOn: { color: '#fff' },
    filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10 },
    filterPill: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    filterPillOn: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
    filterText: { color: t.colors.textMuted, fontSize: 13, fontWeight: '600' },
    filterTextOn: { color: '#fff' },
    deck: { flex: 1, marginHorizontal: 16, marginVertical: 8 },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 28,
      paddingVertical: 20,
    },
    controlBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    passBtn: { borderColor: t.colors.danger, backgroundColor: t.colors.surface },
    likeBtn: { borderColor: t.colors.success, backgroundColor: t.colors.surface },
    passIcon: { color: t.colors.danger, fontSize: 28, fontWeight: '700' },
    likeIcon: { color: t.colors.success, fontSize: 28, fontWeight: '700' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    emptyTitle: { color: t.colors.text, fontSize: 20, fontWeight: '700' },
    emptyText: {
      color: t.colors.textMuted,
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyBtn: {
      marginTop: 20,
      borderWidth: 1,
      borderColor: t.colors.accent,
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingVertical: 12,
    },
    emptyBtnText: { color: t.colors.accentSoft, fontSize: 15, fontWeight: '700' },
  });
