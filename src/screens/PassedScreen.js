import React, { useMemo } from 'react';
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
import { useTheme } from '../theme/ThemeContext';

function initialsOf(name) {
  return name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?';
}

// Lists people you've swiped on this session, newest first, with the option
// to bring one back into the deck.
export default function PassedScreen({ history = [], onBringBack, onClose }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Recently swiped</Text>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>

      {history.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="arrow-undo-outline"
            size={36}
            color={theme.colors.textFaint}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyText}>
            People you swipe on will show up here so you can bring them back.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {history.map(({ profile, direction }) => (
            <View key={profile.id} style={styles.row}>
              {profile.photoUri ? (
                <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initialsOf(profile.name)}</Text>
                </View>
              )}
              <View style={styles.rowText}>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.role}>{profile.role}</Text>
                <Text
                  style={[
                    styles.tag,
                    direction === 'right' ? styles.liked : styles.passed,
                  ]}
                >
                  {direction === 'right' ? 'Liked' : 'Passed'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.bringBtn}
                onPress={() => onBringBack(profile.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.bringText}>Bring back</Text>
              </TouchableOpacity>
            </View>
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
      paddingVertical: 12,
    },
    title: { color: t.colors.text, fontSize: 18, fontWeight: '800' },
    done: { color: t.colors.accent, fontSize: 16, fontWeight: '700' },
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
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    rowText: { flex: 1 },
    name: { color: t.colors.text, fontSize: 16, fontWeight: '700' },
    role: { color: t.colors.accent, fontSize: 13, fontWeight: '600', marginTop: 1 },
    tag: { fontSize: 11, fontWeight: '800', marginTop: 3 },
    liked: { color: t.colors.success },
    passed: { color: t.colors.textFaint },
    bringBtn: {
      borderWidth: 1,
      borderColor: t.colors.accent,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    bringText: { color: t.colors.accentSoft, fontSize: 13, fontWeight: '700' },
  });
