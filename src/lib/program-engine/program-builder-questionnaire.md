# Program Builder — Intake Questionnaire System

## Document Purpose

This defines every question the program builder engine needs to generate a well-structured training program. Designed from the perspective of a coach running a 30-minute client intake — every question earns its place by directly changing the program output.

---

## Path Architecture

### Path 1 — Quick ("Just give me something")
**Questions needed:** 5 from Steps 1-3 (marked with ⚡)
**Time to complete:** ~30 seconds
**Defaults applied:** Intermediate experience, full gym, 60 min sessions, mixed equipment preference, no injuries, no competition, auto split

### Path 2 — Guided (Full questionnaire)
**Questions needed:** All required questions + conditionally shown questions
**Time to complete:** 3-5 minutes
**Steps:** 9 screens, 2-4 questions each

### Path 3 — Preset + Modify
**Questions needed:** Pick a template, then any Path 2 question can be edited
**Time to complete:** ~1 minute

---

## Step 1: What's the Goal?

### Q1.1 — Primary Goal ⚡
> "What are you training for?"

| Field | Value |
|-------|-------|
| **Type** | Single select (large cards) |
| **Required** | Yes |
| **Conditional** | No — always shown |
| **Quick Path** | ⚡ Yes |

**Options:**
| Option | Label | Description |
|--------|-------|-------------|
| `strength` | Get Stronger | Increase how much you can lift |
| `hypertrophy` | Build Muscle | Maximize muscle size |
| `fat_loss` | Lose Fat | Drop body fat while keeping muscle |
| `recomp` | Recomp | Build muscle and lose fat simultaneously |
| `general` | General Fitness | Balanced health, strength, and conditioning |
| `powerlifting` | Powerlifting | Compete or peak for squat/bench/deadlift |
| `physique` | Physique Competition | Bodybuilding, classic physique, bikini, figure, etc. |
| `athletic` | Sport / Athletic | Improve performance for a specific sport |

**Why it matters:** This is the single most important variable. It determines block structure, volume distribution, exercise priority, rep ranges, progression model, and whether peaking phases exist.

**Programming map:**
- `strength` → compound-heavy, lower rep ranges (3-6), longer rest, linear/wave progression
- `hypertrophy` → higher volume, moderate reps (6-12), shorter rest, double progression, isolation emphasis
- `fat_loss` → maintain intensity, reduce volume slightly, favor compound movements for caloric burn, superset-friendly
- `recomp` → moderate everything, calorie-cycling awareness, can't push volume as hard as a bulk
- `general` → balanced across movement patterns, moderate volume/intensity, include conditioning
- `powerlifting` → SBD-focused periodization, competition peaking, specificity principle
- `physique` → muscle-group balanced, weak point emphasis, posing/conditioning phase, peak week
- `athletic` → sport-specific movement patterns, power/explosiveness, injury prevention

---

### Q1.2 — Secondary Goal
> "Anything else you want to work toward alongside that?"

| Field | Value |
|-------|-------|
| **Type** | Single select (same options minus primary, plus "None") |
| **Required** | No |
| **Default** | None |
| **Conditional** | No |
| **Quick Path** | No |

**Why it matters:** A secondary goal adjusts volume allocation. Someone who wants strength but also cares about hypertrophy gets more accessory work than a pure strength client. Someone training for a physique show who also wants to stay strong keeps heavier compound work in the program.

**Programming map:** Secondary goal shifts ~20-30% of volume allocation toward its training style. Example: primary `strength` + secondary `hypertrophy` → compounds at 3-5 reps but 2-3 isolation movements per session at 8-12 reps.

---

### Q1.3 — Competition Division
> "Which division?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | Yes (when shown) |
| **Conditional** | Only if Q1.1 = `physique` |
| **Quick Path** | No |

**Options:**
| Option | Notes |
|--------|-------|
| `bodybuilding` | Maximum muscle mass, symmetry, conditioning |
| `classic_physique` | Size within weight/height caps, aesthetic V-taper |
| `mens_physique` | Upper body dominant, no leg posing (but still train legs) |
| `bikini` | Glutes/shoulders/overall shape emphasis, lean not shredded |
| `figure` | Balanced muscularity, more muscle than bikini, less than bodybuilding |
| `wellness` | Glutes/legs emphasis, proportional upper body |

**Why it matters:** Completely changes muscle priority and volume allocation.

