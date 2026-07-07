import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import { useTheme } from '../theme/ThemeContext';
import { NEED_CATEGORIES, matchProviders } from '../data/needMatch';

function initialsOf(name) {
  return name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?';
}

export default function HireScreen({ onOpenSettings }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [category, setCategory] = useState(null);
  const [text, setText] = useState('');
  const [requested, setRequested] = useState({});

  const providers = useMemo(
    () => matchProviders(category, text),
    [category, text]
  );

  const started = !!category || text.trim().length > 0;

  const requestQuote = (p) => {
    const fn = p.name.split(' ')[0];
    Alert.alert(
      `Request a quote from ${fn}?`,
      `We'll send ${fn} your request${
        text.trim() ? `: "${text.trim()}"` : ''
      } and they'll get back to you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send request',
          onPress: () => {
            setRequested((r) => ({ ...r, [p.id]: true }));
            Alert.alert(
              'Request sent',
              `${fn} will reach out with a quote. You're supporting a local business.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <GradientText style={styles.logo}>Hire</GradientText>
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={onOpenSettings}
            hitSlop={10}
          >
            <Ionicons name="settings-outline" size={19} color={theme.colors.textSoft} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.lead}>
            Need something done? Describe it and we'll connect you with local
            professionals.
          </Text>

          <Text style={styles.label}>What do you need?</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="e.g. mow my lawn this weekend"
            placeholderTextColor={theme.colors.inputPlaceholder}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {NEED_CATEGORIES.map((c) => {
              const on = category === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => setCategory(on ? null : c)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.resultsHead}>
            {started
              ? `${providers.length} pro${
                  providers.length === 1 ? '' : 's'
                } near you${category ? ` · ${category}` : ''}`
              : 'Choose a category or describe your job to see pros'}
          </Text>

          {providers.map((p) => {
            const isRequested = !!requested[p.id];
            return (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initialsOf(p.name)}</Text>
                  </View>
                  <View style={styles.cardHead}>
                    <Text style={styles.name}>{p.name}</Text>
                    <Text style={styles.title}>{p.title}</Text>
                    <Text style={styles.meta}>
                      ⭐ {p.rating}  ·  {p.jobs} jobs  ·  {p.location}
                    </Text>
                  </View>
                  <Text style={styles.rate}>{p.rate}</Text>
                </View>

                <Text style={styles.bio}>{p.bio}</Text>

                <View style={styles.tags}>
                  {p.services.map((s) => (
                    <View key={s} style={styles.tag}>
                      <Text style={styles.tagText}>{s}</Text>
                    </View>
                  ))}
                </View>

                {isRequested ? (
                  <View style={styles.requestedPill}>
                    <Text style={styles.requestedText}>Request sent</Text>
                  </View>
                ) : (
                  <GradientButton
                    title="Request a quote"
                    onPress={() => requestQuote(p)}
                    gradStyle={styles.quoteGrad}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.bg },
    flex: { flex: 1 },
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
    content: { paddingHorizontal: 16, paddingBottom: 32 },
    lead: {
      color: t.colors.textSoft,
      fontSize: 15,
      lineHeight: 21,
      paddingHorizontal: 4,
      marginTop: 4,
    },
    label: {
      color: t.colors.textSoft,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    input: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: t.colors.text,
      fontSize: 16,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 4 },
    chip: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
    },
    chipOn: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
    chipText: { color: t.colors.textSoft, fontSize: 13, fontWeight: '600' },
    chipTextOn: { color: t.colors.onAccent },
    resultsHead: {
      color: t.colors.textMuted,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 22,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.colors.border,
      padding: 16,
      marginBottom: 14,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    cardHead: { flex: 1 },
    name: { color: t.colors.text, fontSize: 17, fontWeight: '700' },
    title: { color: t.colors.accent, fontSize: 13, fontWeight: '600', marginTop: 1 },
    meta: { color: t.colors.textMuted, fontSize: 12, marginTop: 3 },
    rate: { color: t.colors.success, fontSize: 14, fontWeight: '700' },
    bio: { color: t.colors.textSoft, fontSize: 14, lineHeight: 20, marginTop: 12 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 14 },
    tag: {
      backgroundColor: t.colors.surface2,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 14,
    },
    tagText: { color: t.colors.textMuted, fontSize: 12, fontWeight: '600' },
    quoteGrad: { paddingVertical: 13, borderRadius: 22 },
    requestedPill: {
      backgroundColor: t.colors.surface2,
      borderWidth: 1,
      borderColor: t.colors.success,
      borderRadius: 22,
      paddingVertical: 13,
      alignItems: 'center',
    },
    requestedText: { color: t.colors.success, fontSize: 15, fontWeight: '700' },
  });
