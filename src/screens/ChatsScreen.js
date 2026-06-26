import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientText from '../components/GradientText';
import ChatScreen from './ChatScreen';
import { useTheme } from '../theme/ThemeContext';
import { fetchMatches } from '../lib/db';

function initialsOf(name) {
  return name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?';
}

export default function ChatsScreen({ myId, onOpenSettings }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    const list = await fetchMatches(myId);
    setMatches(list);
    setLoading(false);
  }, [myId]);

  useEffect(() => {
    load();
  }, [load]);

  if (selected) {
    return (
      <ChatScreen
        match={selected}
        myId={myId}
        onBack={() => {
          setSelected(null);
          load();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <GradientText style={styles.logo}>Messages</GradientText>
        <TouchableOpacity style={styles.gearBtn} onPress={load} hitSlop={10}>
          <Text style={styles.gear}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No connections yet</Text>
          <Text style={styles.emptyText}>
            Head to Discover. When you and someone both express interest, you'll
            be connected here to message.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {matches.map((m) => (
            <TouchableOpacity
              key={m.matchId}
              style={styles.row}
              onPress={() => setSelected(m)}
              activeOpacity={0.85}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initialsOf(m.profile.name)}
                </Text>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.name}>{m.profile.name}</Text>
                <Text style={styles.role}>{m.profile.role}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    gear: { color: t.colors.textSoft, fontSize: 20 },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 36,
    },
    emptyTitle: { color: t.colors.text, fontSize: 20, fontWeight: '700' },
    emptyText: {
      color: t.colors.textMuted,
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    },
    list: { paddingHorizontal: 16, paddingTop: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: 12,
      marginBottom: 10,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    rowText: { flex: 1 },
    name: { color: t.colors.text, fontSize: 16, fontWeight: '700' },
    role: { color: t.colors.accent, fontSize: 13, fontWeight: '600', marginTop: 1 },
    chevron: { color: t.colors.textFaint, fontSize: 22, fontWeight: '700' },
  });
