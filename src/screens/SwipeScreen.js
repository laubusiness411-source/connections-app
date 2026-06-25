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
import GradientText from '../components/GradientText';
import { useEngagement } from '../context/EngagementContext';
import { fetchCandidates, recordSwipeRemote } from '../lib/db';

export default function SwipeScreen({
  myId,
  blocked = [],
  onBlock,
  onOpenSettings,
  onMatch,
}) {
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const engagement = useEngagement();

  const blockedIds = useMemo(() => new Set(blocked.map((b) => b.id)), [blocked]);

  const load = useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    const list = await fetchCandidates(myId, [...blockedIds]);
    setDeck(list);
    setLoading(false);
  }, [myId, blockedIds]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => deck.filter((p) => !blockedIds.has(p.id)),
    [deck, blockedIds]
  );

  // Guards against a second swipe firing before the deck re-renders.
  const lockRef = useRef(false);
  useEffect(() => {
    lockRef.current = false;
  }, [visible]);

  const handleSwipe = useCallback(
    async (direction, profile) => {
      if (lockRef.current || !profile) return;
      lockRef.current = true;
      engagement?.recordSwipe();
      setDeck((d) => d.filter((p) => p.id !== profile.id));
      const res = await recordSwipeRemote(myId, profile.id, direction);
      if (res && direction === 'right') {
        onMatch?.(res.profile);
      }
    },
    [myId, engagement, onMatch]
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

  const reachedEnd = visible.length === 0;
  const top = visible[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <GradientText style={styles.logo}>CoFounder</GradientText>
          <Text style={styles.headerSub}>find your person 👀</Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.gearBtn} onPress={load} hitSlop={10}>
            <Text style={styles.gear}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={onOpenSettings}
            hitSlop={10}
          >
            <Text style={styles.gear}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.deck}>
        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator color="#6C5CE7" size="large" />
          </View>
        ) : reachedEnd ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>no one new right now</Text>
            <Text style={styles.emptyText}>
              your deck fills up as real people join. invite a friend to sign up —
              or make a second account to test matching 😉
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={load}>
              <Text style={styles.emptyBtnText}>refresh 🔄</Text>
            </TouchableOpacity>
          </View>
        ) : (
          visible
            .slice(0, 2)
            .reverse()
            .map((profile, i, arr) => {
              const isTop = i === arr.length - 1;
              return (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  isTop={isTop}
                  onSwipe={handleSwipe}
                  onReport={handleReport}
                />
              );
            })
        )}
      </View>

      {!loading && !reachedEnd && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.passBtn]}
            onPress={() => handleSwipe('left', top)}
          >
            <Text style={styles.passIcon}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.likeBtn]}
            onPress={() => handleSwipe('right', top)}
          >
            <Text style={styles.likeIcon}>✓</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: { color: '#6C5CE7', fontSize: 26, fontWeight: '800' },
  headerSub: { color: '#6A6A78', fontSize: 13, marginTop: 2 },
  headerBtns: { flexDirection: 'row', gap: 10 },
  gearBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
  },
  gear: { color: '#B8B8C7', fontSize: 20 },
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
  passBtn: { borderColor: '#FF4D6D', backgroundColor: '#16161D' },
  likeBtn: { borderColor: '#2ECC71', backgroundColor: '#16161D' },
  passIcon: { color: '#FF4D6D', fontSize: 28, fontWeight: '700' },
  likeIcon: { color: '#2ECC71', fontSize: 28, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptyText: {
    color: '#8A8A99',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#6C5CE7',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  emptyBtnText: { color: '#A99CF0', fontSize: 15, fontWeight: '700' },
});
