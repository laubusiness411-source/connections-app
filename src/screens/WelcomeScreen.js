import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';

const PERKS = [
  { icon: '🎯', title: 'set your 90-day goal', sub: 'tell us what you’re trying to do' },
  { icon: '🤝', title: 'meet the right people', sub: 'a guaranteed intro every week' },
  { icon: '🛠️', title: 'hire local help', sub: 'post a need, match with small businesses' },
];

export default function WelcomeScreen({ onGetStarted, onLogin }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.hero}>
          <GradientText style={styles.logo}>GoalMatch</GradientText>
          <Text style={styles.tagline}>
            stop networking. start an opportunity engine.
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
          <GradientButton
            title="get started"
            onPress={onGetStarted}
            style={styles.cta}
          />
          <TouchableOpacity onPress={onLogin} hitSlop={10} style={styles.loginBtn}>
            <Text style={styles.loginText}>i already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  body: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 46, fontWeight: '800', color: '#6C5CE7', textAlign: 'center' },
  tagline: {
    color: '#9A9AAB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  perks: { gap: 22 },
  perk: { flexDirection: 'row', alignItems: 'center' },
  perkIcon: { fontSize: 30, marginRight: 16, width: 38, textAlign: 'center' },
  perkText: { flex: 1 },
  perkTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  perkSub: { color: '#8A8A99', fontSize: 14, marginTop: 2 },
  footer: { marginTop: 52 },
  cta: { width: '100%' },
  loginBtn: { alignItems: 'center', marginTop: 18 },
  loginText: { color: '#8A8A99', fontSize: 14, fontWeight: '600' },
});
