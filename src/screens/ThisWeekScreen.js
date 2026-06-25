import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import StreakCard from '../components/StreakCard';
import { useEngagement } from '../context/EngagementContext';
import { generateGoalMatches } from '../data/goalMatch';
import { PROFILES } from '../data/profiles';

function initialsOf(name) {
  return name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?';
}

export default function ThisWeekScreen({ myProfile, blocked = [], onOpenSettings }) {
  const [requested, setRequested] = useState({});
  const engagement = useEngagement();

  const blockedIds = useMemo(
    () => new Set(blocked.map((b) => b.id)),
    [blocked]
  );

  const matches = useMemo(
    () =>
      generateGoalMatches(
        myProfile?.goal,
        myProfile,
        PROFILES.filter((p) => !blockedIds.has(p.id))
      ),
    [myProfile, blockedIds]
  );

  const requestIntro = (p) => {
    const fn = p.name.split(' ')[0];
    Alert.alert(
      `request intro to ${fn}?`,
      `we'll connect you with ${fn} this week — that's the guarantee.`,
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'request',
          onPress: () => {
            setRequested((r) => ({ ...r, [p.id]: true }));
            engagement?.recordIntro();
            Alert.alert(
              "🎉 you're in the queue",
              `we'll introduce you to ${fn} within the week. keep an eye out.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <GradientText style={styles.logo}>this week</GradientText>
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={onOpenSettings}
          hitSlop={10}
        >
          <Text style={styles.gear}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Goal */}
        <TouchableOpacity
          style={styles.goalCard}
          onPress={onOpenSettings}
          activeOpacity={0.85}
        >
          <Text style={styles.goalLabel}>🎯 YOUR 90-DAY GOAL</Text>
          <Text style={styles.goalText}>
            {myProfile?.goal || 'Set a goal to get matched — tap here.'}
          </Text>
        </TouchableOpacity>

        {/* Streak + daily quests */}
        <StreakCard />

        {/* Weekly guarantee */}
        <View style={styles.guarantee}>
          <Text style={styles.guaranteeTitle}>🤝 your weekly intro guarantee</Text>
          <Text style={styles.guaranteeText}>
            every week we introduce you to at least one person who can actually
            move your goal forward. not a swipe — a real intro.
          </Text>
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>
          the {matches.length} people you should meet this week
        </Text>

        {matches.map(({ profile, reason }) => {
          const isRequested = !!requested[profile.id];
          return (
            <View key={profile.id} style={styles.card}>
              <View style={styles.cardTop}>
                {profile.photoUri ? (
                  <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {initialsOf(profile.name)}
                    </Text>
                  </View>
                )}
                <View style={styles.cardHead}>
                  <Text style={styles.name}>{profile.name}</Text>
                  <Text style={styles.role}>{profile.role}</Text>
                  <Text style={styles.meta}>
                    {profile.location}  ·  {profile.commitment}
                  </Text>
                </View>
              </View>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>✨ why them</Text>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>

              {isRequested ? (
                <View style={styles.requestedPill}>
                  <Text style={styles.requestedText}>intro requested ✓</Text>
                </View>
              ) : (
                <GradientButton
                  title={`request intro to ${profile.name.split(' ')[0]}`}
                  onPress={() => requestIntro(profile)}
                  gradStyle={styles.introBtnGrad}
                />
              )}
            </View>
          );
        })}

        <Text style={styles.footerNote}>
          new intros refresh every week. want more right now? hit the Swipe tab.
        </Text>
      </ScrollView>
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
    paddingBottom: 8,
  },
  logo: { fontSize: 26, fontWeight: '800', color: '#6C5CE7' },
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
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  goalCard: {
    backgroundColor: '#16161D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E2A45',
    padding: 16,
    marginTop: 4,
  },
  goalLabel: {
    color: '#A99CF0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  goalText: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 26 },
  guarantee: {
    backgroundColor: '#15131F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3A3357',
    padding: 16,
    marginTop: 12,
  },
  guaranteeTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  guaranteeText: {
    color: '#B8B8C7',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 26,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#16161D',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#26262F',
    padding: 16,
    marginBottom: 14,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cardHead: { flex: 1 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  role: { color: '#6C5CE7', fontSize: 14, fontWeight: '600', marginTop: 1 },
  meta: { color: '#8A8A99', fontSize: 12, marginTop: 3 },
  reasonBox: {
    backgroundColor: '#0F0E15',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    marginBottom: 14,
  },
  reasonLabel: {
    color: '#A99CF0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reasonText: { color: '#E4E4ED', fontSize: 14, lineHeight: 20 },
  introBtnGrad: { paddingVertical: 14, borderRadius: 24 },
  requestedPill: {
    backgroundColor: '#16321F',
    borderWidth: 1,
    borderColor: '#2ECC71',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  requestedText: { color: '#2ECC71', fontSize: 15, fontWeight: '700' },
  footerNote: {
    color: '#6A6A78',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 19,
  },
});
