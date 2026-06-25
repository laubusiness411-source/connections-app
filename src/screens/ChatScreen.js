import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import {
  fetchMessages,
  sendMessage,
  subscribeToMessages,
} from '../lib/db';
import { useTheme } from '../theme/ThemeContext';

export default function ChatScreen({ match, myId, onBack }) {
  const { matchId, profile } = match;
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

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
          <TouchableOpacity onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>‹ back</Text>
          </TouchableOpacity>
          <Text style={styles.name}>{profile?.name?.split(' ')[0] || 'chat'}</Text>
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
            you matched with {profile?.name?.split(' ')[0]} — say hey 👋
          </Text>
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
            placeholder="message…"
            placeholderTextColor={theme.colors.inputPlaceholder}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnOff]}
            onPress={send}
            disabled={!text.trim()}
          >
            <Text style={styles.sendText}>send</Text>
          </TouchableOpacity>
        </View>
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    back: { color: t.colors.accent, fontSize: 16, fontWeight: '700', width: 50 },
    name: { color: t.colors.text, fontSize: 17, fontWeight: '700' },
    messages: { padding: 16, paddingBottom: 8 },
    matchedNote: {
      color: t.colors.textFaint,
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 16,
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
      backgroundColor: t.colors.accent,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 11,
    },
    sendBtnOff: { backgroundColor: t.colors.surface2 },
    sendText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });
