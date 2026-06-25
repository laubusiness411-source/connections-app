import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeCard from '../components/SwipeCard';
import GradientText from '../components/GradientText';
import { useEngagement } from '../context/EngagementContext';
import { PROFILES } from '../data/profiles';

export default function SwipeScreen({
  blocked = [],
  onBlock,
  onOpenSettings,
  onMatch,
}) {
  const [swiped, setSwiped] = useState([]);
  const engagement = useEngagement();

  const swipedIds = useMemo(() => new Set(swiped), [swiped]);
  const blockedIds = useMemo(() => new Set(blocked.map((b) => b.id)), [blocked]);
  const deck = useMemo(
    () => PROFILES.filter((p) => !swipedIds.has(p.id) && !blockedIds.has(p.id)),
    [swipedIds, blockedIds]
  );

  // Guards against a second swipe firing before the deck re-renders.
  const lockRef = useRef(false);
  useEffect(() => {
    lockRef.current = false;
  }, [deck]);

  const handleSwipe = useCallback(
    (direction, profile) => {
      if (lockRef.current || !profile) return;
      lockRef.current = true;
      if (direction === 'right' && profile.likesYou) {
        onMatch?.(profile);
      }
      engagement?.recordSwipe();
      setSwiped((s) => [...s, profile.id]);
    },
    [onMatch, engagement]
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

  const reachedEnd = deck.length === 0;
  const top = deck[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <GradientText style={styles.logo}>CoFounder</GradientText>
          <Text style={styles.headerSub}>find your person 👀</Text>
        </View>
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={onOpenSettings}
          hitSlop={10}
        >
          <Text style={styles.gear}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deck}>
        {reachedEnd ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>that's everyone for now</Text>
            <Text style={styles.emptyText}>
              new founders drop daily — pull up later 🔜
            </Text>
          </View>
        ) : (
          deck
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

      {!reachedEnd && (
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptyText: { color: '#8A8A99', fontSize: 14, marginTop: 8, textAlign: 'center' },
});
