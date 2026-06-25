import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThisWeekScreen from './ThisWeekScreen';
import HireScreen from './HireScreen';
import SwipeScreen from './SwipeScreen';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import MatchScreen from '../components/MatchScreen';
import SchedulingScreen from '../components/SchedulingScreen';
import { EngagementProvider } from '../context/EngagementContext';

const TABS = [
  { key: 'week', label: 'This Week', icon: '🎯' },
  { key: 'hire', label: 'Hire', icon: '🛠️' },
  { key: 'swipe', label: 'Swipe', icon: '🔥' },
];

export default function MainTabs({
  myProfile,
  onUpdateProfile,
  onResetProfile,
  onLogout,
}) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('week');
  const [blocked, setBlocked] = useState([]);
  const [match, setMatch] = useState(null);
  const [scheduling, setScheduling] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleBlock = useCallback((profile, { reported } = {}) => {
    setBlocked((b) => (b.some((x) => x.id === profile.id) ? b : [...b, profile]));
    if (reported) {
      Alert.alert(
        'Report received',
        `Thanks — we'll review ${profile.name.split(' ')[0]}'s profile. They won't appear again.`
      );
    }
  }, []);

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
            blocked={blocked}
            onBlock={handleBlock}
            onOpenSettings={openSettings}
            onMatch={setMatch}
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
              <Text style={[styles.tabIcon, !active && styles.tabInactive]}>
                {t.icon}
              </Text>
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
          onSchedule={() => {
            setScheduling(match);
            setMatch(null);
          }}
          onKeepSwiping={() => setMatch(null)}
        />
      )}

      {scheduling && (
        <View style={[styles.overlay, { zIndex: 200 }]}>
          <SchedulingScreen
            profile={scheduling}
            onClose={() => setScheduling(null)}
          />
        </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1A1A22',
    backgroundColor: '#0B0B0F',
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 20 },
  tabInactive: { opacity: 0.45 },
  tabLabel: { color: '#6A6A78', fontSize: 11, fontWeight: '700', marginTop: 3 },
  tabLabelActive: { color: '#6C5CE7' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B0B0F',
  },
});
