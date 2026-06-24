# CoFounder — Expo App

"Tinder for co-founders." Swipe-based matching to find a business partner.
This is the Co-Founder Mode MVP scaffold, ported from the single-file web prototype
to React Native + Expo with **native gesture physics** (Reanimated + Gesture Handler).

## What's here

```
App.js                         # Entry: loads profile, gates onboarding vs swipe deck
app.json                       # Expo config (bundle IDs, splash, image-picker perms)
babel.config.js                # expo preset + reanimated plugin (must be last)
src/
  data/
    profiles.js                # Hardcoded demo profiles (match + no-match flows)
    profileFields.js           # Shared field option sets (roles, commitment, ...)
    profileStorage.js          # Load/save/clear the user's profile (AsyncStorage)
  components/
    SwipeCard.js               # Native swipe card: drag, rotate, CONNECT/PASS, report
    MatchScreen.js             # "It's a Match!" overlay + Schedule a call CTA
    SchedulingScreen.js        # when2meet-style availability picker (tap or drag)
    ChipSelect.js              # Reusable single-select pill row
    AvatarPicker.js            # Photo picker w/ initials fallback (expo-image-picker)
  screens/
    OnboardingScreen.js        # 5-step profile creation wizard (first launch)
    SwipeScreen.js             # Deck, swipe handling, match detection, settings, block
    EditProfileScreen.js       # Single-page profile editor
    SettingsScreen.js          # Profile summary, edit, blocked users, reset
```

## Run it

You need Node 18+ and the Expo CLI (bundled via `npx`).

```bash
cd cofounder-app
npm install
npx expo start
```

Then:
- Press `i` for iOS simulator (needs Xcode, macOS only)
- Press `a` for Android emulator (needs Android Studio)
- Or scan the QR code with the **Expo Go** app on your physical phone (easiest)

## Core loop

- **First launch:** a 5-step onboarding wizard captures your profile (name,
  photo, role, location, commitment, idea status, skills, pitch). Saved
  locally, so you skip straight to the deck on every later launch.
- Drag a card past the threshold (or tap ✓ / ✕) to swipe right/left.
- Swiping right on a profile where `likesYou: true` triggers the match screen.
- Demo profiles 1, 3, 5 match; 2 and 4 don't (6–12 are extra deck filler).
- **On a match:** "Schedule a call" opens a when2meet-style availability
  picker — tap or press-and-drag to mark free slots, pick call type +
  duration, add a note, send.
- **"..." on any card** → block or report (removes them from the deck).
- **Gear icon** → settings: edit profile, manage blocked users, reset profile.

> Note: everything persists locally only. Profiles in the deck are still demo
> data, and "send availability" / matches aren't networked yet — that's the
> backend step below.

## Match detection

Currently client-side against hardcoded `likesYou` flags. In production this becomes:
1. Swipe right → POST to your backend.
2. Backend checks if the other user already swiped right on you.
3. If yes → create a match record, push-notify both users.

## Done

- ✅ Profile creation / onboarding flow
- ✅ Edit profile + settings + reset
- ✅ Profile photo uploads (initials fallback)
- ✅ Block / report (App Store requirement for people apps)
- ✅ when2meet-style call scheduling (tap + drag-to-select)

## Next steps

- **Real backend + auth** (Supabase) — accounts, persisted profiles, a real
  deck of users, and server-side match detection. This makes "send
  availability" and matches actually work between real people.
- Push notifications (expo-notifications) for "It's a match!".
- Real-time chat once two people match.