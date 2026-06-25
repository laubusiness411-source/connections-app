// Theme definitions: dark/light modes + selectable accent color schemes.
// Every screen reads colors from here via useTheme().

export const ACCENTS = {
  purple: {
    key: 'purple',
    label: 'Purple',
    color: '#6C5CE7',
    soft: '#A99CF0',
    gradient: ['#8E7BFF', '#6C5CE7'],
    textGradient: ['#A99CF0', '#6C5CE7', '#5BC0EB'],
  },
  blue: {
    key: 'blue',
    label: 'Blue',
    color: '#3B82F6',
    soft: '#93C5FD',
    gradient: ['#60A5FA', '#3B82F6'],
    textGradient: ['#93C5FD', '#3B82F6', '#22D3EE'],
  },
  green: {
    key: 'green',
    label: 'Green',
    color: '#10B981',
    soft: '#6EE7B7',
    gradient: ['#34D399', '#10B981'],
    textGradient: ['#6EE7B7', '#10B981', '#34D399'],
  },
  pink: {
    key: 'pink',
    label: 'Pink',
    color: '#EC4899',
    soft: '#F9A8D4',
    gradient: ['#F472B6', '#EC4899'],
    textGradient: ['#F9A8D4', '#EC4899', '#A855F7'],
  },
  orange: {
    key: 'orange',
    label: 'Orange',
    color: '#F59E0B',
    soft: '#FCD34D',
    gradient: ['#FBBF24', '#F59E0B'],
    textGradient: ['#FCD34D', '#F59E0B', '#FB923C'],
  },
};

export const ACCENT_LIST = Object.values(ACCENTS);

// Constant status colors (same in both modes).
const STATUS = { success: '#2ECC71', danger: '#FF4D6D', warn: '#FDCB6E' };

const DARK = {
  bg: '#0B0B0F',
  surface: '#16161D',
  surface2: '#232331',
  surface3: '#1E1E28',
  border: '#26262F',
  borderAccent: '#2E2A45',
  text: '#FFFFFF',
  textSoft: '#C8C8D4',
  textMuted: '#8A8A99',
  textFaint: '#6A6A78',
  inputPlaceholder: '#5A5A68',
  overlay: 'rgba(11,11,15,0.97)',
  ...STATUS,
};

const LIGHT = {
  bg: '#F4F4F8',
  surface: '#FFFFFF',
  surface2: '#ECECF2',
  surface3: '#E9E9F0',
  border: '#E2E2EA',
  borderAccent: '#D9D4F2',
  text: '#12121A',
  textSoft: '#33333D',
  textMuted: '#6A6A78',
  textFaint: '#9A9AAB',
  inputPlaceholder: '#A0A0AE',
  overlay: 'rgba(244,244,248,0.97)',
  ...STATUS,
};

export function buildTheme(mode = 'dark', accentKey = 'purple') {
  const accent = ACCENTS[accentKey] || ACCENTS.purple;
  const base = mode === 'light' ? LIGHT : DARK;
  return {
    mode,
    accentKey: accent.key,
    gradient: accent.gradient,
    textGradient: accent.textGradient,
    colors: {
      ...base,
      accent: accent.color,
      accentSoft: accent.soft,
      onAccent: '#FFFFFF',
    },
  };
}
