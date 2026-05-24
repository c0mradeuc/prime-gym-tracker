# GymTracker

A local-first gym workout tracker built with Expo + React Native. Plan routines, log sets in real time, and track 1RM progression and PRs across exercises — all data stays on-device.

## Purpose

GymTracker exists to solve a single problem: **logging a workout while you're actually doing it should be fast, and the data you log should turn into progress you can see**. Most fitness apps optimise for browsing exercises, social features, or paywalls; this one optimises for the 90 seconds between sets.

Concretely, the app is built around three jobs:

1. **Plan a session in under a minute.** Either pick muscle groups → exercises → set/rep scheme on the fly, or fire up a saved routine. The builder remembers what you picked last time and pre-fills sensible weights.
2. **Log sets with one thumb.** During training the active workout screen is the only screen you should need: tap to mark a set done, step weight/reps up or down, peek at last session's numbers as a ghost reference, and add exercises mid-workout if you change your mind.
3. **Turn logged sets into signal.** Every completed session feeds an Epley 1RM curve per exercise and a PR detector that watches three independent axes (top weight, single-set volume, and reps-at-or-above a given weight). The Dashboard and Exercise Detail screens surface those without you having to ask.

Design constraints that shape the codebase:

- **Local-first, no account.** Everything persists to `AsyncStorage`. There is no backend, no sync, no telemetry. Losing your phone loses your history — that's the trade for zero friction and zero subscription.
- **Single active session.** The app is opinionated: you train one workout at a time. The `workoutStore` holds exactly one `current` session or `null`.
- **Static exercise catalog.** Exercises are defined in code (`src/data/catalog.ts`), not user-editable. This keeps IDs stable for the stats pipeline and avoids a "manage your exercise library" rabbit hole.
- **Suggestions, not prescriptions.** The app suggests weights from your history (or bodyweight ratios as a cold-start fallback) but never blocks you from logging whatever you actually lifted.

## Features

- **Active workout logging** — start a session from scratch, from saved muscle groups, or from a routine; edit reps/weight per set; reorder exercises; add/remove exercises mid-session.
- **Routines** — save and reuse training templates with per-exercise schemes and starting weights.
- **Smart weight suggestions** — defaults to your last-used weight, falling back to a bodyweight-ratio estimate from the exercise catalog.
- **Stats & PRs** — Epley 1RM progression per exercise, plus automatic PR detection across three axes (weight, single-set volume, reps-at-or-above-weight).
- **History** — full session history with per-session detail view.
- **Profile settings** — name, age, height, and bodyweight; bodyweight feeds the cold-start weight estimates for bodyweight-ratio lifts (e.g. bench press).
- **English / Spanish** — full UI translation with a live toggle in Settings; defaults to Spanish on first launch. Dates localised via `date-fns`; units (kg/cm) intentionally not localised yet.
- **Offline-only** — state persists via `AsyncStorage`; no account, no network.

## Tech stack

- Expo SDK 54 (new architecture enabled) + React Native 0.81 + React 19
- TypeScript (strict)
- React Navigation (native stack)
- Zustand with `persist` middleware over `AsyncStorage`
- `i18next` + `react-i18next` for translation, English / Spanish bundles in `src/i18n/`
- `react-native-chart-kit` / `react-native-svg` for stats charts
- `react-native-draggable-flatlist` + `react-native-reanimated` for exercise reordering

## Getting started

```bash
npm install
npm start         # Expo dev server
npm run android   # or ios / web
```

### Quality checks

```bash
npm run typecheck    # tsc --noEmit
npm run check:i18n   # ensure every t() key resolves in both en.json and es.json
```

There is no test or lint script configured.

## Builds & releases (EAS)

EAS is configured in [`eas.json`](./eas.json) with three profiles. Production uses `appVersionSource: remote` + `autoIncrement: true`, so build numbers bump automatically.

| Profile        | Distribution | Purpose                                                |
| -------------- | ------------ | ------------------------------------------------------ |
| `development`  | Internal     | Dev-client APK (pairs with `expo start --dev-client`)  |
| `preview`      | Internal     | Installable APK / iOS link for testers                 |
| `production`   | Store        | AAB / IPA, store-ready                                 |

### Build a binary

```bash
npm run build:android            # production AAB
npm run build:ios                # production IPA
npm run build:preview:android    # internal APK
npm run build:preview:ios        # internal iOS install link

# dev client (one-off, no npm script):
npx eas-cli build --profile development --platform android
```

### Submit to the stores

```bash
npm run submit:android   # Play Store
npm run submit:ios       # App Store Connect
```

Store credentials must already be configured on the EAS side (Google service-account JSON / Apple App Store Connect API key).

### OTA updates (push JS-only changes)

`expo-updates` is wired with `runtimeVersion.policy: "appVersion"`, so an OTA reaches any installed client on the matching `appVersion`.

```bash
npm run ota          # production channel
npm run ota:preview  # preview channel
```

Use OTA only for JS / asset changes. **Any native or dependency change requires a full rebuild.**

### Useful EAS housekeeping

```bash
npx eas-cli login
npx eas-cli whoami
npx eas-cli build:list
npx eas-cli update:list
npx eas-cli credentials
```

## Project layout

```
App.tsx                 Navigation container + stack setup
src/
  navigation.ts         RootStackParamList (screen → params)
  theme.ts              colors / spacing / radius tokens
  types.ts              Domain types (Session, Exercise, Routine, PrRecord, …)
  data/catalog.ts       Static exercise catalog + scheme bundles
  store/                Zustand stores (see below)
  utils/                Domain logic (1RM, PR detection, weight suggestion)
  components/           Reusable UI primitives
  screens/              One file per navigator screen
```

## State model

Six stores, kept deliberately separate:

| Store           | Persisted | Purpose                                                                 |
| --------------- | --------- | ----------------------------------------------------------------------- |
| `workoutStore`  | yes       | The single active session being trained.                                |
| `historyStore`  | yes       | Append-only list of completed sessions.                                 |
| `statsStore`    | yes       | Derived 1RM history and PR records (idempotent via `processedSessionIds`). |
| `routineStore`  | yes       | Saved routine templates.                                                |
| `profileStore`  | yes       | User profile (name, age, height, bodyweight, language). `0` means "not set" for numbers; language defaults to `'es'`. |
| `draftStore`    | no        | In-memory scratch for the multi-screen builder flow.                    |

On `completeSession()`, `workoutStore` hands the finished session to `historyStore` and `statsStore`, then clears `current`. Prior-session state is captured before the new session is appended so PR detection sees only strictly-earlier sessions.

## Domain rules

- Only sets with `done === true` and `warmup !== true` count toward stats, 1RM, and PRs.
- 1RM uses Epley: `weight * (1 + reps / 30)`.
- A "reps PR" must beat the most reps ever performed at the current weight **or any heavier** weight.
- Bodyweight for cold-start weight suggestions comes from `profileStore`; if the user hasn't set it, `BODYWEIGHT_KG = 90` (in `src/utils/weight.ts`) is the fallback.
- Use `confirmAction` from `src/utils/confirm.ts` instead of `Alert.alert` directly — it falls back to `window.confirm` on web.

## License

Private project. No license granted.
