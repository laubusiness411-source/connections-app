import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import StreakCard from '../components/StreakCard';
import ConfirmSheet from '../components/ConfirmSheet';
import { useToast } from '../components/Toast';
import { useEngagement } from '../context/EngagementContext';
import { useTheme } from '../theme/ThemeContext';
import { generateGoalMatches } from '../data/goalMatch';
import { topCompaniesForUser } from '../data/topCompanies';
import { PROFILES } from '../data/profiles';

function initialsOf(name) {
  return name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?';
}

export default function ThisWeekScreen({ myProfile, blocked = [], onOpenSettings }) {
  const [requested, setRequested] = useState({});
  const engagement = useEngagement();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

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

  const companies = useMemo(() => topCompaniesForUser(myProfile), [myProfile]);
  const [introTarget, setIntroTarget] = useState(null);
  const toast = useToast();

  const requestIntro = (p) => setIntroTarget(p);

  const confirmIntro = (p) => {
    const fn = p.name.split(' ')[0];
    setRequested((r) => ({ ...r, [p.id]: true }));
    engagement?.recordIntro();
    toast.show(`We'll introduce you to ${fn} this week`, { icon: 'people' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <GradientText style={styles.logo}>This Week</GradientText>
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={onOpenSettings}
          hitSlop={10}
        >
          <Ionicons name="settings-outline" size={19} color={theme.colors.textSoft} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Goal */}
        <TouchableOpacity
          style={styles.goalCard}
          onPress={onOpenSettings}
          activeOpacity={0.85}
        >
          <Text style={styles.goalLabel}>YOUR 90-DAY GOAL</Text>
          <Text style={styles.goalText}>
            {myProfile?.goal || 'Set a goal to get introductions — tap to edit.'}
          </Text>
        </TouchableOpacity>

        {/* Streak + daily quests */}
        <StreakCard />

        {/* Weekly guarantee */}
        <View style={styles.guarantee}>
          <Text style={styles.guaranteeTitle}>Your weekly introduction</Text>
          <Text style={styles.guaranteeText}>
            Each week we introduce you to at least one person who can help move
            your goal forward — a real introduction, not just a list.
          </Text>
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>People to meet this week</Text>

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
                <Text style={styles.reasonLabel}>WHY THEM</Text>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>

              {isRequested ? (
                <View style={styles.requestedPill}>
                  <Text style={styles.requestedText}>Introduction requested</Text>
                </View>
              ) : (
                <GradientButton
                  title="Request an introduction"
                  onPress={() => requestIntro(profile)}
                  gradStyle={styles.introBtnGrad}
                />
              )}
            </View>
          );
        })}

        {/* Top companies (daily) */}
        <Text style={styles.sectionTitle}>Top companies for you today</Text>
        <Text style={styles.sectionHint}>
          Ranked by peer reviews + your skills · refreshes daily
        </Text>
        {companies.map(({ company, fit }, i) => (
          <View key={company.id} style={styles.coCard}>
            <Text style={styles.coRank}>{i + 1}</Text>
            <View style={styles.coLogo}>
              <Text style={styles.coLogoText}>{initialsOf(company.name)}</Text>
            </View>
            <View style={styles.coBody}>
              <Text style={styles.coName}>{company.name}</Text>
              <Text style={styles.coMeta}>
                ⭐ {company.rating} · {company.reviews} reviews
              </Text>
              <Text style={styles.coMeta2}>
                {company.industry} · {company.location}
              </Text>
              <Text style={styles.coFit}>
                {fit > 0 ? 'Matches your skills · ' : ''}
                {company.openRoles} open roles
              </Text>
            </View>
          </View>
        ))}

        <Text style={styles.footerNote}>
          New introductions refresh weekly. Want more now? Visit Discover.
        </Text>
      </ScrollView>

      <ConfirmSheet
        visible={!!introTarget}
        title={`Request an introduction to ${introTarget?.name?.split(' ')[0] || ''}?`}
        message="We'll introduce you this week — that's the guarantee."
        actions={[
          {
            label: 'Request introduction',
            style: 'primary',
            onPress: () => confirmIntro(introTarget),
          },
        ]}
        onClose={() => setIntroTarget(null)}
      />
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
    logo: { fontSize: 26, fontWeight: '800', color: t.colors.accent },
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
    content: { paddingHorizontal: 16, paddingBottom: 32 },
    goalCard: {
      backgroundColor: t.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      padding: 16,
      marginTop: 4,
    },
    goalLabel: {
      color: t.colors.accentSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 6,
    },
    goalText: { color: t.colors.text, fontSize: 20, fontWeight: '800', lineHeight: 26 },
    guarantee: {
      backgroundColor: t.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      padding: 16,
      marginTop: 12,
    },
    guaranteeTitle: { color: t.colors.text, fontSize: 16, fontWeight: '800' },
    guaranteeText: {
      color: t.colors.textSoft,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
    },
    sectionTitle: {
      color: t.colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginTop: 26,
      marginBottom: 14,
    },
    sectionHint: {
      color: t.colors.textFaint,
      fontSize: 12,
      marginTop: -10,
      marginBottom: 14,
    },
    coCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: 12,
      marginBottom: 10,
    },
    coRank: {
      color: t.colors.accentSoft,
      fontSize: 16,
      fontWeight: '800',
      width: 22,
      textAlign: 'center',
    },
    coLogo: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
    },
    coLogoText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    coBody: { flex: 1 },
    coName: { color: t.colors.text, fontSize: 16, fontWeight: '700' },
    coMeta: { color: t.colors.warn, fontSize: 12, fontWeight: '600', marginTop: 2 },
    coMeta2: { color: t.colors.textMuted, fontSize: 12, marginTop: 2 },
    coFit: { color: t.colors.accentSoft, fontSize: 12, fontWeight: '600', marginTop: 3 },
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: 16,
      marginBottom: 14,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
    cardHead: { flex: 1 },
    name: { color: t.colors.text, fontSize: 18, fontWeight: '700' },
    role: { color: t.colors.accent, fontSize: 14, fontWeight: '600', marginTop: 1 },
    meta: { color: t.colors.textMuted, fontSize: 12, marginTop: 3 },
    reasonBox: {
      backgroundColor: t.colors.surface2,
      borderRadius: 12,
      padding: 12,
      marginTop: 14,
      marginBottom: 14,
    },
    reasonLabel: {
      color: t.colors.accentSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    reasonText: { color: t.colors.textSoft, fontSize: 14, lineHeight: 20 },
    introBtnGrad: { paddingVertical: 13, borderRadius: 10 },
    requestedPill: {
      backgroundColor: t.colors.surface2,
      borderWidth: 1,
      borderColor: t.colors.success,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    requestedText: { color: t.colors.success, fontSize: 15, fontWeight: '700' },
    footerNote: {
      color: t.colors.textFaint,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 19,
    },
  });
