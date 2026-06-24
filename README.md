# CoFounder â€” Expo App

"Tinder for co-founders." Swipe-based matching to find a business partner.
This is the Co-Founder Mode MVP scaffold, ported from the single-file web prototype
to React Native + Expo with **native gesture physics** (Reanimated + Gesture Handler).

## What's here

```
App.js                         # Entry: gesture root + safe area providers
app.json                       # Expo config (bundle IDs, splash)
babel.config.js                # expo preset + reanimated plugin (must be last)
src/
  data/profiles.js             # Hardcoded demo profiles (match + no-match flows)
  components/
    SwipeCard.js               # Native swipe card: drag, rotate, CONNECT/PASS badges
    MatchScreen.js             # "It's a Match!" overlay + Schedule a call CTA
  screens/
    SwipeScreen.js             # Deck, swipe handling, match detection, tap controls
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

- Drag a card past the threshold (or tap âœ“ / âœ•) to swipe right/left.
- Swiping right on a profile where `likesYou: true` triggers the match screen.
- Demo profiles 1, 3, 5 will match; 2 and 4 will not.

## Match detection

Currently client-side against hardcoded `likesYou` flags. In production this becomes:
1. Swipe right â†’ POST to your backend.
2. Backend checks if the other user already swiped right on you.
3. If yes â†’ create a match record, push-notify both users.

## Next steps

- Profile creation / onboarding flow (the core required fields: commitment,
  primary skill, what-you're-looking-for, idea status, one open prompt).
- Real backend + auth (Supabase or Firebase are the fast paths).
- Push notifications (expo-notifications) for "It's a match!".
- Replace initials avatars with real photo uploads.