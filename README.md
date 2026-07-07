# Klyk — Expo App

An **opportunity engine** for college students and new grads: set your 90-day
goal and Klyk matches you with the people, jobs, and local pros who move it
forward. "LinkedIn meets Tinder," built with React Native + Expo and native
gesture physics (Reanimated + Gesture Handler), backed by Supabase.

## Features

- **Goal-first onboarding** — the first question is your 90-day goal; everything
  is matched against it
- **Discover** — swipe on people and jobs, ranked by fit, with match % and
  "why you matched" highlights; filters (states, commute, pay, role); Passed
  list with bring-back
- **Real accounts & matching** — Supabase auth, cloud profiles, mutual-interest
  connections (server-side trigger)
- **Messages** — realtime chat with previews, unread badges, AI conversation
  starters, and in-chat scheduling (propose times → confirm → add to Google
  Calendar)
- **This Week** — weekly introduction guarantee, streaks + daily goals, and a
  daily Top 5 companies ranked by peer reviews + your skills
- **Hire** — post a need, get matched with local pros
- **Theming** — light (LinkedIn-style, default) and dark modes, 5 accent colors
- Custom toasts/bottom sheets, skeleton loaders, generated app icon + splash

## Run it

```bash
npm install
npx expo start          # add --tunnel if your phone isn't on the same Wi-Fi
```

Scan the QR with **Expo Go** (iOS/Android).

## Backend setup (Supabase)

Run these once in the Supabase SQL Editor (in order):

1. `supabase/schema.sql` — profiles, swipes, matches, intro requests, RLS,
   auto-match + auto-profile triggers
2. `supabase/messages.sql` — chat messages + realtime
3. `supabase/education.sql` — school / status / grad year columns
4. `supabase/meetings.sql` — scheduling proposals + realtime
5. `supabase/waitlist.sql` — landing-page waitlist capture

Client credentials live in `src/lib/supabaseConfig.js` (public keys; RLS does
the protection). `PERSIST_SESSION` there toggles stay-logged-in (off for
testing, turn on for release).

## Website

`website/index.html` is the self-contained landing page + waitlist (deploy the
`website` folder to Netlify/Vercel).

## Still demo / local

Jobs, companies, and Hire providers are demo data; intro/quote "requests" are
stored locally. Next big steps: push notifications, employer accounts, TestFlight.
