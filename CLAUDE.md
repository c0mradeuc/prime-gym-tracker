# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose of this app

GymTracker is a **local-first, offline-only gym workout tracker** for a single user. The product goal is to make in-gym logging fast (the user opens the app between sets, with one thumb, often sweaty) and to turn that logged data into a small set of progress signals — Epley 1RM curves and PR detection — without ever asking the user to configure anything.

Design invariants that should constrain the kind of changes you propose:

- **No backend, no auth, no sync, no telemetry.** All state lives in `AsyncStorage` on the device. Do not introduce network calls, accounts, or analytics without an explicit ask — they would break the product's core promise.
- **Single active session.** `workoutStore.current` is either one in-progress `Session` or `null`. The UI and data model assume this; do not generalise to "multiple drafts" without an explicit design change.
- **Static exercise catalog.** `src/data/catalog.ts` is the source of truth for exercises. Exercise `id` strings are persistence keys — renaming an id silently breaks every persisted store. Adding exercises is fine; renaming or removing existing ones is a migration.
- **Suggestions, not prescriptions.** Weight/rep suggestions are defaults the user can override on every set. Never gate logging behind validation that rejects "wrong" numbers.
- **The active workout screen is the hot path.** Latency, taps, and visual noise on `ActiveWorkoutScreen` matter more than anywhere else. Prefer making that screen simpler over adding features to it.

The three user-visible jobs the app is built around — plan a session, log sets, see progress — map roughly onto the screen groups: the builder flow (`SelectStartMode` → `SelectMuscleGroups` → `SelectExercises` → `ConfigureExercises`), the live trainer (`ActiveWorkoutScreen` + `AddExerciseToSession`), and the analytics surfaces (`Dashboard`, `History`, `SessionDetail`, `ExerciseList`, `ExerciseDetail`). `SettingsScreen` is the only screen outside that map — it owns the `profileStore`. When in doubt about where a change belongs, locate it on that map first.

## Commands

- `npm start` — Expo dev server (Metro)
- `npm run android` / `npm run ios` / `npm run web` — start on a specific target
- `npx tsc --noEmit` — type-check (no `lint`/`test` scripts are configured)

`react-native-reanimated/plugin` is loaded via `babel.config.js` and **must remain the last Babel plugin**. `metro.config.js` enables `unstable_enablePackageExports` with `['require', 'react-native']` condition names — needed for current dependency resolution; do not remove without checking that all native packages still resolve.

## Architecture

Expo + React Native (new architecture enabled, `app.json:newArchEnabled`) app for tracking gym workouts. Entry point is `index.ts` → `App.tsx`. Single native-stack navigator with screen params typed in `src/navigation.ts` — keep that union in sync when adding screens.

### State: five persisted Zustand stores + one in-memory draft

All persisted stores use `persist` + `AsyncStorage` with distinct keys (`gymtracker-*`). The split is deliberate — do not merge them:

- `workoutStore` — the **single active `Session`** being trained. Mutates `current` (sets/reps/weights/exercises). On `completeSession()` it hands the session to `historyStore.addSession` and `statsStore.processSession`, then clears `current`.
- `historyStore` — append-only list of completed `Session`s. Source of truth for past workouts.
- `statsStore` — derived data: `oneRmHistory` per exercise and `prs[]`. Kept idempotent via `processedSessionIds`. `backfillFromHistory` is a one-shot initialiser that only runs when `processedSessionIds` is empty.
- `routineStore` — saved `Routine`s (reusable templates).
- `profileStore` — user profile (`name`, `age`, `weight` in kg). `0` is the "not set" sentinel for the numeric fields. Read by `weight.ts` as the bodyweight input to cold-start weight suggestions.
- `draftStore` (**in-memory, no persist**) — shared scratch space across the multi-screen builder flow (`SelectMuscleGroups` → `SelectExercises` → `ConfigureExercises`). Caller must `reset()` when entering from Home and when finishing.

