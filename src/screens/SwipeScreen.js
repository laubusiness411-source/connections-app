import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeCard from '../components/SwipeCard';
import MatchScreen from '../components/MatchScreen';
import { PROFILES } from '../data/profiles';

export default function SwipeScreen() {
  const [index, setIndex] = useState(0);
  const [match, setMatch] = useState(null);

  const handleSwipe = useCallback((direction, profile) => {
    // Match = you swiped right AND they already liked you
    if (direction === 'right' && profile.likesYou) {
      setMatch(profile);
    }
    setIndex((i) => i + 1);
  }, []);

  const remaining = PROFILES.slice(index);
  const reachedEnd = remaining.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>CoFounder</Text>
        <Text style={styles.headerSub}>Find your match</Text>
      </View>

      <View style={styles.deck}>
        {reachedEnd ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptyText}>
              Check back soon â€” new founders join every day.
            </Text>
          </View>
        ) : (
          // Render up to 2 cards: render back card first so top sits above it
          remaining
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
                />
              );
            })
        )}
      </View>

      {!reachedEnd && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.passBtn]}
            onPress={() => handleSwipe('left', remaining[0])}
          >
            <Text style={styles.passIcon}>âœ•</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.likeBtn]}
            onPress={() => handleSwipe('right', remaining[0])}
          >
            <Text style={styles.likeIcon}>âœ“</Text>
          </TouchableOpacity>
        </View>
      )}

      {match && (
        <MatchScreen
          profile={match}
          onSchedule={() => setMatch(null)}
          onKeepSwiping={() => setMatch(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  logo: { color: '#6C5CE7', fontSize: 26, fontWeight: '800' },
  headerSub: { color: '#6A6A78', fontSize: 13, marginTop: 2 },
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