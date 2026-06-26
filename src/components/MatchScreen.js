import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { generateMatchReason } from '../data/matchReason';
import GradientText from './GradientText';
import GradientButton from './GradientButton';
import Confetti from './Confetti';
import { useTheme } from '../theme/ThemeContext';

export default function MatchScreen({ profile, myProfile, onSchedule, onKeepSwiping }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const myInitials = myProfile?.name
    ? myProfile.name.split(' ').map((n) => n[0]).join('')
    : 'YOU';
  const reason = useMemo(
    () => generateMatchReason(myProfile, profile),
    [myProfile, profile]
  );
  return (
    <View style={styles.overlay}>
      <Confetti />
      <GradientText style={styles.title}>You're connected</GradientText>
      <Text style={styles.subtitle}>
        You and {profile.name.split(' ')[0]} are aligned on what you're building.
      </Text>

      <View style={styles.avatars}>
        {myProfile?.photoUri ? (
          <Image source={{ uri: myProfile.photoUri }} style={[styles.avatar, styles.avBorder]} />
        ) : (
          <View style={[styles.avatar, styles.avMe]}>
            <Text style={styles.avatarInitials}>{myInitials}</Text>
          </View>
        )}
        {profile?.photoUri ? (
          <Image source={{ uri: profile.photoUri }} style={[styles.avatar, styles.avatarOverlap, styles.avBorder]} />
        ) : (
          <View style={[styles.avatar, styles.avatarOverlap, styles.avThem]}>
            <Text style={styles.avatarInitials}>
              {profile.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.matchName}>{profile.name}</Text>
      <Text style={styles.matchRole}>{profile.role}</Text>

      <View style={styles.reasonCard}>
        <Text style={styles.reasonLabel}>WHY YOU'RE A FIT</Text>
        <Text style={styles.reasonText}>{reason}</Text>
      </View>

      <GradientButton title="Schedule a call" onPress={onSchedule} style={styles.primaryBtn} />

      <TouchableOpacity style={styles.secondaryBtn} onPress={onKeepSwiping}>
        <Text style={styles.secondaryBtnText}>Keep browsing</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      zIndex: 100,
    },
    title: { color: t.colors.accent, fontSize: 40, fontWeight: '800' },
    subtitle: { color: t.colors.textSoft, fontSize: 16, marginTop: 8, textAlign: 'center' },
    avatars: { flexDirection: 'row', marginTop: 32, marginBottom: 16 },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: t.colors.bg,
    },
    avBorder: { borderColor: t.colors.bg },
    avMe: { backgroundColor: t.colors.accent },
    avThem: { backgroundColor: '#00B894' },
    avatarOverlap: { marginLeft: -20 },
    avatarInitials: { color: '#fff', fontSize: 22, fontWeight: '700' },
    matchName: { color: t.colors.text, fontSize: 22, fontWeight: '700', marginTop: 12 },
    matchRole: { color: t.colors.textMuted, fontSize: 14, marginTop: 2 },
    reasonCard: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      borderRadius: 16,
      padding: 16,
      marginTop: 24,
      width: '100%',
    },
    reasonLabel: {
      color: t.colors.accentSoft,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    reasonText: { color: t.colors.textSoft, fontSize: 15, lineHeight: 21 },
    primaryBtn: { width: '100%', marginTop: 24 },
    secondaryBtn: { paddingVertical: 16, marginTop: 8 },
    secondaryBtnText: { color: t.colors.textMuted, fontSize: 15, fontWeight: '600' },
  });
