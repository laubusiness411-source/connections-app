import React, { useState, useMemo } from 'react';
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
import ChipSelect from '../components/ChipSelect';
import AvatarPicker from '../components/AvatarPicker';
import GradientButton from '../components/GradientButton';
import CityAutocomplete from '../components/CityAutocomplete';
import { useTheme } from '../theme/ThemeContext';
import { GOAL_EXAMPLES } from '../data/goalMatch';
import {
  ROLES,
  COMMITMENTS,
  IDEA_STATUSES,
  LOOKING_FOR,
  MAX_SKILLS,
} from '../data/profileFields';

const TOTAL_STEPS = 6;

export default function OnboardingScreen({ onComplete }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [step, setStep] = useState(0);

  const [goal, setGoal] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [commitment, setCommitment] = useState('');
  const [ideaStatus, setIdeaStatus] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [bio, setBio] = useState('');

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (skills.length >= MAX_SKILLS) return;
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkillInput('');
      return;
    }
    setSkills([...skills, s]);
    setSkillInput('');
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  // Per-step validation gates the Continue button.
  const canContinue = () => {
    switch (step) {
      case 0:
        return goal.trim().length >= 3;
      case 1:
        return name.trim().length > 0 && role.length > 0;
      case 2:
        return location.trim().length > 0 && commitment.length > 0;
      case 3:
        return ideaStatus.length > 0 && lookingFor.length > 0;
      case 4:
        return skills.length > 0;
      case 5:
        return bio.trim().length >= 20;
      default:
        return false;
    }
  };

  const finish = () => {
    const profile = {
      id: 'me',
      goal: goal.trim(),
      photoUri,
      name: name.trim(),
      role,
      location: location.trim(),
      commitment,
      ideaStatus,
      bio: bio.trim(),
      skills,
      lookingFor,
    };
    onComplete(profile);
  };

  const next = () => {
    if (!canContinue()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const STEP_TITLES = [
    'Your 90-day goal',
    'About you',
    'Location & commitment',
    'Your idea & who you want',
    'Your skills',
    'Your pitch',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepCount}>
            Step {step + 1} of {TOTAL_STEPS}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((step + 1) / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{STEP_TITLES[step]}</Text>

          {step === 0 && (
            <>
              <Text style={styles.subtitle}>
                We'll connect you with the people who can help you get there.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Start an AI agency for painters"
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={goal}
                onChangeText={setGoal}
                autoFocus
              />
              <Text style={styles.hint}>Pick one, or write your own.</Text>
              <View style={styles.chipWrap}>
                {GOAL_EXAMPLES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, goal === g && styles.chipSelected]}
                    onPress={() => setGoal(g)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        goal === g && styles.chipTextSelected,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <View style={styles.avatarRow}>
                <AvatarPicker
                  name={name}
                  photoUri={photoUri}
                  onChange={setPhotoUri}
                />
              </View>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex Rivera"
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={name}
                onChangeText={setName}
                autoFocus
              />
              <Text style={styles.label}>Your role</Text>
              <ChipSelect options={ROLES} value={role} onChange={setRole} />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.label}>Location</Text>
              <CityAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="start typing a city… or Remote"
                autoFocus
              />
              <Text style={styles.label}>Commitment level</Text>
              <ChipSelect
                options={COMMITMENTS}
                value={commitment}
                onChange={setCommitment}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.label}>Where's your idea at?</Text>
              <ChipSelect
                options={IDEA_STATUSES}
                value={ideaStatus}
                onChange={setIdeaStatus}
              />
              <Text style={styles.label}>What are you looking for?</Text>
              <ChipSelect
                options={LOOKING_FOR}
                value={lookingFor}
                onChange={setLookingFor}
              />
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.label}>
                Add up to {MAX_SKILLS} skills ({skills.length}/{MAX_SKILLS})
              </Text>
              <View style={styles.skillRow}>
                <TextInput
                  style={[styles.input, styles.skillInput]}
                  placeholder="e.g. Full-Stack"
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onSubmitEditing={addSkill}
                  returnKeyType="done"
                  editable={skills.length < MAX_SKILLS}
                />
                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    (skills.length >= MAX_SKILLS || !skillInput.trim()) &&
                      styles.addBtnDisabled,
                  ]}
                  onPress={addSkill}
                  disabled={skills.length >= MAX_SKILLS || !skillInput.trim()}
                >
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipWrap}>
                {skills.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, styles.chipSelected]}
                    onPress={() => removeSkill(s)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, styles.chipTextSelected]}>
                      {s}  ✕
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {skills.length === 0 && (
                <Text style={styles.hint}>
                  Tap a skill after adding it to remove it.
                </Text>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <Text style={styles.label}>
                Your pitch — what are you building toward and who do you want
                next to you?
              </Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="A couple sentences. What drives you, what you've done, what you need in a co-founder."
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={bio}
                onChangeText={setBio}
                multiline
                textAlignVertical="top"
                autoFocus
              />
              <Text style={styles.hint}>
                {bio.trim().length < 20
                  ? `${20 - bio.trim().length} more characters to go`
                  : 'Looking good.'}
              </Text>
            </>
          )}
        </ScrollView>

        {/* Footer nav */}
        <View style={styles.footer}>
          {step > 0 ? (
            <TouchableOpacity style={styles.backBtn} onPress={back}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}
          <GradientButton
            title={step === TOTAL_STEPS - 1 ? 'Finish' : 'Continue'}
            onPress={next}
            disabled={!canContinue()}
            style={styles.nextBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.bg },
    progressHeader: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
    stepCount: { color: t.colors.textFaint, fontSize: 12, fontWeight: '600', marginBottom: 8 },
    progressTrack: {
      height: 4,
      backgroundColor: t.colors.surface2,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: { height: 4, backgroundColor: t.colors.accent, borderRadius: 2 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
    title: { color: t.colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
    subtitle: { color: t.colors.textMuted, fontSize: 15, lineHeight: 21, marginBottom: 18 },
    avatarRow: { alignItems: 'center', marginTop: 12, marginBottom: 4 },
    label: {
      color: t.colors.textSoft,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 24,
      marginBottom: 10,
    },
    input: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: t.colors.text,
      fontSize: 16,
    },
    textarea: { height: 140 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
    },
    chipSelected: { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
    chipText: { color: t.colors.textMuted, fontSize: 14, fontWeight: '600' },
    chipTextSelected: { color: t.colors.onAccent },
    skillRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    skillInput: { flex: 1 },
    addBtn: {
      backgroundColor: t.colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 12,
    },
    addBtnDisabled: { backgroundColor: t.colors.surface2 },
    addBtnText: { color: t.colors.onAccent, fontSize: 15, fontWeight: '700' },
    hint: { color: t.colors.textFaint, fontSize: 13, marginTop: 12 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: t.colors.border,
    },
    backBtn: { paddingVertical: 16, paddingHorizontal: 20 },
    backBtnPlaceholder: { width: 0 },
    backBtnText: { color: t.colors.textMuted, fontSize: 16, fontWeight: '600' },
    nextBtn: { flex: 1 },
  });
