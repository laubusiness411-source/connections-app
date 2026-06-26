import AsyncStorage from '@react-native-async-storage/async-storage';

// Local read-tracking for conversations: matchId -> last-read ISO timestamp.
const KEY = '@goalmatch/reads';

export async function getReads() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function markRead(matchId) {
  try {
    const reads = await getReads();
    reads[matchId] = new Date().toISOString();
    await AsyncStorage.setItem(KEY, JSON.stringify(reads));
  } catch {
    // ignore
  }
}

// A conversation is unread if the latest message is from the other person and
// newer than the last time we opened it.
export function isUnread(match, reads, myId) {
  const m = match.lastMessage;
  if (!m || m.sender === myId) return false;
  const last = reads[match.matchId];
  return !last || m.created_at > last;
}
