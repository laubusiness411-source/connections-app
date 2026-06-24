import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Grid geometry (kept in sync with styles below) for drag hit-testing.
const GUTTER_W = 58;
const CELL_H = 44;
const ROW_GAP = 6;
const ROW_STRIDE = CELL_H + ROW_GAP;

// when2meet-style availability: next 7 days x 4 time-of-day blocks.
// The user taps the blocks they're free; we send those options to the match.
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const TIME_BLOCKS = [
  { label: 'Morning', sub: '8–12' },
  { label: 'Midday', sub: '12–3' },
  { label: 'Afternoon', sub: '3–6' },
  { label: 'Evening', sub: '6–9' },
];

const CALL_TYPES = ['Video', 'Phone'];
const DURATIONS = ['30 min', '45 min', '60 min'];

// Build the next 7 days starting today.
function buildDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: d.toDateString(),
      weekday: i === 0 ? 'Today' : WEEKDAYS[d.getDay()],
      label: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
    });
  }
  return days;
}

export default function SchedulingScreen({ profile, onClose }) {
  const firstName = profile.name.split(' ')[0];
  const days = useMemo(buildDays, []);

  const [selected, setSelected] = useState({}); // { "dayKey|blockIdx": true }
  const [callType, setCallType] = useState('Video');
  const [duration, setDuration] = useState('30 min');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  // Refs let the drag callbacks read fresh state without stale closures.
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const gridWidthRef = useRef(0);
  const paintOnRef = useRef(true); // whether the active drag is filling or erasing

  const setKey = (key, on) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (on) next[key] = true;
      else delete next[key];
      return next;
    });
  };

  const toggle = (dayKey, blockIdx) => {
    const key = `${dayKey}|${blockIdx}`;
    setKey(key, !selectedRef.current[key]);
  };

  // Map a touch point (relative to the grid wrapper) to a day/block cell.
  const hitTest = (x, y) => {
    const w = gridWidthRef.current;
    if (!w || x < GUTTER_W) return null;
    const colW = (w - GUTTER_W) / TIME_BLOCKS.length;
    const col = Math.floor((x - GUTTER_W) / colW);
    const row = Math.floor(y / ROW_STRIDE);
    if (col < 0 || col >= TIME_BLOCKS.length) return null;
    if (row < 0 || row >= days.length) return null;
    return `${days[row].key}|${col}`;
  };

  const startPaint = (x, y) => {
    const key = hitTest(x, y);
    if (!key) return;
    paintOnRef.current = !selectedRef.current[key];
    setKey(key, paintOnRef.current);
  };

  const movePaint = (x, y) => {
    const key = hitTest(x, y);
    if (key) setKey(key, paintOnRef.current);
  };

  // Long-press to start (so quick vertical drags still scroll the page),
  // then drag across cells to paint or erase availability. These callbacks
  // run on the JS thread (no 'worklet'), so they touch React state directly.
  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(180)
    .runOnJS(true)
    .onStart((e) => startPaint(e.x, e.y))
    .onUpdate((e) => movePaint(e.x, e.y));

  const count = Object.keys(selected).length;

  // ---- Sent confirmation ----
  if (sent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.confirmWrap}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.confirmTitle}>Availability sent!</Text>
          <Text style={styles.confirmText}>
            {firstName} will get your {count} time
            {count === 1 ? ' option' : ' options'} for a {duration.toLowerCase()}{' '}
            {callType.toLowerCase()} call. You'll be notified when they pick one.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
            <Text style={styles.primaryBtnText}>Back to swiping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Scheduler ----
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule a call</Text>
          <View style={{ width: 52 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.lead}>
            Pick the times you're free to meet {firstName}.
          </Text>

          {/* Availability grid */}
          <View style={styles.gridHeaderRow}>
            <View style={styles.dayGutter} />
            {TIME_BLOCKS.map((b) => (
              <View key={b.label} style={styles.blockHead}>
                <Text style={styles.blockHeadLabel}>{b.label}</Text>
                <Text style={styles.blockHeadSub}>{b.sub}</Text>
              </View>
            ))}
          </View>

          <GestureDetector gesture={dragGesture}>
            <View
              onLayout={(e) => {
                gridWidthRef.current = e.nativeEvent.layout.width;
              }}
            >
              {days.map((day) => (
                <View key={day.key} style={styles.gridRow}>
                  <View style={styles.dayGutter}>
                    <Text style={styles.dayWeekday}>{day.weekday}</Text>
                    <Text style={styles.dayLabel}>{day.label}</Text>
                  </View>
                  {TIME_BLOCKS.map((b, blockIdx) => {
                    const isOn = !!selected[`${day.key}|${blockIdx}`];
                    return (
                      <TouchableOpacity
                        key={blockIdx}
                        style={[styles.cell, isOn && styles.cellOn]}
                        onPress={() => toggle(day.key, blockIdx)}
                        activeOpacity={0.7}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </GestureDetector>

          <Text style={styles.count}>
            {count === 0
              ? 'Tap blocks when you’re free — or press & drag to paint'
              : `${count} time slot${count === 1 ? '' : 's'} selected`}
          </Text>

          {/* Call type */}
          <Text style={styles.label}>Call type</Text>
          <View style={styles.chipWrap}>
            {CALL_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, callType === t && styles.chipOn]}
                onPress={() => setCallType(t)}
              >
                <Text style={[styles.chipText, callType === t && styles.chipTextOn]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <Text style={styles.label}>Duration</Text>
          <View style={styles.chipWrap}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, duration === d && styles.chipOn]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.chipText, duration === d && styles.chipTextOn]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note */}
          <Text style={styles.label}>Add a note (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder={`Hey ${firstName}, excited to connect! Here's when I'm free.`}
            placeholderTextColor="#5A5A68"
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryBtn, count === 0 && styles.primaryBtnDisabled]}
            onPress={() => count > 0 && setSent(true)}
            disabled={count === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {count === 0
                ? 'Select a time to continue'
                : `Send ${count} option${count === 1 ? '' : 's'} to ${firstName}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  cancel: { color: '#8A8A99', fontSize: 16, fontWeight: '600', width: 52 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  lead: {
    color: '#C8C8D4',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  gridHeaderRow: { flexDirection: 'row', marginBottom: 6 },
  dayGutter: { width: 58, justifyContent: 'center' },
  blockHead: { flex: 1, alignItems: 'center' },
  blockHeadLabel: { color: '#B8B8C7', fontSize: 11, fontWeight: '700' },
  blockHeadSub: { color: '#6A6A78', fontSize: 10, marginTop: 1 },
  gridRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'stretch' },
  dayWeekday: { color: '#fff', fontSize: 13, fontWeight: '700' },
  dayLabel: { color: '#6A6A78', fontSize: 11, marginTop: 1 },
  cell: {
    flex: 1,
    height: 44,
    marginHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
  },
  cellOn: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  count: {
    color: '#8A8A99',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  label: {
    color: '#B8B8C7',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 4 },
  chip: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  chipOn: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  chipText: { color: '#B8B8C7', fontSize: 14, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  input: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    height: 96,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1A22',
  },
  primaryBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryBtnDisabled: { backgroundColor: '#2A2A38' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Confirmation
  confirmWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkMark: { color: '#fff', fontSize: 46, fontWeight: '800' },
  confirmTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  confirmText: {
    color: '#C8C8D4',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 36,
  },
});
