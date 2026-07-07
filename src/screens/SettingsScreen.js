import React, { useMemo } from 'react';
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
import { useTheme } from '../theme/ThemeContext';
import { ACCENT_LIST } from '../theme/themes';

export default function SettingsScreen({
  profile,
  onEditProfile,
  onResetProfile,
  onLogout,
  onClose,
  blocked = [],
  onUnblock,
}) {
  const { theme, mode, accentKey, setMode, setAccent } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

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

        {/* Appearance */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Theme</Text>
          <View style={styles.modeRow}>
            {['dark', 'light'].map((m) => {
              const on = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeBtn, on && styles.modeBtnOn]}
                  onPress={() => setMode?.(m)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modeText, on && styles.modeTextOn]}>
                    {m === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.cardLabel, { marginTop: 18 }]}>Accent color</Text>
          <View style={styles.swatchRow}>
            {ACCENT_LIST.map((a) => {
              const on = accentKey === a.key;
              return (
                <TouchableOpacity
                  key={a.key}
                  onPress={() => setAccent?.(a.key)}
                  activeOpacity={0.85}
                  style={[styles.swatchWrap, on && styles.swatchWrapOn]}
                >
                  <View style={[styles.swatch, { backgroundColor: a.color }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        {onLogout && (
          <TouchableOpacity style={styles.row} onPress={onLogout}>
            <Text style={styles.rowText}>Log out</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.row} onPress={confirmReset}>
          <Text style={[styles.rowText, styles.danger]}>Reset profile</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Klyk · v1.0.0</Text>
      </ScrollView>
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
      paddingVertical: 12,
    },
    headerTitle: { color: t.colors.text, fontSize: 22, fontWeight: '800' },
    done: { color: t.colors.accent, fontSize: 16, fontWeight: '700' },
    content: { paddingHorizontal: 20, paddingBottom: 32 },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: 16,
      marginTop: 8,
      marginBottom: 20,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
    profileText: { flex: 1 },
    name: { color: t.colors.text, fontSize: 18, fontWeight: '700' },
    role: { color: t.colors.accent, fontSize: 14, fontWeight: '600', marginTop: 2 },
    meta: { color: t.colors.textMuted, fontSize: 13, marginTop: 4 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: t.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 10,
    },
    rowText: { color: t.colors.text, fontSize: 16, fontWeight: '600' },
    chevron: { color: t.colors.textFaint, fontSize: 22, fontWeight: '700' },
    danger: { color: t.colors.danger },
    sectionLabel: {
      color: t.colors.textFaint,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      marginTop: 18,
      marginBottom: 10,
    },
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: 16,
    },
    cardLabel: { color: t.colors.textMuted, fontSize: 13, fontWeight: '700', marginBottom: 10 },
    modeRow: { flexDirection: 'row', gap: 10 },
    modeBtn: {
      flex: 1,
      backgroundColor: t.colors.surface2,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modeBtnOn: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
    modeText: { color: t.colors.textMuted, fontSize: 15, fontWeight: '700' },
    modeTextOn: { color: '#fff' },
    swatchRow: { flexDirection: 'row', gap: 14 },
    swatchWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swatchWrapOn: { borderColor: t.colors.text },
    swatch: { width: 28, height: 28, borderRadius: 14 },
    emptyRow: { paddingHorizontal: 4, paddingVertical: 6 },
    emptyText: { color: t.colors.textFaint, fontSize: 14 },
    unblock: { color: t.colors.accent, fontSize: 14, fontWeight: '700' },
    version: { color: t.colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: 28 },
  });
