import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { generateMatchReason } from '../data/matchReason';

export default function MatchScreen({ profile, myProfile, onSchedule, onKeepSwiping }) {
  const myInitials = myProfile?.name
    ? myProfile.name.split(' ').map((n) => n[0]).join('')
    : 'YOU';
  const reason = useMemo(
    () => generateMatchReason(myProfile, profile),
    [myProfile, profile]
  );
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>It's a Match!</Text>
      <Text style={styles.subtitle}>
        You and {profile.name.split(' ')[0]} both want to connect.
      </Text>

      <View style={styles.avatars}>
        {myProfile?.photoUri ? (
          <Image
            source={{ uri: myProfile.photoUri }}
            style={[styles.avatar, { borderColor: '#0B0B0F' }]}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#6C5CE7' }]}>
            <Text style={styles.avatarInitials}>{myInitials}</Text>
          </View>
        )}
        {profile?.photoUri ? (
          <Image
            source={{ uri: profile.photoUri }}
            style={[styles.avatar, styles.avatarOverlap, { borderColor: '#0B0B0F' }]}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarOverlap, { backgroundColor: '#00B894' }]}>
            <Text style={styles.avatarInitials}>
              {profile.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.matchName}>{profile.name}</Text>
      <Text style={styles.matchRole}>{profile.role}</Text>

      <View style={styles.reasonCard}>
        <Text style={styles.reasonLabel}>✨ Why you matched</Text>
        <Text style={styles.reasonText}>{reason}</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onSchedule}>
        <Text style={styles.primaryBtnText}>Schedule a call</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onKeepSwiping}>
        <Text style={styles.secondaryBtnText}>Keep swiping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,15,0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 100,
  },
  title: { color: '#6C5CE7', fontSize: 40, fontWeight: '800' },
  subtitle: { color: '#C8C8D4', fontSize: 16, marginTop: 8, textAlign: 'center' },
  avatars: { flexDirection: 'row', marginTop: 32, marginBottom: 16 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0B0B0F',
  },
  avatarOverlap: { marginLeft: -20 },
  avatarInitials: { color: '#fff', fontSize: 22, fontWeight: '700' },
  matchName: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 12 },
  matchRole: { color: '#8A8A99', fontSize: 14, marginTop: 2 },
  reasonCard: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#2E2A45',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    width: '100%',
  },
  reasonLabel: {
    color: '#A99CF0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reasonText: { color: '#E4E4ED', fontSize: 15, lineHeight: 21 },
  primaryBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 16, marginTop: 8 },
  secondaryBtnText: { color: '#8A8A99', fontSize: 15, fontWeight: '600' },
});