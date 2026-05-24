# PRime — Vision Document

> Reach your prime. Track your personal records in every part of life.

---

## 1. The name carries the metaphor

**PR** is the gym word for *Personal Record*. **Prime** is the peak version of you. The app's name fuses both: a *PR* isn't just a heavier bench — it's the *best version of you* in any dimension of life, captured the moment you hit it.

Reaching your prime means reaching your full inner potential across the many dimensions of being human:

- Physical
- Mental
- Health
- Nutrition
- Rest
- Psychological
- Social
- (and others — learning, purpose, creativity…)

The gym tracker is the first vertical. The vision is broader.

---

## 2. The core insight

The thing the current app is actually good at — **detecting when you're at a new personal best, surfacing trends, not prescribing** — is a *general-purpose pattern*. Lifting is just where it's been applied first.

Every feature, in every dimension, asks the same three questions:

1. **Log it fast** — no friction on the hot path
2. **Detect when you've hit a new best** — the PR engine
3. **Show progress as a curve, not a verdict** — the 1RM trendline pattern

Same engine. Different inputs.

---

## 3. Dimensions, mapped to concrete trackables

The "one atomic action per dimension per day" constraint keeps this from turning into a 7-form daily journal:

| Dimension | Atomic log | PR it surfaces |
|---|---|---|
| **Physical** *(shipped)* | Sets, reps, weight | Heaviest, most volume, most reps |
| **Nutrition** | Protein hit Y/N + bodyweight | Longest protein-target streak |
| **Sleep / Rest** | Bedtime + wake time | Longest 7+hr streak, best weekly avg |
| **Mental** | Focus minutes (read/study/meditate) | Longest deep-work session |
| **Psychological** | Mood 1–5 + optional 1-line note | Longest stretch above mood threshold |
| **Social** | "Meaningful connection today?" Y/N | Best week, longest streak |
| **Health** | Bodyweight, resting HR, hydration taps | Stability windows, not just maxes |

Each is a single tap or single number — **never a form**.

---

## 4. The unifying UX

### Home becomes a "PRime dashboard"
One row per dimension showing today's status + current streak + this-week glance. Tap a row to drill into that dimension's detail screen, which mirrors the gym Dashboard pattern already built (week summary card, PR list, history, breakdowns).

> Same screen architecture, repeated 6 more times. The user only learns one mental model.

### A daily check-in flow
A 30-second swipeable card stack: Sleep? Mood? Protein? Connection? Each card is one tap. Skip cards you don't care about. **Streaks are per-dimension, not global** — missing one doesn't shame you on the others.

### A weekly review
Extends what the Dashboard already does for the gym. Monday morning summary across *all* dimensions:

> "You hit 4 sleep PRs this week. Volume is up 12%. Mood avg 4.2. You skipped social check-ins twice."

The current Dashboard is already ~90% of this — it just needs more inputs.

---

## 5. Invariants to preserve

The original product principles still hold — they actually get *stronger* in the broader vision:

- **Local-first, no backend, no auth, no sync, no telemetry** — even more important for mood/sleep/social data
- **Suggestions, not prescriptions** — same rule, applied across dimensions: don't gate, don't shame
- **Hot path matters most** — but now there are 7 hot paths, each must stay one-tap

---

## 6. The strategic tradeoff (the decision)

Three paths forward. Pick one before building.

### A. Vertical — stay deep
Stay a deep gym tracker; the "PRime" framing is just marketing copy. Add nutrition as a passive readout. Don't expand further.

- ✅ Keeps the niche, keeps the simplicity
- ✅ Competes on depth
- ❌ Leaves the bigger vision on the table

### B. Horizontal — go wide
Become a multi-domain life-PR tracker from day one. Build all dimensions in parallel.

- ✅ Bigger vision, bigger market
- ❌ Now competes with Apple Health, Streaks, Notion templates, Habitica
- ❌ Risk: 7 half-baked dimensions instead of 1 great one

### C. Pilot one adjacent dimension first *(recommended)*
The honest test of whether the metaphor scales: does anyone use a *second* tracker as much as the gym tracker?

- Pick the dimension closest to gym culture — **sleep** is the strongest candidate (low friction, two timestamps, hugely correlated with lifting performance, immediate motivation loop)
- Build *only* sleep. Live with it for a month.
- If you use it daily → build the next one
- If you don't → you've learned the metaphor was prettier than the product

---

## 7. Naming / language tweaks (free wins)

Small things, big perception shifts:

