import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeCard from '../components/SwipeCard';
import MatchScreen from '../components/MatchScreen';
import SchedulingScreen from '../components/SchedulingScreen';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import GradientText from '../components/GradientText';
import { PROFILES } from '../data/profiles';

export default function SwipeScreen({ myProfile, onUpdateProfile, onResetProfile }) {
  // Deck holds profiles not yet acted on; acting removes from the front.
  const [deck, setDeck] = useState(PROFILES);
  const [match, setMatch] = useState(null);
  const [scheduling, setScheduling] = useState(null);
  const [blocked, setBlocked] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [editing, setEditing] = useState(false);

  // Guards against a second swipe firing before the deck re-renders, which
  // could skip a profile or act on a stale card (e.g. rapid button taps).
  const lockRef = useRef(false);
  useEffect(() => {
    lockRef.current = false;
  }, [deck]);

  const handleSwipe = useCallback((direction, profile) => {
    if (lockRef.current || !profile) return;
    lockRef.current = true;
    // Match = you swiped right AND they already liked you
    if (direction === 'right' && profile.likesYou) {
      setMatch(profile);
    }
    setDeck((d) => d.slice(1));
  }, []);

  const blockProfile = useCallback((profile, { reported } = {}) => {
    setDeck((d) => d.filter((p) => p.id !== profile.id));
    setBlocked((b) => (b.some((x) => x.id === profile.id) ? b : [...b, profile]));
    if (reported) {
      Alert.alert(
        'Report received',
        `Thanks — we'll review ${profile.name.split(' ')[0]}'s profile. They won't appear again.`
      );
    }
  }, []);

  const handleReport = useCallback(
    (profile) => {
      Alert.alert(profile.name, 'What would you like to do?', [
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => blockProfile(profile),
        },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => blockProfile(profile, { reported: true }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [blockProfile]
  );

  const unblock = useCallback(
    (id) => {
      setBlocked((b) => {
        const p = b.find((x) => x.id === id);
        if (p) setDeck((d) => (d.some((x) => x.id === id) ? d : [...d, p]));
        return b.filter((x) => x.id !== id);
      });
    },
    []
  );

  const reachedEnd = deck.length === 0;
  const top = deck[0];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View>
          <GradientText style={styles.logo}>CoFounder</GradientText>
          <Text style={styles.headerSub}>find your person 👀</Text>
        </View>
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={() => setShowSettings(true)}
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
          // Render up to 2 cards: render back card first so top sits above it
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

      {match && (
        <MatchScreen
          profile={match}
          myProfile={myProfile}
          onSchedule={() => {
            setScheduling(match);
            setMatch(null);
          }}
          onKeepSwiping={() => setMatch(null)}
        />
      )}

      {scheduling && (
        <View style={[styles.fullOverlay, { zIndex: 200 }]}>
          <SchedulingScreen
            profile={scheduling}
            onClose={() => setScheduling(null)}
          />
        </View>
      )}

      {showSettings && (
        <View style={[styles.fullOverlay, { zIndex: 300 }]}>
          <SettingsScreen
            profile={myProfile}
            blocked={blocked}
            onUnblock={unblock}
            onEditProfile={() => setEditing(true)}
            onResetProfile={onResetProfile}
            onClose={() => setShowSettings(false)}
          />
        </View>
      )}

      {editing && (
        <View style={[styles.fullOverlay, { zIndex: 400 }]}>
          <EditProfileScreen
            initialProfile={myProfile}
            onSave={(updated) => {
              onUpdateProfile(updated);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
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
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B0B0F',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptyText: { color: '#8A8A99', fontSize: 14, marginTop: 8, textAlign: 'center' },
});
