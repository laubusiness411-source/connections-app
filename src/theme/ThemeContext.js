import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme } from './themes';

// v2 key: defaults changed to the light, LinkedIn-style look.
const KEY = '@klyk/theme-v2';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light');
  const [accentKey, setAccentState] = useState('blue');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.mode) setModeState(saved.mode);
          if (saved.accentKey) setAccentState(saved.accentKey);
        }
      } catch {
        // keep defaults
      }
    })();
  }, []);

  const save = useCallback((next) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setMode = useCallback(
    (m) => {
      setModeState(m);
      save({ mode: m, accentKey });
    },
    [accentKey, save]
  );

  const setAccent = useCallback(
    (a) => {
      setAccentState(a);
      save({ mode, accentKey: a });
    },
    [mode, save]
  );

  const theme = useMemo(() => buildTheme(mode, accentKey), [mode, accentKey]);

  const value = useMemo(
    () => ({ theme, mode, accentKey, setMode, setAccent }),
    [theme, mode, accentKey, setMode, setAccent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Always returns a valid theme, even outside a provider.
export function useTheme() {
  return useContext(ThemeContext) || { theme: buildTheme('light', 'blue') };
}
