import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useFilters } from '../context/FiltersContext';
import { US_STATES } from '../data/usStates';
import { ROLES, LOOKING_FOR } from '../data/profileFields';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const PAY_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '$40k+', value: 40000 },
  { label: '$60k+', value: 60000 },
  { label: '$80k+', value: 80000 },
  { label: '$100k+', value: 100000 },
];
const COMMUTE_OPTIONS = [
  { label: '10 mi', value: 10 },
  { label: '25 mi', value: 25 },
  { label: '50 mi', value: 50 },
  { label: '100 mi', value: 100 },
  { label: 'Any', value: 9999 },
];

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export default function FiltersScreen({ mode, onClose }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { jobs, people, setJobs, setPeople, resetJobs, resetPeople } = useFilters();

  const isJobs = mode === 'jobs';
  const f = isJobs ? jobs : people;
  const set = isJobs ? setJobs : setPeople;
  const reset = isJobs ? resetJobs : resetPeople;

  const MultiChips = ({ options, selected, onToggle }) => (
    <View style={styles.chips}>
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, on && styles.chipOn]}
            onPress={() => onToggle(opt)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const SingleChips = ({ options, value, onSelect }) => (
    <View style={styles.chips}>
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.label}
            style={[styles.chip, on && styles.chipOn]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={reset} hitSlop={12}>
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isJobs ? (
          <>
            <Text style={styles.label}>Job type</Text>
            <MultiChips
              options={JOB_TYPES}
              selected={f.types}
              onToggle={(v) => set({ types: toggle(f.types, v) })}
            />

            <Text style={styles.label}>Minimum pay</Text>
            <SingleChips
              options={PAY_OPTIONS}
              value={f.minPay}
              onSelect={(v) => set({ minPay: v })}
            />

            <Text style={styles.label}>Max commute</Text>
            <SingleChips
              options={COMMUTE_OPTIONS}
              value={f.maxCommute}
              onSelect={(v) => set({ maxCommute: v })}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Role</Text>
            <MultiChips
              options={ROLES}
              selected={f.roles}
              onToggle={(v) => set({ roles: toggle(f.roles, v) })}
            />

            <Text style={styles.label}>Looking for</Text>
            <MultiChips
              options={LOOKING_FOR}
              selected={f.lookingFor}
              onToggle={(v) => set({ lookingFor: toggle(f.lookingFor, v) })}
            />
          </>
        )}

        {/* Location (shared) */}
        <View style={styles.remoteRow}>
          <Text style={styles.remoteLabel}>Include remote</Text>
          <TouchableOpacity
            style={[styles.switch, f.includeRemote && styles.switchOn]}
            onPress={() => set({ includeRemote: !f.includeRemote })}
            activeOpacity={0.85}
          >
            <View style={[styles.knob, f.includeRemote && styles.knobOn]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>States</Text>
        <Text style={styles.hint}>
          Leave empty to include everywhere. Tap the states you'll work in.
        </Text>
        <MultiChips
          options={US_STATES}
          selected={f.states}
          onToggle={(v) => set({ states: toggle(f.states, v) })}
        />
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
    reset: { color: t.colors.textMuted, fontSize: 15, fontWeight: '600' },
    title: { color: t.colors.text, fontSize: 18, fontWeight: '800' },
    done: { color: t.colors.accent, fontSize: 16, fontWeight: '700' },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    label: {
      color: t.colors.textSoft,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 22,
      marginBottom: 10,
    },
    hint: { color: t.colors.textFaint, fontSize: 12, marginBottom: 10, marginTop: -4 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
    },
    chipOn: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
    chipText: { color: t.colors.textMuted, fontSize: 13, fontWeight: '600' },
    chipTextOn: { color: '#fff' },
    remoteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    remoteLabel: { color: t.colors.text, fontSize: 16, fontWeight: '600' },
    switch: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: t.colors.surface2,
      padding: 3,
      justifyContent: 'center',
    },
    switchOn: { backgroundColor: t.colors.accent },
    knob: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#fff',
      alignSelf: 'flex-start',
    },
    knobOn: { alignSelf: 'flex-end' },
  });
