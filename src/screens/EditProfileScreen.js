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
import CityAutocomplete from '../components/CityAutocomplete';
import SchoolAutocomplete from '../components/SchoolAutocomplete';
import { useTheme } from '../theme/ThemeContext';
import {
  ROLES,
  COMMITMENTS,
  IDEA_STATUSES,
  LOOKING_FOR,
  MAX_SKILLS,
  EDU_STATUSES,
} from '../data/profileFields';

// Single-page form for editing an existing profile (vs the step wizard
// used for first-time onboarding).
export default function EditProfileScreen({ initialProfile, onSave, onCancel }) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [goal, setGoal] = useState(initialProfile.goal || '');
  const [photoUri, setPhotoUri] = useState(initialProfile.photoUri || null);
  const [name, setName] = useState(initialProfile.name || '');
  const [role, setRole] = useState(initialProfile.role || '');
  const [eduStatus, setEduStatus] = useState(initialProfile.eduStatus || '');
  const [school, setSchool] = useState(initialProfile.school || '');
  const [gradYear, setGradYear] = useState(initialProfile.gradYear || '');
  const [location, setLocation] = useState(initialProfile.location || '');
  const [commitment, setCommitment] = useState(initialProfile.commitment || '');
  const [ideaStatus, setIdeaStatus] = useState(initialProfile.ideaStatus || '');
  const [lookingFor, setLookingFor] = useState(initialProfile.lookingFor || '');
  const [skills, setSkills] = useState(initialProfile.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [bio, setBio] = useState(initialProfile.bio || '');

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.length >= MAX_SKILLS) return;
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkillInput('');
      return;
    }
    setSkills([...skills, s]);
    setSkillInput('');
  };
  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const valid =
    goal.trim().length >= 3 &&
    name.trim() &&
    role &&
    location.trim() &&
    commitment &&
    ideaStatus &&
    lookingFor &&
    skills.length > 0 &&
    bio.trim().length >= 20;

  const save = () => {
    if (!valid) return;
    onSave({
      ...initialProfile,
      goal: goal.trim(),
      photoUri,
      name: name.trim(),
      role,
      eduStatus,
      school: school.trim(),
      gradYear: gradYear.trim(),
      location: location.trim(),
      commitment,
      ideaStatus,
      lookingFor,
      skills,
      bio: bio.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} hitSlop={12}>
            <Text style={styles.headerBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit profile</Text>
          <TouchableOpacity onPress={save} hitSlop={12} disabled={!valid}>
            <Text style={[styles.headerBtn, styles.save, !valid && styles.saveDisabled]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarRow}>
            <AvatarPicker name={name} photoUri={photoUri} onChange={setPhotoUri} />
          </View>

          <Text style={styles.label}>Your 90-day goal 🎯</Text>
          <TextInput
            style={styles.input}
            value={goal}
            onChangeText={setGoal}
            placeholder="e.g. Start an AI agency for painters"
            placeholderTextColor={theme.colors.inputPlaceholder}
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.inputPlaceholder}
          />

          <Text style={styles.label}>Role</Text>
          <ChipSelect options={ROLES} value={role} onChange={setRole} />

          <Text style={styles.label}>Status</Text>
          <ChipSelect options={EDU_STATUSES} value={eduStatus} onChange={setEduStatus} />
          {(eduStatus === 'Student' || eduStatus === 'Recent grad') && (
            <>
              <Text style={styles.label}>School</Text>
              <SchoolAutocomplete
                value={school}
                onChange={setSchool}
                placeholder="Start typing your school"
              />
              <Text style={styles.label}>Graduation year</Text>
              <TextInput
                style={styles.input}
                value={gradYear}
                onChangeText={setGradYear}
                placeholder="e.g. 2026"
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="number-pad"
                maxLength={4}
              />
            </>
          )}

          <Text style={styles.label}>Location</Text>
          <CityAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="start typing a city… or Remote"
          />

          <Text style={styles.label}>Commitment</Text>
          <ChipSelect
            options={COMMITMENTS}
            value={commitment}
            onChange={setCommitment}
          />

          <Text style={styles.label}>Idea status</Text>
          <ChipSelect
            options={IDEA_STATUSES}
            value={ideaStatus}
            onChange={setIdeaStatus}
          />

          <Text style={styles.label}>Looking for</Text>
          <ChipSelect
            options={LOOKING_FOR}
            value={lookingFor}
            onChange={setLookingFor}
          />

          <Text style={styles.label}>
            Skills ({skills.length}/{MAX_SKILLS})
          </Text>
          <View style={styles.skillRow}>
            <TextInput
              style={[styles.input, styles.skillInput]}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={addSkill}
              returnKeyType="done"
              placeholder="e.g. Full-Stack"
              placeholderTextColor={theme.colors.inputPlaceholder}
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
          <View style={styles.skillChips}>
            {skills.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.skillChip}
                onPress={() => removeSkill(s)}
                activeOpacity={0.8}
              >
                <Text style={styles.skillChipText}>{s}  ✕</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your pitch</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={bio}
            onChangeText={setBio}
            multiline
            textAlignVertical="top"
            placeholder="What you're building toward and who you want next to you."
            placeholderTextColor={theme.colors.inputPlaceholder}
          />
          {bio.trim().length < 20 && (
            <Text style={styles.hint}>
              {20 - bio.trim().length} more characters needed
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerBtn: { color: t.colors.textMuted, fontSize: 16, fontWeight: '600' },
    headerTitle: { color: t.colors.text, fontSize: 17, fontWeight: '700' },
    save: { color: t.colors.accent, fontWeight: '700' },
    saveDisabled: { color: t.colors.textFaint },
    content: { paddingHorizontal: 24, paddingBottom: 32 },
    avatarRow: { alignItems: 'center', marginTop: 8 },
    label: {
      color: t.colors.textSoft,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 22,
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
    textarea: { height: 130 },
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
    skillChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
    skillChip: {
      backgroundColor: t.colors.accent,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 8,
    },
    skillChipText: { color: t.colors.onAccent, fontSize: 14, fontWeight: '600' },
    hint: { color: t.colors.textFaint, fontSize: 13, marginTop: 10 },
  });