**Programming map:**
- `bodybuilding` → highest overall volume, all muscle groups hit hard, weak point specialization
- `classic_physique` → V-taper emphasis (shoulders, back width, small waist), moderate legs
- `mens_physique` → shoulders, back, arms, chest priority; legs present but not dominant volume
- `bikini` → glutes 4-5x/week, shoulders 3x/week, moderate everything else, LISS cardio emphasis
- `figure` → balanced with slight shoulder/back emphasis, moderate conditioning
- `wellness` → glutes/quads/hams highest priority, upper body supporting

---

### Q1.4 — Competition Date
> "When's the show / meet?"

| Field | Value |
|-------|-------|
| **Type** | Date picker |
| **Required** | No (even for competitors — they may not have a date yet) |
| **Default** | null (engine builds general off-season/prep structure) |
| **Conditional** | Only if Q1.1 = `powerlifting` or `physique` |
| **Quick Path** | No |

**Why it matters:** Determines the entire periodization timeline. Everything works backward from competition date.

**Programming map:**
- **Powerlifting with date:** Weeks out → block phases. 16+ weeks = full accumulation→intensification→peaking. 8 weeks = abbreviated peaking cycle. <6 weeks = intensification→peak only.
- **Physique with date:** Weeks out → prep phases. 16+ weeks = off-season hypertrophy → prep (caloric deficit + maintain volume) → peak week. 12 weeks = straight into prep. <8 weeks = aggressive cut + volume maintenance.
- **No date:** Build general improvement blocks (4-week cycles with deloads).

---

### Q1.5 — Sport
> "What sport?"

| Field | Value |
|-------|-------|
| **Type** | Searchable dropdown / free text |
| **Required** | Yes (when shown) |
| **Conditional** | Only if Q1.1 = `athletic` |
| **Quick Path** | No |

**Common options:** Football, Basketball, Soccer, Baseball, Hockey, Tennis, Swimming, MMA/Combat, CrossFit, Running (sprints), Running (distance), Cycling, Rugby, Volleyball, Golf, Other

**Why it matters:** Sport determines movement pattern priority, power vs. endurance bias, injury prevention focus, and in-season vs. off-season periodization.

**Programming map:**
- Collision sports (football, rugby, hockey) → posterior chain strength, neck work, power/explosiveness
- Rotational sports (baseball, golf, tennis) → anti-rotation core, unilateral work, shoulder health
- Endurance (running, cycling, swimming) → lower volume lifting, maintain strength, avoid excessive leg fatigue
- Combat sports → grip, neck, rotational power, conditioning, weight management
- Court sports (basketball, volleyball) → plyometrics, lateral movement, vertical jump
- CrossFit → GPP, Olympic lift technique, metabolic conditioning

---

## Step 2: Your Schedule

### Q2.1 — Training Days Per Week ⚡
> "How many days per week can you train?"

| Field | Value |
|-------|-------|
| **Type** | Slider or button group: 2-3-4-5-6 |
| **Required** | Yes |
| **Conditional** | No |
| **Quick Path** | ⚡ Yes |

**Why it matters:** Directly determines split type, volume per session, and weekly frequency per muscle group.

**Programming map:**
- 2 days → Full body or upper/lower. Each session is longer and more dense.
- 3 days → Full body, PPL, or upper/lower + 1. Sweet spot for most general population.
- 4 days → Upper/lower x2 or PPL + 1. Most popular intermediate setup.
- 5 days → PPL + upper/lower, or 5-day bro. High frequency options open up.
- 6 days → PPL x2 or Arnold split. High volume, needs good recovery.

---

### Q2.2 — Which Days?
> "Which days work best?"

| Field | Value |
|-------|-------|
| **Type** | Multi-select: Mon / Tue / Wed / Thu / Fri / Sat / Sun |
| **Required** | No |
| **Default** | Engine distributes evenly (e.g., 4 days → Mon/Tue/Thu/Fri) |
| **Conditional** | No |
| **Quick Path** | No |

