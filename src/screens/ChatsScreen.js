import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import ChatScreen from './ChatScreen';
import { SkeletonRows } from '../components/Skeleton';
import { useTheme } from '../theme/ThemeContext';
import { fetchMatchesWithPreview } from '../lib/db';
import { getReads, markRead, isUnread } from '../lib/reads';

function initialsOf(name) {
  return name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?';
}

function relativeTime(iso) {
  if (!iso) return '';
  const s = (new Date() - new Date(iso)) / 1000;
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return `${Math.floor(s / 604800)}w`;
}

export default function ChatsScreen({ myId, myProfile, onOpenSettings }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [matches, setMatches] = useState([]);
  const [reads, setReads] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    const [list, r] = await Promise.all([
      fetchMatchesWithPreview(myId),
      getReads(),
    ]);
    setMatches(list);
    setReads(r);
    setLoading(false);
  }, [myId]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (m) => {
    await markRead(m.matchId);
    setSelected(m);
  };

  if (selected) {
    return (
      <ChatScreen
        match={selected}
        myId={myId}
        me={myProfile}
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
          <Ionicons name="refresh" size={19} color={theme.colors.textSoft} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <SkeletonRows count={4} />
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
          {matches.map((m) => {
            const unread = isUnread(m, reads, myId);
            const preview = m.lastMessage
              ? `${m.lastMessage.sender === myId ? 'You: ' : ''}${m.lastMessage.body}`
              : 'Say hello 👋';
            return (
              <TouchableOpacity
                key={m.matchId}
                style={styles.row}
                onPress={() => open(m)}
                activeOpacity={0.85}
              >
                {m.profile.photoUri ? (
                  <Image source={{ uri: m.profile.photoUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {initialsOf(m.profile.name)}
                    </Text>
                  </View>
                )}
                <View style={styles.rowText}>
                  <Text style={styles.name}>{m.profile.name}</Text>
                  <Text
                    style={[styles.preview, unread && styles.previewUnread]}
                    numberOfLines={1}
                  >
                    {preview}
                  </Text>
                </View>
                <View style={styles.rowEnd}>
                  {m.lastMessage && (
                    <Text style={styles.time}>
                      {relativeTime(m.lastMessage.created_at)}
                    </Text>
                  )}
                  {unread && <View style={styles.dot} />}
                </View>
              </TouchableOpacity>
            );
          })}
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
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
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
    preview: { color: t.colors.textMuted, fontSize: 14, marginTop: 2 },
    previewUnread: { color: t.colors.text, fontWeight: '700' },
    rowEnd: { alignItems: 'flex-end', marginLeft: 8 },
    time: { color: t.colors.textFaint, fontSize: 12 },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: t.colors.accent,
      marginTop: 6,
    },
  });
