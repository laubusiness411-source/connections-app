import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tracks daily streaks + per-day activity for the gamification layer.
// Local (AsyncStorage) for now; can move to the cloud profile later.

const KEY = '@goalmatch/engagement';

// Daily quest targets.
export const SWIPE_GOAL = 5;
export const INTRO_GOAL = 1;

const EngagementContext = createContext(null);
export const useEngagement = () => useContext(EngagementContext);

function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function todayStr() {
  return dateStr(new Date());
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateStr(d);
}
function freshDaily(t) {
  return { date: t, swipes: 0, intros: 0 };
}

export function EngagementProvider({ children }) {
  const [state, setState] = useState(null); // null while loading
  const ref = useRef(null);

  const persist = useCallback(async (next) => {
    ref.current = next;
    setState(next);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('engagement save failed:', e.message);
    }
  }, []);

  // On mount: load, then record today's visit and roll the streak.
  useEffect(() => {
    (async () => {
      let data = null;
      try {
        const raw = await AsyncStorage.getItem(KEY);
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }
      const t = todayStr();
      if (!data) {
        data = {
          lastActiveDate: t,
          currentStreak: 1,
          longestStreak: 1,
          daily: freshDaily(t),
        };
      } else {
        if (data.lastActiveDate === t) {
          // already counted today
        } else if (data.lastActiveDate === yesterdayStr()) {
          data.currentStreak = (data.currentStreak || 0) + 1;
        } else {
          data.currentStreak = 1;
        }
        data.lastActiveDate = t;
        data.longestStreak = Math.max(
          data.longestStreak || 0,
          data.currentStreak
        );
        if (!data.daily || data.daily.date !== t) data.daily = freshDaily(t);
      }
      persist(data);
    })();
  }, [persist]);

  const bump = useCallback(
    (field) => {
      const s = ref.current;
      if (!s) return;
      const t = todayStr();
      const daily = s.daily && s.daily.date === t ? s.daily : freshDaily(t);
      persist({ ...s, daily: { ...daily, [field]: daily[field] + 1 } });
    },
    [persist]
  );

  const recordSwipe = useCallback(() => bump('swipes'), [bump]);
  const recordIntro = useCallback(() => bump('intros'), [bump]);

  return (
    <EngagementContext.Provider value={{ state, recordSwipe, recordIntro }}>
      {children}
    </EngagementContext.Provider>
  );
}
