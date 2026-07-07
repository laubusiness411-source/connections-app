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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwipeCard from '../components/SwipeCard';
import JobCard from '../components/JobCard';
import GradientText from '../components/GradientText';
import { useEngagement } from '../context/EngagementContext';
import { useTheme } from '../theme/ThemeContext';
import { fetchCandidates, recordSwipeRemote } from '../lib/db';
import { JOBS } from '../data/jobs';
import { PROFILES } from '../data/profiles';
import { parseState } from '../data/usStates';
import FiltersScreen from './FiltersScreen';
import PassedScreen from './PassedScreen';
import {
  useFilters,
  activeJobCount,
  activePeopleCount,
} from '../context/FiltersContext';

// Demo people so the deck is never empty while testing.
const DEMO_PEOPLE = PROFILES.map((p) => ({ ...p, isDemo: true }));

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
  const [seenPeople, setSeenPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const blockedIds = useMemo(() => new Set(blocked.map((b) => b.id)), [blocked]);
  const seenSet = useMemo(() => new Set(seenPeople), [seenPeople]);

  // Jobs
  const [seenJobs, setSeenJobs] = useState([]);

  const filters = useFilters();
  const [showFilters, setShowFilters] = useState(false);
  const [history, setHistory] = useState([]); // [{profile, direction}]
  const [showPassed, setShowPassed] = useState(false);
  const [daysLeft, setDaysLeft] = useState(90);

  useEffect(() => {
    (async () => {
      try {
        const KEY = '@klyk/goalStart';
        let start = await AsyncStorage.getItem(KEY);
        if (!start) {
          start = new Date().toISOString();
          await AsyncStorage.setItem(KEY, start);
        }
        const elapsed = Math.floor(
          (Date.now() - new Date(start).getTime()) / 86400000
        );
        setDaysLeft(Math.max(0, 90 - elapsed));
      } catch {
        // keep default
      }
    })();
  }, []);

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

  const pf = filters.people;
  const peopleVisible = useMemo(() => {
    const all = [...people, ...DEMO_PEOPLE];
    return all.filter((p) => {
      if (seenSet.has(p.id) || blockedIds.has(p.id)) return false;
      if (pf.roles.length && !pf.roles.includes(p.role)) return false;
      if (pf.lookingFor.length && !pf.lookingFor.includes(p.lookingFor)) return false;
      const st = parseState(p.location);
      if (st === 'Remote') return pf.includeRemote;
      if (pf.states.length && !pf.states.includes(st)) return false;
      return true;
    });
  }, [people, seenSet, blockedIds, pf]);

  const jf = filters.jobs;
  const jobsVisible = useMemo(() => {
    const seen = new Set(seenJobs);
    return JOBS.filter((j) => {
      if (seen.has(j.id)) return false;
      if (jf.types.length && !jf.types.includes(j.type)) return false;
      if ((j.payMin || 0) < jf.minPay) return false;
      if (j.remote) return jf.includeRemote;
      if (jf.states.length && !jf.states.includes(j.state)) return false;
      if (j.distanceMi > jf.maxCommute) return false;
      return true;
    });
  }, [seenJobs, jf]);

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
      setSeenPeople((s) => [...s, profile.id]);
      setHistory((h) => [
        { profile, direction },
        ...h.filter((x) => x.profile.id !== profile.id),
      ]);
      if (direction !== 'right') return;
      if (profile.isDemo) {
        // Demo people can't create a real DB match (no chat), but still
        // celebrate so swiping is testable.
        if (profile.likesYou) onMatch?.(profile);
      } else {
        const res = await recordSwipeRemote(myId, profile.id, direction);
        if (res) onMatch?.(res.profile);
      }
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

  const bringBack = (id) => {
    setSeenPeople((s) => s.filter((x) => x !== id));
    setHistory((h) => h.filter((x) => x.profile.id !== id));
  };

  const refresh = () => {
    if (mode === 'people') {
      setSeenPeople([]);
      load();
    } else {
      setSeenJobs([]);
    }
  };

  const isJobs = mode === 'jobs';
  const reachedEnd = isJobs ? jobsVisible.length === 0 : peopleVisible.length === 0;
  const topPerson = peopleVisible[0];
  const topJob = jobsVisible[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <GradientText style={styles.logo}>Klyk</GradientText>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.gearBtn} onPress={refresh} hitSlop={10}>
            <Ionicons name="refresh" size={19} color={theme.colors.textSoft} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.goalPill}
            onPress={onOpenSettings}
            hitSlop={8}
            activeOpacity={0.85}
          >
            <Ionicons name="flag" size={13} color={theme.colors.accent} />
            <Text style={styles.goalPillText}>Goal · {daysLeft} days left</Text>
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

      {/* Filters + Passed */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="options-outline" size={15} color={theme.colors.textSoft} />
          <Text style={styles.filterText}>
            Filters
            {(() => {
              const c = isJobs ? activeJobCount(jf) : activePeopleCount(pf);
              return c ? ` · ${c}` : '';
            })()}
          </Text>
        </TouchableOpacity>
        {!isJobs && (
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowPassed(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-undo-outline" size={15} color={theme.colors.textSoft} />
            <Text style={styles.filterText}>
              Passed{history.length ? ` · ${history.length}` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
                ? 'No jobs match your filters. Try widening them, or check back soon.'
                : 'Your list grows as more people join — or try widening your filters.'}
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
                me={myProfile}
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
            style={styles.passBtn}
            onPress={() =>
              isJobs
                ? handleJobSwipe('left', topJob)
                : handlePeopleSwipe('left', topPerson)
            }
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={26} color={theme.colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() =>
              isJobs
                ? handleJobSwipe('right', topJob)
                : handlePeopleSwipe('right', topPerson)
            }
            activeOpacity={0.85}
          >
            <Ionicons
              name={isJobs ? 'paper-plane' : 'checkmark'}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      )}

      {showFilters && (
        <View style={styles.filtersOverlay}>
          <FiltersScreen mode={mode} onClose={() => setShowFilters(false)} />
        </View>
      )}

      {showPassed && (
        <View style={styles.filtersOverlay}>
          <PassedScreen
            history={history}
            onBringBack={bringBack}
            onClose={() => setShowPassed(false)}
          />
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
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    gear: { color: t.colors.textSoft, fontSize: 20 },
    goalPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 40,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    goalPillText: { color: t.colors.textSoft, fontSize: 13, fontWeight: '700' },
    segment: {
      flexDirection: 'row',
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 10,
      marginHorizontal: 20,
      padding: 3,
    },
    segBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
    segBtnOn: { backgroundColor: t.colors.accent },
    segText: { color: t.colors.textMuted, fontSize: 14, fontWeight: '700' },
    segTextOn: { color: '#fff' },
    filterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 10 },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    filterText: { color: t.colors.textSoft, fontSize: 13, fontWeight: '700' },
    filtersOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.colors.bg,
      zIndex: 500,
    },
    deck: { flex: 1, marginHorizontal: 16, marginVertical: 8 },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 32,
      paddingVertical: 20,
    },
    passBtn: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    likeBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.accent,
    },
    passIcon: { color: t.colors.danger, fontSize: 26, fontWeight: '700' },
    likeIcon: { color: '#fff', fontSize: 30, fontWeight: '800' },
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
      borderRadius: 8,
      paddingHorizontal: 22,
      paddingVertical: 11,
    },
    emptyBtnText: { color: t.colors.accent, fontSize: 15, fontWeight: '700' },
  });