When completing a session, `workoutStore` reads `historyStore.sessions` **before** calling `addSession`, so the prior-session view passed to `statsStore.processSession` excludes the session being completed. Preserve that ordering — PR detection depends on it.

### Domain logic lives in `src/utils`, not in stores or screens

- `oneRm.ts` — Epley 1RM (`weight * (1 + reps/30)`), session top-1RM, primary-lift picker.
- `prDetection.ts` — three PR axes (weight, volume, reps). `detectPrsForSession` is the offline pass; `previewSetPr` is the live in-workout check. "Reps PR" requires beating the max reps ever done at this weight **or any heavier** weight.
- `weight.ts` — `suggestWeight` falls back through: last-used weight in history → bodyweight × ratio from `Exercise.bwRatio` → equipment-default (barbell 20 kg, else 5 kg). The `bodyweight` parameter defaults to `useProfileStore.getState().weight || BODYWEIGHT_KG` (90 kg). This is a deliberate store-read inside a util — it keeps the 5 call sites unchanged.
- `confirm.ts` — cross-platform confirm. **Use this instead of `Alert.alert` directly** — `Alert` does not work on web; `confirm.ts` falls back to `window.confirm`.

Warmup sets (`SetEntry.warmup`) and undone sets (`!set.done`) are excluded from every stats/PR computation.

### Catalog data

`src/data/catalog.ts` defines the static `EXERCISES` list with per-exercise `recommendedSchemes` and optional `bwRatio` (bodyweight-to-load curves for weight suggestion). Schemes are picked from named bundles (`COMPOUND_BARBELL`, `ACCESSORY`, etc.) — first entry is the default selection. Exercise IDs are stable strings used as keys throughout stores; renaming an ID breaks persisted data.

### Theming

`src/theme.ts` exports `colors`, `spacing`, `radius`. Dark theme is wired into React Navigation in `App.tsx` via a custom `Theme`. New screens should pull from these tokens, not hard-code values.

### Internationalization

The app ships English and Spanish, defaulting to **Spanish** on first launch. Language preference lives on `profileStore.language` and the active screen is `SettingsScreen`.

- Library: `i18next` + `react-i18next`. Initialised once in `src/i18n/index.ts` with `compatibilityJSON: 'v4'` plural rules and `fallbackLng: 'en'`.
- Translation bundles: `src/i18n/en.json` and `src/i18n/es.json`. Namespaces in current use: `nav`, `common`, `home`, `settings`, `builder`, `active`, `dashboard`, `history`, `session`, `exerciseList`, `exerciseDetail`, `routines`, `components`, `prType`, `category`, `muscle`, `scheme`, `exercise`, `equipment`, `units`.
- **Hard rule:** no new screen ships hard-coded user-visible strings. Every `<Text>` and dialog title goes through `t()`.
- App.tsx subscribes to `profileStore.language` and calls `i18n.changeLanguage` on change. The Stack.Navigator screen titles use `t('nav.*')` inside the component so changing the language re-renders headers.
- **Catalog data is keyed, not duplicated.** `src/data/catalog.ts` defines stable ids (`bench-press`, `quads`, `hyp_4x8`, etc.). Render sites call `t('exercise.<id>')`, `t('muscle.<id>')`, `t('scheme.<id>')`. The `name` field on `MuscleGroup` / `Exercise` is legacy English; do not use it in UI.
- **Set/rep schemes:** `SetRepScheme.labelKey` is the i18n key (e.g. `'hyp_4x8'`), not a displayable string. Always render via `t(\`scheme.\${s.labelKey}\`)`.
- **Dates** are formatted via `src/utils/format.ts` (`formatDate`, `formatRelative`), which wraps `date-fns` with the active `date-fns/locale` (`enUS` / `es`). Do not call `format()` from `date-fns` directly in screens.
- **Numbers and units are intentionally NOT localised yet.** kg/cm stay as kg/cm, `toLocaleString()` uses the device default. A units-toggle feature is planned; until then, do not introduce a `formatNumber` wrapper.