**Why it matters:** Determines rest day placement, which affects recovery between sessions. Back-to-back days change which splits are viable (can't do legs Monday and legs Tuesday).

**Programming map:**
- Consecutive training days → split must alternate muscle groups (PPL works, full body x2 doesn't)
- Days with gaps → full body viable, repeated muscle groups OK
- Weekend-only → likely 2-day full body, higher volume per session

---

### Q2.3 — Time Per Session ⚡
> "How long can you spend per session?"

| Field | Value |
|-------|-------|
| **Type** | Button group: 30 / 45 / 60 / 75 / 90 min |
| **Required** | Yes |
| **Default** | 60 min |
| **Conditional** | No |
| **Quick Path** | ⚡ Yes |

**Why it matters:** Caps the number of exercises per session. A coach doesn't program 10 exercises for someone with 45 minutes.

**Programming map:** See Session Time Budget table in engine spec. Also affects rest periods: shorter sessions → encourage supersets and shorter rest. Longer sessions → straight sets with full rest for compounds.

---

## Step 3: Your Background

### Q3.1 — Training Experience ⚡
> "How long have you been training consistently?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | Yes |
| **Conditional** | No |
| **Quick Path** | ⚡ Yes |

**Options:**
| Option | Label | Description |
|--------|-------|-------------|
| `beginner` | Less than 1 year | New to structured training or returning after a long break |
| `intermediate` | 1-3 years | Consistent training, knows the basics, progress has started slowing |
| `advanced` | 3+ years | Experienced lifter, progress requires more planning |
| `elite` | 5+ years competitive | Competing or near genetic potential |

**Why it matters:** Determines progression model, volume tolerance, exercise complexity, and how aggressive periodization should be.

**Programming map:**
- `beginner` → linear progression (add weight each session), lower total volume (can grow on less stimulus), simpler exercise selection (master compounds first), every set is effective volume
- `intermediate` → double progression or weekly linear, moderate volume, more exercise variety, autoregulation (RPE) starts mattering
- `advanced` → wave/percentage-based progression, higher volume needed, advanced techniques (clusters, drop sets, myo-reps), periodization is essential
- `elite` → highly individualized, percentage-based, block periodization mandatory, advanced peaking protocols

---

### Q3.2 — Current Training
> "What does your training look like right now?"

| Field | Value |
|-------|-------|
| **Type** | Multi-select |
| **Required** | No |
| **Default** | Based on goal (e.g., `strength` → assume `lifting`) |
| **Conditional** | No |
| **Quick Path** | No |

**Options:** Lifting (barbells/dumbbells), Machine-based training, Bodyweight/calisthenics, CrossFit, Group classes, Running/cycling, Sports practice, Yoga/mobility, Nothing right now

**Why it matters:** Starting point calibration. Someone coming from CrossFit has conditioning but may lack hypertrophy-specific volume. Someone coming from machines needs a ramp-up period for free weights. Someone from "nothing" needs a conservative starting volume.

**Programming map:**
- Coming from nothing → start at ~60% of target volume, longer ramp-up block (2-3 weeks before full program)
- Coming from machines → gradual barbell introduction, technique emphasis
- Coming from CrossFit → already conditioned, can handle volume, may need deload from existing workload
- Coming from bodyweight → can handle relative strength movements, start lighter on loaded exercises

---

### Q3.3 — Split Preference ⚡
> "Do you have a preferred training split?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | Yes |
| **Default** | `auto` |
| **Conditional** | No |
| **Quick Path** | ⚡ Yes (as `auto` default — quick path skips this and lets engine decide) |

**Options:**
| Option | Label |
|--------|-------|
| `auto` | Recommend one for me |
| `full_body` | Full Body |
| `upper_lower` | Upper / Lower |
| `push_pull_legs` | Push / Pull / Legs |
| `push_pull` | Push / Pull (legs distributed) |
| `bro_split` | Body Part Split |
| `powerlifting` | Squat / Bench / Deadlift days |

**Why it matters:** Some people have strong preferences and will abandon a program that doesn't match how they like to train. The engine suggests but doesn't force.

**Programming map:** Engine ranks splits by suitability (frequency × goal × experience) but accepts any user choice. Warnings are advisory only. See Split Resolution rules in engine spec.

---

## Step 4: Equipment & Environment

### Q4.1 — Training Environment
> "Where do you train?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | Yes |
| **Default** | `full_gym` |
| **Conditional** | No |
| **Quick Path** | No (default assumed) |

**Options:**
| Option | Label | What's available |
|--------|-------|-----------------|
| `full_gym` | Full commercial gym | Everything — barbells, dumbbells, cables, machines |
| `barbell_home` | Home gym (barbell setup) | Rack, barbell, bench, dumbbells, maybe a cable |
| `dumbbell_only` | Dumbbells only | Adjustable or fixed dumbbells, bench |
| `home_minimal` | Minimal home setup | Light dumbbells, bands, bodyweight |
| `bodyweight` | Bodyweight only | No equipment |

**Why it matters:** Filters the entire exercise library. Can't program barbell squats for someone with dumbbells only. Also affects progression strategy (barbell allows smaller increments than dumbbells).

**Programming map:**
- `full_gym` → full exercise library, optimal exercise selection
- `barbell_home` → barbell compounds + dumbbell accessories, limited isolation options
- `dumbbell_only` → dumbbell compounds (goblet squat, DB bench), all dumbbell isolations
- `home_minimal` → band-assisted movements, bodyweight progressions, DB work
- `bodyweight` → calisthenics progressions, high-rep focus, creative loading (tempo, pauses)

---

### Q4.2 — Equipment Preference
> "Any preference for how you lift?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | No |
| **Default** | `mixed` |
| **Conditional** | Hidden if Q4.1 = `bodyweight` |
| **Quick Path** | No |

**Options:** Barbell-focused, Dumbbell-focused, Machine-focused, Mixed (no preference)

**Why it matters:** Two people with the same goal and same gym can get very different programs based on preference. Someone who hates machines will abandon a machine-heavy program.

**Programming map:** Affects exercise ranking within each category slot. `barbell` boosts barbell exercises to primary position. `machine` boosts machine exercises. `mixed` uses the engine's default ranking (compounds → barbell, isolations → cable/machine).

---

## Step 5: Recovery & Lifestyle

### Q5.1 — Sleep Quality
> "How's your sleep?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | No |
| **Default** | `good` |
| **Conditional** | No |
| **Quick Path** | No |

**Options:**
| Option | Label | Hours implied |
|--------|-------|---------------|
| `poor` | Poor — under 5-6 hours, inconsistent | <6h |
| `fair` | Fair — 6-7 hours, some disruption | 6-7h |
| `good` | Good — 7-8 hours, mostly consistent | 7-8h |
| `great` | Great — 8+ hours, very consistent | 8+h |

**Why it matters:** Sleep is the #1 recovery variable. Poor sleep = lower volume tolerance, higher injury risk, worse strength output. A coach doesn't program the same volume for someone sleeping 5 hours as someone sleeping 8.

**Programming map:**
- `poor` → reduce total volume by ~20%, add extra deload frequency (every 3 weeks instead of 4), lower RPE caps
- `fair` → reduce volume by ~10%, standard deload frequency
- `good` → standard volume and progression
- `great` → can handle upper-end volume ranges, longer blocks before deload

---

### Q5.2 — Stress & Recovery
> "How demanding is life outside the gym right now?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | No |
| **Default** | `moderate` |
| **Conditional** | No |
| **Quick Path** | No |

**Options:**
| Option | Label |
|--------|-------|
| `low` | Low — flexible schedule, low stress |
| `moderate` | Moderate — normal job, some stress |
| `high` | High — demanding job, long hours, or major life stressors |
| `physical` | Physically demanding — manual labor, active job, on my feet all day |

**Why it matters:** Allostatic load is cumulative. High life stress + high training stress = burnout and injury. A physically demanding job is essentially extra training volume the body has to recover from.

**Programming map:**
- `low` → full volume, aggressive progression
- `moderate` → standard volume and progression
- `high` → reduce volume ~15%, prioritize compounds (more bang for buck), avoid excessive training density (supersets create more fatigue)
- `physical` → reduce lower body volume, reduce overall volume ~15-20%, favor less CNS-taxing exercises, avoid heavy deadlifts on work days if possible

---

### Q5.3 — Nutrition Context
> "How are you eating relative to your goals?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | No |
| **Default** | Inferred from goal (fat_loss → deficit, hypertrophy → surplus, etc.) |
| **Conditional** | No |
| **Quick Path** | No |

**Options:**
| Option | Label |
|--------|-------|
| `surplus` | Caloric surplus (gaining weight intentionally) |
| `maintenance` | Eating at maintenance |
| `mild_deficit` | Mild deficit (losing ~0.5-1 lb/week) |
| `aggressive_deficit` | Aggressive deficit (losing ~1-2 lb/week) |
| `not_tracking` | Not tracking / don't know |

**Why it matters:** Nutrition dictates recovery capacity and volume tolerance. You cannot train the same in a deficit as in a surplus — recovery is compromised, fatigue accumulates faster, and injury risk goes up.

**Programming map:**
- `surplus` → highest volume tolerance, most aggressive progression, can push training hard
- `maintenance` → standard volume, normal progression
- `mild_deficit` → reduce volume by ~10-15%, maintain intensity (keep weights heavy, reduce sets), prioritize compounds
- `aggressive_deficit` → reduce volume by ~20-25%, maintain intensity, cut accessories first, shorter sessions preferred, extra deloads
- `not_tracking` → use goal-based default (fat_loss assumes mild deficit, etc.)

---

## Step 6: Injuries & Limitations

### Q6.1 — Current Injuries
> "Any injuries or pain I should know about?"

| Field | Value |
|-------|-------|
| **Type** | Multi-select (body part tap targets on a body diagram, or pill list) |
| **Required** | No |
| **Default** | None |
| **Conditional** | No |
| **Quick Path** | No |

**Options:** Neck, Shoulder (L/R), Elbow (L/R), Wrist (L/R), Upper back, Lower back, Hip (L/R), Knee (L/R), Ankle (L/R), None

**Why it matters:** Injuries exclude specific exercises and movement patterns. A shoulder injury removes most overhead pressing. A lower back issue substitutes belt squat for back squat, avoids heavy deadlifts.

**Programming map:**
- Shoulder → remove overhead press, limit horizontal press ROM, substitute machine press, add extra rotator cuff work
- Lower back → remove conventional deadlift, substitute trap bar or RDL, avoid heavy axial loading, belt squat over back squat
- Knee → remove deep squats, substitute leg press (partial ROM), avoid lunges if painful, add terminal knee extensions
- Each selected body part filters the exercise library for that region

---

### Q6.2 — Movement Limitations
> "Any movements you struggle with or have limited range of motion?"

| Field | Value |
|-------|-------|
| **Type** | Multi-select |
| **Required** | No |
| **Default** | None |
| **Conditional** | No |
| **Quick Path** | No |

**Options:**
| Option | Label | What it means |
|--------|-------|---------------|
| `overhead` | Can't press overhead comfortably | Thoracic/shoulder mobility limitation |
| `deep_squat` | Can't squat to depth | Ankle/hip mobility limitation |
| `hip_hinge` | Trouble with deadlift/RDL position | Hamstring/hip mobility limitation |
| `grip` | Grip gives out before target muscles | Grip strength limitation |
| `balance` | Unilateral/single-leg work is shaky | Stability/proprioception limitation |
| `none` | No issues | Full ROM available |

**Why it matters:** Different from injuries — these are movement quality issues that change exercise selection and may add corrective work. Someone who can't squat to depth might get goblet squats and ankle mobility work rather than jumping straight to barbell back squats.

**Programming map:**
- `overhead` → landmine press instead of OHP, incline press emphasis, add shoulder mobility to warm-up
- `deep_squat` → box squat, goblet squat (to available depth), leg press, add ankle/hip mobility
- `hip_hinge` → trap bar deadlift, rack pulls, add RDL with light weight as mobility builder
- `grip` → add straps note on heavy pulls, include grip work as accessory
- `balance` → supported unilateral (Bulgarian split squat with rack) before unsupported, tempo work

---

## Step 7: Training Preferences

### Q7.1 — Training Style Preferences
> "What keeps you motivated in the gym?"

| Field | Value |
|-------|-------|
| **Type** | Multi-select (pick up to 3) |
| **Required** | No |
| **Default** | Engine decides based on goal |
| **Conditional** | No |
| **Quick Path** | No |

**Options:**
| Option | Label | Programming impact |
|--------|-------|--------------------|
| `heavy_compounds` | Lifting heavy on big lifts | Prioritize compound intensity, lower rep compounds |
| `pump` | Chasing the pump | Include isolation work, higher reps, supersets |
| `variety` | Lots of exercise variety | Rotate exercises across weeks/blocks |
| `efficiency` | Get in and get out | Supersets, circuits, minimal rest, fewer exercises |
| `structure` | Clear plan, know exactly what to do | Strict percentages, defined progression, no autoregulation |
| `flexibility` | Room to improvise | RPE-based, exercise swaps available, loose structure |
| `progress_tracking` | Seeing numbers go up | Emphasis on measurable progression, PR tracking |

**Why it matters:** Adherence is everything. A perfect program the client hates is worse than a good program they love. These preferences modify the *style* of programming without changing its effectiveness.

**Programming map:**
- `heavy_compounds` → straight sets, 3-5 min rest, RPE 8-9 on main lifts
- `pump` → add drop sets, supersets, higher rep ranges on isolations (15-20)
- `variety` → rotate 2-3 exercises per slot across mesocycles, avoid same exercise more than 4 weeks
- `efficiency` → superset antagonist pairs, reduce rest to 60-90s where possible, trim accessories
- `structure` → percentage-based progression, explicit weight/rep prescriptions
- `flexibility` → RPE-based, wider rep ranges ("6-10" instead of "8"), multiple alternative exercises per slot
- `progress_tracking` → linear or double progression (clear "did I improve?" signals), regular test sets

---

### Q7.2 — Exercises to Avoid
> "Any exercises you hate or want to skip?"

| Field | Value |
|-------|-------|
| **Type** | Searchable multi-select (from exercise library) |
| **Required** | No |
| **Default** | Empty |
| **Conditional** | No |
| **Quick Path** | No |

**Why it matters:** Some people will never do barbell back squats. Some hate lunges. Forcing exercises they'll skip defeats the purpose. Better to program a substitution they'll actually do.

**Programming map:** Excluded exercises are removed from the selection pool. If a core compound is excluded (e.g., barbell bench press), the engine picks the next-ranked exercise in the same category (e.g., dumbbell bench press).

---

### Q7.3 — Include Non-Lifting Modalities
> "Should we add anything beyond lifting?"

| Field | Value |
|-------|-------|
| **Type** | Multi-select |
| **Required** | No |
| **Default** | Based on goal (fat_loss adds LISS, general adds stretch) |
| **Conditional** | No |
| **Quick Path** | No |

**Options:**
| Option | Label |
|--------|-------|
| `stretch` | Stretch / Mobility routines |
| `hiit` | HIIT / Conditioning |
| `liss` | Steady-state cardio (walking, cycling, incline treadmill) |
| `none` | Lifting only |

**Why it matters:** A "program" isn't just weights. Fat loss clients need cardio guidance. Physique competitors need LISS periodization. General fitness clients benefit from mobility work.

**Programming map:** See Non-Lifting Modalities section in engine spec. HIIT never on consecutive days or before heavy leg day. LISS can be post-lifting or separate. Stretch links to StretchRoutine system.

---

## Step 8: Benchmarks & Starting Point

### Q8.1 — Current Maxes
> "Do you know your current numbers on any of these lifts?"

| Field | Value |
|-------|-------|
| **Type** | Optional number inputs (weight + reps) for each lift |
| **Required** | No |
| **Default** | null (engine uses RPE-based progression without starting weights) |
| **Conditional** | No, but most relevant for `strength`, `powerlifting` |
| **Quick Path** | No |

**Lifts to collect (all optional):**
- Squat (weight × reps)
- Bench Press (weight × reps)
- Deadlift (weight × reps)
- Overhead Press (weight × reps)
- Barbell Row (weight × reps)

**Why it matters:** If we know current maxes, we can calculate estimated 1RMs and program percentages. Without them, the program uses RPE-only (which still works, just less precise for first block).

**Programming map:**
- With maxes → Epley formula for e1RM → percentages for working sets (e.g., "Week 1: 4x5 @ 75% 1RM")
- Without maxes → RPE-based ("4x5 @ RPE 7, add weight when RPE drops below 7")
- For `powerlifting` and `strength`, having these is much more valuable than for `hypertrophy`/`general`

---

### Q8.2 — Body Weight
> "Current body weight?"

| Field | Value |
|-------|-------|
| **Type** | Number input (lbs/kg toggle) |
| **Required** | No |
| **Default** | null |
| **Conditional** | No |
| **Quick Path** | No |

**Why it matters:** Needed for bodyweight relative strength calculations, Wilks/DOTS scoring for powerlifting, and weight class targeting. Also used for nutrition target calculations.

**Programming map:**
- For `powerlifting` → determines weight class, informs whether to cut/bulk before meet
- For `physique` → baseline for prep planning
- For `fat_loss` → baseline for target setting (weight loss metric targets)
- For nutrition → base for calorie/macro calculation if nutrition module is used

---

## Step 9: Physique-Specific (Conditional)

> *This entire step only appears if Q1.1 = `physique`*

### Q9.1 — Weak Points / Priority Muscle Groups
> "Which muscle groups do you want to bring up?"

| Field | Value |
|-------|-------|
| **Type** | Multi-select (pick up to 3) |
| **Required** | No |
| **Default** | Inferred from division (Q1.3) |
| **Conditional** | Only if Q1.1 = `physique` |
| **Quick Path** | No |

**Options:** Chest, Back Width (lats), Back Thickness (traps/rhomboids), Shoulders (side delts), Shoulders (rear delts), Arms (biceps), Arms (triceps), Quads, Hamstrings, Glutes, Calves, Abs

**Why it matters:** Physique is about proportions, not just size. A bodybuilder with great arms but lagging shoulders needs 20+ sets/week of shoulder work, not 10. Weak points get priority in exercise order and volume allocation.

**Programming map:**
- Selected weak points get +30-50% volume above baseline for that muscle group
- Weak points are trained earlier in sessions (when fresh) or given their own priority day
- Weak points get more exercise variety (hit from multiple angles)
- Example: weak points = [shoulders, glutes] → side lateral raises appear 3-4x/week, hip thrusts programmed heavy + high-rep across different days

---

### Q9.2 — Prep Phase
> "Where are you in your prep?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | Yes (when shown) |
| **Conditional** | Only if Q1.1 = `physique` |
| **Quick Path** | No |

**Options:**
| Option | Label | Programming impact |
|--------|-------|--------------------|
| `offseason` | Off-season (building) | Max volume, caloric surplus, progressive overload focus |
| `early_prep` | Early prep (12+ weeks out) | Begin deficit, maintain volume, start cardio |
| `mid_prep` | Mid prep (6-12 weeks out) | Moderate deficit, reduce volume slightly, increase cardio |
| `late_prep` | Late prep (<6 weeks out) | Aggressive deficit, maintain intensity/reduce volume, peak week considerations |
| `maintenance` | Between shows (maintaining) | Maintenance calories, moderate volume, no peaking |

**Why it matters:** The prep phase changes literally everything — volume, intensity, cardio, deload frequency, exercise selection (less complex movements late in prep when fatigued).

**Programming map:**
- `offseason` → highest volume, surplus assumption, train hard, push PRs on compounds
- `early_prep` → volume stays high, add 2-3x/week LISS (20-30 min), slight intensity reduction on isolations
- `mid_prep` → reduce volume by ~15%, increase LISS (4-5x/week, 30-45 min), maintain compound intensity, drop advanced techniques (too fatiguing)
- `late_prep` → reduce volume by ~25-30%, maintenance intensity on compounds, LISS 5-6x/week (45-60 min), simplify exercise selection (machines > free weights for safety when fatigued)
- `maintenance` → standard volume, no cardio ramp, steady state

---

### Q9.3 — Posing Practice
> "Do you want posing practice scheduled?"

| Field | Value |
|-------|-------|
| **Type** | Single select: Yes (add to program) / No |
| **Required** | No |
| **Default** | Yes if mid_prep or later |
| **Conditional** | Only if Q1.1 = `physique` |
| **Quick Path** | No |

**Why it matters:** Posing is a skill that needs practice, and it's genuinely fatiguing (especially mandatory poses held for 60+ seconds). Scheduling it prevents it from being forgotten and accounts for the fatigue.

**Programming map:** Adds 2-3x/week posing sessions (15-20 min) as activity blocks. In late prep, increases to daily. Tagged as a separate modality so it shows on the calendar.

---

## Step 10: Powerlifting-Specific (Conditional)

> *This entire step only appears if Q1.1 = `powerlifting`*

### Q10.1 — Weakest Lift
> "Which lift needs the most work?"

| Field | Value |
|-------|-------|
| **Type** | Single select |
| **Required** | No |
| **Default** | null (balanced programming) |
| **Conditional** | Only if Q1.1 = `powerlifting` |
| **Quick Path** | No |

**Options:** Squat, Bench, Deadlift, All roughly equal

**Why it matters:** The weakest lift gets extra frequency and volume — possibly an extra day or extra variation work.

**Programming map:**
- Weakest lift gets a second session per week (lighter variation day)
- Example: weak squat → Squat Day (heavy) + Upper day that starts with front squats or pause squats
- Extra accessory volume targeting the sticking point muscles

---

### Q10.2 — Sticking Points
> "Where do you miss lifts?"

| Field | Value |
|-------|-------|
| **Type** | Multi-select (per lift) |
| **Required** | No |
| **Default** | null |
| **Conditional** | Only if Q1.1 = `powerlifting` |
| **Quick Path** | No |

**Options per lift:**
- **Squat:** Out of the hole, Mid-range, Lockout
- **Bench:** Off the chest, Mid-range, Lockout
- **Deadlift:** Off the floor, At the knees, Lockout

**Why it matters:** Sticking points determine accessory exercise selection. Missing squats at the bottom → more pause squats and quad work. Missing deadlifts at lockout → more block pulls and glute/back work.

**Programming map:**
| Lift | Sticking Point | Variation/Accessory Added |
|------|---------------|---------------------------|
| Squat | Hole | Pause squat, front squat, quad-dominant accessories |
| Squat | Mid | Belt squat, tempo squat, leg press |
| Squat | Lockout | Pin squat, good mornings, hip/glute work |
| Bench | Chest | Paused bench, wide-grip bench, chest work |
| Bench | Mid | Spoto press, close-grip bench, tricep work |
| Bench | Lockout | Board press, pin press, tricep isolations |
| Dead | Floor | Deficit deadlift, quad work, lat work |
| Dead | Knees | Paused deadlift, Romanian deadlift |
| Dead | Lockout | Block pull, rack pull, hip thrust, back work |

---

## Summary: Question → Engine Variable Map

| Question | Engine Variable(s) Affected |
|----------|----------------------------|
| Q1.1 Primary Goal | Block structure, rep ranges, volume distribution, progression model, exercise priority |
| Q1.2 Secondary Goal | Volume allocation shift (~20-30%) |
| Q1.3 Competition Division | Muscle group volume priority map |
| Q1.4 Competition Date | Periodization timeline (works backward from date) |
| Q1.5 Sport | Movement pattern priority, power/endurance bias |
| Q2.1 Days/Week | Split type, volume per session |
| Q2.2 Which Days | Rest day placement, consecutive-day constraints |
| Q2.3 Time/Session | Exercise count per session, superset usage |
| Q3.1 Experience | Progression type, volume tolerance, exercise complexity |
| Q3.2 Current Training | Starting volume adjustment, ramp-up period |
| Q3.3 Split Preference | Split selection (suggestion vs. override) |
| Q4.1 Environment | Exercise library filter |
| Q4.2 Equipment Pref | Exercise ranking within categories |
| Q5.1 Sleep | Volume modifier, deload frequency |
| Q5.2 Stress | Volume modifier, exercise density |
| Q5.3 Nutrition | Volume tolerance, progression aggressiveness |
| Q6.1 Injuries | Exercise exclusions by body part |
| Q6.2 Limitations | Exercise substitutions, corrective work additions |
| Q7.1 Style Prefs | Training density, rest periods, set techniques, progression feel |
| Q7.2 Exercises to Avoid | Exclusion list |
| Q7.3 Modalities | Non-lifting day additions (HIIT, LISS, stretch) |
| Q8.1 Current Maxes | Starting intensity (% of 1RM vs. RPE-only) |
| Q8.2 Body Weight | Relative strength, weight class, nutrition baseline |
| Q9.1 Weak Points | Volume priority per muscle group (+30-50%) |
| Q9.2 Prep Phase | Volume/cardio/intensity phase parameters |
| Q9.3 Posing | Activity block additions |
| Q10.1 Weakest Lift | Extra frequency/volume for that lift |
| Q10.2 Sticking Points | Variation and accessory selection |

---

## Quick Path (Path 1) — Minimum Viable Questions

These 5 questions are all the engine needs to generate a reasonable program:

| # | Question | Default if skipped |
|---|----------|--------------------|
| ⚡ Q1.1 | Primary Goal | **Required — cannot skip** |
| ⚡ Q2.1 | Days Per Week | **Required — cannot skip** |
| ⚡ Q2.3 | Time Per Session | 60 min |
| ⚡ Q3.1 | Experience Level | Intermediate |
| ⚡ Q3.3 | Split Preference | Auto (engine decides) |

Everything else gets sensible defaults:
- Equipment: Full gym
- No injuries
- No competition date
- Moderate sleep/stress
- Nutrition inferred from goal
- Mixed equipment preference
- No excluded exercises
- Auto modalities based on goal
- No current maxes (RPE-based)

---

## Conditional Logic Summary

```
IF Q1.1 = physique:
  SHOW: Q1.3 (Division), Q1.4 (Competition Date)
  SHOW: Step 9 (Q9.1 Weak Points, Q9.2 Prep Phase, Q9.3 Posing)

IF Q1.1 = powerlifting:
  SHOW: Q1.4 (Competition Date)
  SHOW: Step 10 (Q10.1 Weakest Lift, Q10.2 Sticking Points)

IF Q1.1 = athletic:
  SHOW: Q1.5 (Sport)

IF Q4.1 = bodyweight:
  HIDE: Q4.2 (Equipment Preference — irrelevant)

IF Q3.1 = beginner AND Q5.3 = not asked:
  DEFAULT: nutrition = not_tracking

IF Q1.4 has a date:
  Engine calculates weeks-out and auto-selects periodization structure
  IF physique: auto-maps to prep phase (Q9.2)
```
