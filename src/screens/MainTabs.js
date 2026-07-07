import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../components/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThisWeekScreen from './ThisWeekScreen';
import HireScreen from './HireScreen';
import SwipeScreen from './SwipeScreen';
import ChatsScreen from './ChatsScreen';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import MatchScreen from '../components/MatchScreen';
import { EngagementProvider } from '../context/EngagementContext';
import { useTheme } from '../theme/ThemeContext';
import { fetchMatchesWithPreview } from '../lib/db';
import { getReads, isUnread } from '../lib/reads';

const TABS = [
  { key: 'week', label: 'This Week', icon: 'today' },
  { key: 'hire', label: 'Hire', icon: 'briefcase' },
  { key: 'swipe', label: 'Discover', icon: 'compass' },
  { key: 'chats', label: 'Messages', icon: 'chatbubbles' },
];

export default function MainTabs({
  myProfile,
  onUpdateProfile,
  onResetProfile,
  onLogout,
}) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [tab, setTab] = useState('week');
  const [blocked, setBlocked] = useState([]);
  const [match, setMatch] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editing, setEditing] = useState(false);
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!myProfile?.id) return;
    const [list, reads] = await Promise.all([
      fetchMatchesWithPreview(myProfile.id),
      getReads(),
    ]);
    setUnread(list.filter((m) => isUnread(m, reads, myProfile.id)).length);
  }, [myProfile?.id]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread, tab]);

  const handleBlock = useCallback(
    (profile, { reported } = {}) => {
      setBlocked((b) => (b.some((x) => x.id === profile.id) ? b : [...b, profile]));
      toast.show(
        reported
          ? `Report received — ${profile.name.split(' ')[0]} won't appear again`
          : `${profile.name.split(' ')[0]} blocked`,
        { icon: 'shield-checkmark' }
      );
    },
    [toast]
  );

  const unblock = useCallback((id) => {
    setBlocked((b) => b.filter((x) => x.id !== id));
  }, []);

  const openSettings = useCallback(() => setShowSettings(true), []);

  return (
    <EngagementProvider>
    <View style={styles.container}>
      <View style={styles.content}>
        {tab === 'week' && (
          <ThisWeekScreen
            myProfile={myProfile}
            blocked={blocked}
            onOpenSettings={openSettings}
          />
        )}
        {tab === 'hire' && <HireScreen onOpenSettings={openSettings} />}
        {tab === 'swipe' && (
          <SwipeScreen
            myId={myProfile?.id}
            myProfile={myProfile}
            blocked={blocked}
            onBlock={handleBlock}
            onOpenSettings={openSettings}
            onMatch={setMatch}
          />
        )}
        {tab === 'chats' && (
          <ChatsScreen
            myId={myProfile?.id}
            myProfile={myProfile}
            onOpenSettings={openSettings}
          />
        )}
      </View>

      {/* Bottom tab bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom || 12 }]}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={styles.tab}
              onPress={() => setTab(t.key)}
              activeOpacity={0.8}
            >
              <View>
                <Ionicons
                  name={active ? t.icon : `${t.icon}-outline`}
                  size={22}
                  color={active ? theme.colors.accent : theme.colors.textFaint}
                />
                {t.key === 'chats' && unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Full-screen overlays (above tab bar) */}
      {match && (
        <MatchScreen
          profile={match}
          myProfile={myProfile}
          onKeepSwiping={() => setMatch(null)}
        />
      )}

      {showSettings && (
        <View style={[styles.overlay, { zIndex: 300 }]}>
          <SettingsScreen
            profile={myProfile}
            blocked={blocked}
            onUnblock={unblock}
            onEditProfile={() => setEditing(true)}
            onResetProfile={onResetProfile}
            onLogout={onLogout}
            onClose={() => setShowSettings(false)}
          />
        </View>
      )}

      {editing && (
        <View style={[styles.overlay, { zIndex: 400 }]}>
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
    </View>
    </EngagementProvider>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.bg },
    content: { flex: 1 },
    tabBar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
      backgroundColor: t.colors.bg,
      paddingTop: 10,
    },
    tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    tabLabel: { color: t.colors.textFaint, fontSize: 11, fontWeight: '700', marginTop: 3 },
    tabLabelActive: { color: t.colors.accent },
    badge: {
      position: 'absolute',
      top: -5,
      right: -12,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      backgroundColor: t.colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.colors.bg,
    },
  });
