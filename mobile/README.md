# Circle40 mobile app

React Native + Expo (SDK 58, TypeScript) app for iOS and Android. Navigation uses Expo Router; screens live in `src/app/`.

## Run it on your phone

1. Install **Expo Go** from the App Store or Google Play.
2. In this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code: with the Camera app on iPhone, or from inside Expo Go on Android. Your phone and PC must be on the same Wi-Fi.

Press `w` in the terminal to open the web version instead.

## Checks

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint (expo lint)
npm test            # Jest unit tests for the store and helpers
```

## Where things are

| Path | What |
|---|---|
| `src/app/(tabs)/` | Plans, People, Chats and Me tabs |
| `src/app/plan/[id].tsx` | Plan details, who's going, group chat |
| `src/app/chat/[id].tsx` | One-to-one chat |
| `src/app/new-plan.tsx`, `src/app/report.tsx` | Post-a-plan and report/block screens (modals) |
| `src/constants/theme.ts` | Colors for light and dark mode, spacing and type |
| `src/components/` | Shared UI pieces |
| `src/data/` | Types, sample data, zustand store, helpers, tests |

## Light and dark mode

The app follows the phone's system setting (`userInterfaceStyle: "automatic"` in `app.json`). Every color comes from `Colors.light` / `Colors.dark` in `src/constants/theme.ts` through the `useTheme()` hook, so new screens get dark mode by using the shared components or `useTheme()`.

## Data

Milestone 1 runs on made-up sample data kept on the device (`src/data/sample.ts`). Milestone 2 connects Supabase using the schema in `../supabase/migrations/`.
