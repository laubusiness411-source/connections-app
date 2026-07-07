import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  getLatestMeeting,
  createMeeting,
  confirmMeeting,
  subscribeToMeetings,
} from '../lib/db';
import { useTheme } from '../theme/ThemeContext';
import { generateIcebreakers } from '../data/icebreakers';
import { buildCalendarUrl } from '../lib/gcal';
import SchedulingScreen from '../components/SchedulingScreen';

export default function ChatScreen({ match, myId, me, onBack }) {
  const { matchId, profile } = match;
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [meeting, setMeeting] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const scrollRef = useRef(null);
  const starters = useMemo(() => generateIcebreakers(me, profile), [me, profile]);
  const firstName = profile?.name?.split(' ')[0] || 'them';

  const loadMeeting = async () => {
    const m = await getLatestMeeting(matchId);
    setMeeting(m);
  };
  useEffect(() => {
    loadMeeting();
    const channel = subscribeToMeetings(matchId, loadMeeting);
    return () => channel.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const propose = async (payload) => {
    try {
      const m = await createMeeting(matchId, myId, profile.id, payload);
      setMeeting(m);
    } catch {
      // surfaced via console
    }
  };

  const confirm = async (slot) => {
    try {
      const m = await confirmMeeting(meeting.id, slot);
      setMeeting(m);
    } catch {
      // ignore
    }
  };

  const addToCalendar = () => {
    const url = buildCalendarUrl({
      slot: meeting.confirmed_slot,
      duration: meeting.duration,
      callType: meeting.call_type,
      note: meeting.note,
      otherName: firstName,
    });
    if (url) Linking.openURL(url);
  };

  const slotLabel = (s) => (s ? `${s.dayKey} · ${s.block}` : '');
  const amRecipient = meeting && myId === meeting.recipient;

  useEffect(() => {
    let active = true;
    fetchMessages(matchId).then((m) => {
      if (active) setMessages(m);
    });
    const channel = subscribeToMessages(matchId, (row) => {
      setMessages((prev) =>
        prev.some((m) => m.id === row.id) ? prev : [...prev, row]
      );
    });
    return () => {
      active = false;
      channel.unsubscribe();
    };
  }, [matchId]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    try {
      const row = await sendMessage(matchId, myId, body);
      if (row) {
        setMessages((prev) =>
          prev.some((m) => m.id === row.id) ? prev : [...prev, row]
        );
      }
    } catch {
      setText(body); // restore on failure
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.accent} />
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {profile?.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {profile?.name ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?'}
                </Text>
              </View>
            )}
            <Text style={styles.name}>{profile?.name?.split(' ')[0] || 'Chat'}</Text>
          </View>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          <Text style={styles.matchedNote}>
            You're connected with {profile?.name?.split(' ')[0]}. Say hello.
          </Text>

          {/* Scheduling */}
          <View style={styles.meetingCard}>
            {!meeting && (
              <TouchableOpacity
                style={styles.proposeBtn}
                onPress={() => setShowSchedule(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.proposeText}>📅 Propose a meeting</Text>
              </TouchableOpacity>
            )}

            {meeting?.status === 'proposed' && amRecipient && (
              <>
                <Text style={styles.meetingLabel}>
                  📅 {firstName} proposed times — tap to confirm
                </Text>
                {(meeting.slots || []).map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.slotBtn}
                    onPress={() => confirm(s)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.slotText}>{slotLabel(s)}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {meeting?.status === 'proposed' && !amRecipient && (
              <Text style={styles.meetingLabel}>
                📅 Waiting for {firstName} to pick a time…
              </Text>
            )}

            {meeting?.status === 'confirmed' && (
              <>
                <Text style={styles.meetingConfirmed}>✅ Call confirmed</Text>
                <Text style={styles.meetingWhen}>
                  {slotLabel(meeting.confirmed_slot)} · {meeting.duration} ·{' '}
                  {meeting.call_type}
                </Text>
                <TouchableOpacity
                  style={styles.calBtn}
                  onPress={addToCalendar}
                  activeOpacity={0.85}
                >
                  <Text style={styles.calText}>Add to Google Calendar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {messages.length === 0 && starters.length > 0 && (
            <View style={styles.starters}>
              <Text style={styles.startersLabel}>CONVERSATION STARTERS</Text>
              {starters.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.starter}
                  onPress={() => setText(s)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.starterText}>{s}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.startersHint}>Tap one to use it, then edit & send.</Text>
            </View>
          )}

          {messages.map((m) => {
            const mine = m.sender === myId;
            return (
              <View
                key={m.id}
                style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}
              >
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
                    {m.body}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message"
            placeholderTextColor={theme.colors.inputPlaceholder}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnOff]}
            onPress={send}
            disabled={!text.trim()}
          >
            <Ionicons name="arrow-up" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {showSchedule && (
        <View style={styles.scheduleOverlay}>
          <SchedulingScreen
            profile={profile}
            onSend={propose}
            onClose={() => setShowSchedule(false)}
          />
        </View>
      )}
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', width: 70 },
    back: { color: t.colors.accent, fontSize: 16, fontWeight: '700' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    name: { color: t.colors.text, fontSize: 17, fontWeight: '700' },
    messages: { padding: 16, paddingBottom: 8 },
    matchedNote: {
      color: t.colors.textFaint,
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 16,
    },
    meetingCard: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
    },
    proposeBtn: { alignItems: 'center', paddingVertical: 4 },
    proposeText: { color: t.colors.accent, fontSize: 15, fontWeight: '700' },
    meetingLabel: { color: t.colors.textSoft, fontSize: 14, fontWeight: '600', marginBottom: 8 },
    slotBtn: {
      backgroundColor: t.colors.surface2,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginTop: 8,
    },
    slotText: { color: t.colors.text, fontSize: 14, fontWeight: '600' },
    meetingConfirmed: { color: t.colors.success, fontSize: 15, fontWeight: '800' },
    meetingWhen: { color: t.colors.textSoft, fontSize: 14, marginTop: 4 },
    calBtn: {
      backgroundColor: t.colors.accent,
      borderRadius: 22,
      paddingVertical: 11,
      alignItems: 'center',
      marginTop: 12,
    },
    calText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    scheduleOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.colors.bg,
      zIndex: 500,
    },
    starters: { marginBottom: 8 },
    startersLabel: {
      color: t.colors.accentSoft,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    starter: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderAccent,
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
    },
    starterText: { color: t.colors.textSoft, fontSize: 14, lineHeight: 20 },
    startersHint: {
      color: t.colors.textFaint,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 8,
    },
    bubbleRow: { flexDirection: 'row', marginBottom: 8 },
    rowMine: { justifyContent: 'flex-end' },
    rowTheirs: { justifyContent: 'flex-start' },
    bubble: {
      maxWidth: '78%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
    },
    mine: { backgroundColor: t.colors.accent, borderBottomRightRadius: 4 },
    theirs: { backgroundColor: t.colors.surface, borderBottomLeftRadius: 4 },
    bubbleText: { color: t.colors.textSoft, fontSize: 15, lineHeight: 20 },
    bubbleTextMine: { color: '#fff' },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
    },
    input: {
      flex: 1,
      maxHeight: 110,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      color: t.colors.text,
      fontSize: 15,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnOff: { backgroundColor: t.colors.surface2 },
  });