- Rebrand the **Dashboard** as **"Your Prime"** — single page, shows where you are across enabled dimensions
- The existing "PRs this week" line stays — it just isn't gym-exclusive anymore
- Rename **Settings → Profile** and put dimension toggles there (each dimension opt-in, stays simple for users who only want the gym)
- A subtle tagline somewhere in the app: *"Track your personal records in every part of life."*

---

## 8. Concrete first step: the Sleep pilot

If you want to test the vision *without* committing the full roadmap:

- Add a **Sleep** card to the existing Settings screen — one row, bedtime + wake time stepper
- Add a single tile to the Dashboard — `"Avg sleep this week: 7.4hr"`
- **~2 days of work**

Validation rule:
- Log sleep daily for 3 weeks → multi-dimension thesis is real → invest further
- Don't log it → delete ~200 lines and stay focused

This is the cheapest possible test of the whole vision.

---

## 9. Adjacent: nutrition readout (if pursuing path A or C)

A "Calorie target" card in Settings under the profile fields. **Passive readout, no food logging** — keeps the app from becoming a calorie tracker.

### What it shows
- **TMB** (Mifflin-St Jeor)
- **TDEE** (TMB × activity factor)
- **Target kcal** (with goal delta applied)
- **Macros split** (protein g/kg, fat g/kg, carbs by remainder)

### Profile fields to add
- `height` (cm)
- `sex` (`'male' | 'female'`)
- `goal` (`'cut' | 'maintain' | 'bulk'`)

Keep the `0`/`null` "not set" sentinel pattern.

### The on-brand trick: auto-derived activity factor
Instead of asking the user to pick "sedentary / light / moderate / intense", **derive it from training history**:

| Sessions / wk (last 4 wk) | Multiplier |
|---|---|
| 0–1 | 1.2 |
| 2 | 1.375 |
| 3–4 | 1.55 |
| 5+ | 1.725 |

The data is already there. Zero configuration. Stays true to the app's promise.

### Minimum viable version
Just the formula readout in Settings using existing weight + age, prompt the user to add height/sex once, assume "maintenance" goal and "moderate" activity. Single card. No goal toggle. No auto-derived multiplier. Ship in ~150 LOC.

---

## 10. Risks to watch

1. **Scope blowup** — building 7 dimensions = 7 half-baked features. Pilot one first.
2. **Daily fatigue** — multi-domain check-ins die fast. Streaks help but also cause guilt.
3. **Loss of niche product appeal** — "another life tracker" competes with crowded markets.
4. **Hot-path corruption** — if Home becomes a 7-dimension dashboard, "start workout" must *still* be one tap.

---

## 11. Reference: how to calculate maintenance calories

### Step 1 — TMB (Basal Metabolic Rate), Mifflin–St Jeor
- **Men:** `10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5`
- **Women:** `10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161`

### Step 2 — TDEE (Total Daily Energy Expenditure) = TMB × activity factor

| Level | Factor | Description |
|---|---|---|
| Sedentary | 1.2 | Desk job, no exercise |
| Light | 1.375 | 1–3 workouts / week |
| Moderate | 1.55 | 3–5 workouts / week |
| Intense | 1.725 | 6–7 workouts / week |
| Very intense | 1.9 | 2-a-days or physical labor |

### Step 3 — Adjust for goal
- **Maintain:** TDEE
- **Cut fat:** TDEE − 300 to 500 kcal (≈ 0.5 kg/week)
- **Build muscle:** TDEE + 200 to 400 kcal (slight surplus)

### Typical macros split
- **Protein:** 1.6–2.2 g/kg of bodyweight (critical for strength training)
- **Fat:** 0.8–1.2 g/kg
- **Carbs:** the remainder of the calorie budget

### Worked example
Man, 30 yo, 80 kg, 178 cm, trains 4×/week:
- TMB = 10·80 + 6.25·178 − 5·30 + 5 = **1,768 kcal**
- TDEE = 1,768 × 1.55 ≈ **2,740 kcal/day** (maintenance)
- Cut: ~2,300 kcal · Bulk: ~3,000 kcal

> All estimates — re-check every 2–3 weeks against actual weight and performance trends.

---

## 12. Decision needed

To unblock the next step, pick one:

- [ ] **Path A** — stay vertical, ship nutrition readout, hold off on multi-dimension
- [ ] **Path B** — commit to horizontal, plan all dimensions
- [ ] **Path C** *(recommended)* — ship the sleep pilot first, decide based on usage
