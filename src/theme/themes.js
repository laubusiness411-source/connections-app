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
    color: '#0A66C2',
    soft: '#4A8BD4',
    gradient: ['#2E7FD1', '#0A66C2'],
    textGradient: ['#0A66C2', '#0A66C2', '#2E7FD1'],
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

// Warm, professional light palette (LinkedIn-style).
const LIGHT = {
  bg: '#F4F2EE',
  surface: '#FFFFFF',
  surface2: '#EDEBE7',
  surface3: '#E9E7E2',
  border: '#E0DEDA',
  borderAccent: '#CFE0F1',
  text: '#191919',
  textSoft: '#3D3D3D',
  textMuted: '#666666',
  textFaint: '#8C8C8C',
  inputPlaceholder: '#A6A6A6',
  overlay: 'rgba(244,242,238,0.97)',
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
