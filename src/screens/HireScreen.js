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
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import { NEED_CATEGORIES, matchProviders } from '../data/needMatch';

function initialsOf(name) {
  return name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?';
}

export default function HireScreen({ onOpenSettings }) {
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
      `request a quote from ${fn}?`,
      `we'll send ${fn} your request${
        text.trim() ? `: "${text.trim()}"` : ''
      } and they'll get back to you.`,
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'send request',
          onPress: () => {
            setRequested((r) => ({ ...r, [p.id]: true }));
            Alert.alert(
              '✅ request sent',
              `${fn} will reach out with a quote. nice — you just supported a small business.`
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
          <GradientText style={styles.logo}>hire</GradientText>
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={onOpenSettings}
            hitSlop={10}
          >
            <Text style={styles.gear}>⚙</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.lead}>
            need something done? post it and we'll match you with local people
            who can help.
          </Text>

          <Text style={styles.label}>what do you need?</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="e.g. mow my lawn this weekend"
            placeholderTextColor="#5A5A68"
          />

          <Text style={styles.label}>category</Text>
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
              ? `${providers.length} helper${
                  providers.length === 1 ? '' : 's'
                } near you${category ? ` · ${category}` : ''}`
              : 'pick a category or describe your job to see helpers'}
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
                    <Text style={styles.requestedText}>request sent ✓</Text>
                  </View>
                ) : (
                  <GradientButton
                    title="request a quote"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  flex: { flex: 1 },
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
  lead: {
    color: '#C8C8D4',
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  label: {
    color: '#B8B8C7',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  input: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 4 },
  chip: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  chipOn: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  chipText: { color: '#B8B8C7', fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  resultsHead: {
    color: '#8A8A99',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 12,
    paddingHorizontal: 4,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardHead: { flex: 1 },
  name: { color: '#fff', fontSize: 17, fontWeight: '700' },
  title: { color: '#6C5CE7', fontSize: 13, fontWeight: '600', marginTop: 1 },
  meta: { color: '#8A8A99', fontSize: 12, marginTop: 3 },
  rate: { color: '#2ECC71', fontSize: 14, fontWeight: '700' },
  bio: { color: '#C8C8D4', fontSize: 14, lineHeight: 20, marginTop: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 14 },
  tag: {
    backgroundColor: '#232331',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: { color: '#A8A8B8', fontSize: 12, fontWeight: '600' },
  quoteGrad: { paddingVertical: 13, borderRadius: 22 },
  requestedPill: {
    backgroundColor: '#16321F',
    borderWidth: 1,
    borderColor: '#2ECC71',
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: 'center',
  },
  requestedText: { color: '#2ECC71', fontSize: 15, fontWeight: '700' },
});
