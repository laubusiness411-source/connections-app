import React, { useState } from 'react';
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
import {
  ROLES,
  COMMITMENTS,
  IDEA_STATUSES,
  LOOKING_FOR,
  MAX_SKILLS,
} from '../data/profileFields';

const TOTAL_STEPS = 5;

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);

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
        return name.trim().length > 0 && role.length > 0;
      case 1:
        return location.trim().length > 0 && commitment.length > 0;
      case 2:
        return ideaStatus.length > 0 && lookingFor.length > 0;
      case 3:
        return skills.length > 0;
      case 4:
        return bio.trim().length >= 20;
      default:
        return false;
    }
  };

  const finish = () => {
    const profile = {
      id: 'me',
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
    'the basics 👋',
    'where & how much?',
    'your idea + who you want',
    'your superpowers',
    'your story',
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
                placeholderTextColor="#5A5A68"
                value={name}
                onChangeText={setName}
                autoFocus
              />
              <Text style={styles.label}>Your role</Text>
              <ChipSelect options={ROLES} value={role} onChange={setRole} />
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. San Francisco, CA or Remote"
                placeholderTextColor="#5A5A68"
                value={location}
                onChangeText={setLocation}
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

          {step === 2 && (
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

          {step === 3 && (
            <>
              <Text style={styles.label}>
                Add up to {MAX_SKILLS} skills ({skills.length}/{MAX_SKILLS})
              </Text>
              <View style={styles.skillRow}>
                <TextInput
                  style={[styles.input, styles.skillInput]}
                  placeholder="e.g. Full-Stack"
                  placeholderTextColor="#5A5A68"
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

          {step === 4 && (
            <>
              <Text style={styles.label}>
                Your pitch — what are you building toward and who do you want
                next to you?
              </Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="A couple sentences. What drives you, what you've done, what you need in a co-founder."
                placeholderTextColor="#5A5A68"
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
            title={step === TOTAL_STEPS - 1 ? 'start swiping' : 'continue'}
            onPress={next}
            disabled={!canContinue()}
            style={styles.nextBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F' },
  progressHeader: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  stepCount: { color: '#6A6A78', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  progressTrack: {
    height: 4,
    backgroundColor: '#232331',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: '#6C5CE7', borderRadius: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  avatarRow: { alignItems: 'center', marginTop: 12, marginBottom: 4 },
  label: {
    color: '#B8B8C7',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  textarea: { height: 140 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#26262F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  chipSelected: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  chipText: { color: '#B8B8C7', fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  skillRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  skillInput: { flex: 1 },
  addBtn: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addBtnDisabled: { backgroundColor: '#2A2A38' },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  hint: { color: '#6A6A78', fontSize: 13, marginTop: 12 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1A22',
  },
  backBtn: { paddingVertical: 16, paddingHorizontal: 20 },
  backBtnPlaceholder: { width: 0 },
  backBtnText: { color: '#8A8A99', fontSize: 16, fontWeight: '600' },
  nextBtn: { flex: 1 },
});
