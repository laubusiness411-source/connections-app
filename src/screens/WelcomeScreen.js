import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import { useTheme } from '../theme/ThemeContext';

const PERKS = [
  { icon: '🎯', title: 'Set your 90-day goal', sub: 'Tell us what you’re working toward' },
  { icon: '🤝', title: 'Meet the right people', sub: 'A guaranteed introduction every week' },
  { icon: '💼', title: 'Hire local help', sub: 'Post a need, connect with local pros' },
];

export default function WelcomeScreen({ onGetStarted, onLogin }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.hero}>
          <GradientText style={styles.logo}>Klyk</GradientText>
          <Text style={styles.tagline}>
            Stop networking. Start an opportunity engine.
          </Text>
        </View>

        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p.title} style={styles.perk}>
              <Text style={styles.perkIcon}>{p.icon}</Text>
              <View style={styles.perkText}>
                <Text style={styles.perkTitle}>{p.title}</Text>
                <Text style={styles.perkSub}>{p.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <GradientButton title="Get started" onPress={onGetStarted} style={styles.cta} />
          <TouchableOpacity onPress={onLogin} hitSlop={10} style={styles.loginBtn}>
            <Text style={styles.loginText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.bg },
    body: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
    hero: { alignItems: 'center', marginBottom: 48 },
    logo: { fontSize: 46, fontWeight: '800', color: t.colors.accent, textAlign: 'center' },
    tagline: {
      color: t.colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 22,
    },
    perks: { gap: 22 },
    perk: { flexDirection: 'row', alignItems: 'center' },
    perkIcon: { fontSize: 30, marginRight: 16, width: 38, textAlign: 'center' },
    perkText: { flex: 1 },
    perkTitle: { color: t.colors.text, fontSize: 17, fontWeight: '700' },
    perkSub: { color: t.colors.textMuted, fontSize: 14, marginTop: 2 },
    footer: { marginTop: 52 },
    cta: { width: '100%' },
    loginBtn: { alignItems: 'center', marginTop: 18 },
    loginText: { color: t.colors.textMuted, fontSize: 14, fontWeight: '600' },
  });
