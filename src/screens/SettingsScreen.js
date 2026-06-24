import React from 'react';
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

export default function SettingsScreen({
  profile,
  onEditProfile,
  onResetProfile,
  onClose,
  blocked = [],
  onUnblock,
}) {
  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('')
    : '?';

  const confirmReset = () => {
    Alert.alert(
      'Reset profile?',
      'This clears your saved profile and starts onboarding over. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onResetProfile },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile summary */}
        <View style={styles.profileCard}>
          {profile?.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileText}>
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.role}>{profile?.role}</Text>
            <Text style={styles.meta}>
              {profile?.location}  ·  {profile?.commitment}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.row} onPress={onEditProfile}>
          <Text style={styles.rowText}>Edit profile</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Blocked users */}
        <Text style={styles.sectionLabel}>BLOCKED</Text>
        {blocked.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No blocked users</Text>
          </View>
        ) : (
          blocked.map((b) => (
            <View key={b.id} style={styles.row}>
              <Text style={styles.rowText}>{b.name}</Text>
              <TouchableOpacity onPress={() => onUnblock?.(b.id)} hitSlop={8}>
                <Text style={styles.unblock}>Unblock</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Danger zone */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <TouchableOpacity style={styles.row} onPress={confirmReset}>
          <Text style={[styles.rowText, styles.danger]}>Reset profile</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CoFounder · v1.0.0</Text>
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
    paddingVertical: 12,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  done: { color: '#6C5CE7', fontSize: 16, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#26262F',
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileText: { flex: 1 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  role: { color: '#6C5CE7', fontSize: 14, fontWeight: '600', marginTop: 2 },
  meta: { color: '#8A8A99', fontSize: 13, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16161D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#26262F',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  rowText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  chevron: { color: '#6A6A78', fontSize: 22, fontWeight: '700' },
  danger: { color: '#FF4D6D' },
  sectionLabel: {
    color: '#6A6A78',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 10,
  },
  emptyRow: { paddingHorizontal: 4, paddingVertical: 6 },
  emptyText: { color: '#6A6A78', fontSize: 14 },
  unblock: { color: '#6C5CE7', fontSize: 14, fontWeight: '700' },
  version: { color: '#3A3A48', fontSize: 12, textAlign: 'center', marginTop: 28 },
});
