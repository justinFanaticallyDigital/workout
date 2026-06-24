// logger-data.jsx — realistic mock session mirroring BlockDay shape
// Movement categories map to push/pull/legs/core colors (constant
// across themes per the brief).

const CATEGORY_COLOR = {
  'Incline Press':   'push',
  'Horizontal Press': 'push',
  'Vertical Press':  'push',
  'Fly':             'push',
  'Lateral Delt':    'push',
  'Front Delt':      'push',
  'Triceps':         'push',
  'Vertical Pull':   'pull',
  'Horizontal Pull': 'pull',
  'Row':             'pull',
  'Bicep':           'pull',
  'Rear Delt':       'pull',
  'Quad':            'legs',
  'Hamstring':       'legs',
  'Glutes':          'legs',
  'Calves':          'legs',
  'Leg Raise':       'core',
  'Rollout':         'core',
  'Core':            'core',
};

const WEEKS = [
  { key: 'w1', label: 'W1', date: '02/03', active: false, pastComplete: true  },
  { key: 'w2', label: 'W2', date: '02/10', active: false, pastComplete: true  },
  { key: 'w3', label: 'W3', date: '02/17', active: false, pastComplete: true  },
  { key: 'w4', label: 'W4', date: '02/24', active: true,  pastComplete: false }, // today's week
];

// Per lane, sets is an array-of-arrays: sets[weekIndex] = [{w,r,rpe,done}]
// null entries in weeks w1..w3 mean not yet logged when that week was live
// (we model the past as completed, w4 is today and partially logged).

function mkSet(w, r, rpe, done = true) { return { w, r, rpe, done, warmup: false }; }
function mkEmpty() { return { w: null, r: null, rpe: null, done: false, warmup: false }; }

const LANES = [
  {
    id: 'l1',
    category: 'Incline Press',
    variant: 'Bench Press — Incline Barbell',
    variants: [
      'Bench Press — Incline Barbell',
      'Bench Press — Incline Dumbbell',
      'Bench Press — Flat Barbell',
      'Machine Chest Press — Incline',
    ],
    targetSets: 3,
    targetReps: '6-8',
    rpeTarget: 8,
    sets: [
      [mkSet(175,8,7), mkSet(175,8,8), mkSet(175,7,9)],        // w1
      [mkSet(180,8,7), mkSet(180,8,8), mkSet(180,7,9)],        // w2
      [mkSet(185,8,7), mkSet(185,8,8), mkSet(185,7,9)],        // w3
      // w4 today — fully logged with 6 sets to stress-test row layout
      [mkSet(190,8,7,true), mkSet(190,8,8,true), mkSet(190,7,9,true), mkSet(185,7,9,true), mkSet(180,7,9,true), mkSet(175,6,10,true)],
    ],
    notes: { w4: 'feeling strong; bar moving fast' },
  },
  {
    id: 'l2',
    category: 'Fly',
    variant: 'Fly — Machine',
    variants: ['Fly — Machine', 'Fly — Cable Low-to-High', 'Fly — Pec Deck', 'Fly — Dumbbell'],
    targetSets: 3,
    targetReps: '8-10',
    rpeTarget: 9,
    sets: [
      [mkSet(50,10,8), mkSet(50,10,9), mkSet(50,9,9)],
      [mkSet(55,10,8), mkSet(55,10,9), mkSet(55,9,9)],
      [mkSet(55,10,8), mkSet(55,10,9), mkSet(55,10,10)],
      // w4 today — 5 sets logged
      [mkSet(55,10,8,true), mkSet(55,10,9,true), mkSet(55,9,9,true), mkSet(50,9,10,true), mkSet(50,8,10,true)],
    ],
  },
  {
    id: 'l3',
    category: 'Lateral Delt',
    variant: 'Lateral Raise — Seated Dumbbell',
    variants: [
      'Lateral Raise — Seated Dumbbell',
      'Lateral Raise — Cable',
      'Lateral Raise — Machine',
      'Lateral Raise — Standing Dumbbell',
    ],
    targetSets: 3,
    targetReps: '8-10',
    rpeTarget: 9,
    sets: [
      [mkSet(20,10,8), mkSet(20,10,9), mkSet(20,8,10)],
      [mkSet(20,10,8), mkSet(20,10,9), mkSet(20,9,10)],
      [mkSet(22.5,10,8), mkSet(22.5,10,9), mkSet(22.5,9,10)],
      // w4 today — 4 sets logged
      [mkSet(22.5,10,8,true), mkSet(22.5,10,9,true), mkSet(22.5,9,10,true), mkSet(20,8,10,true)],
    ],
  },
  {
    id: 'l4',
    category: 'Front Delt',
    variant: 'Shoulder Press — Seated Dumbbell',
    variants: [
      'Shoulder Press — Seated Dumbbell',
      'Shoulder Press — Standing Barbell',
      'Shoulder Press — Machine',
      'Arnold Press',
    ],
    targetSets: 3,
    targetReps: '8-10',
    rpeTarget: 8,
    sets: [
      [mkSet(55,10,7), mkSet(55,10,8), mkSet(55,9,9)],
      [mkSet(55,10,7), mkSet(55,10,8), mkSet(55,10,9)],
      [mkSet(60,10,8), mkSet(60,10,9), mkSet(60,8,10)],
      // w4 today — 3 sets logged
      [mkSet(60,10,7,true), mkSet(60,10,8,true), mkSet(60,9,9,true)],
    ],
  },
  {
    id: 'l5',
    category: 'Triceps',
    variant: 'Skullcrusher — Incline Dumbbell',
    variants: [
      'Skullcrusher — Incline Dumbbell',
      'Triceps — Cable Rope Pushdown',
      'Triceps — Overhead Cable',
      'Dips — Weighted',
    ],
    targetSets: 3,
    targetReps: '8-12',
    rpeTarget: 9,
    sets: [
      [mkSet(35,12,8), mkSet(35,11,9), mkSet(35,10,10)],
      [mkSet(35,12,8), mkSet(35,12,9), mkSet(35,10,10)],
      [mkSet(40,12,8), mkSet(40,10,9), mkSet(40,9,10)],
      // w4 today — 3 sets logged
      [mkSet(40,12,8,true), mkSet(40,11,9,true), mkSet(40,9,10,true)],
    ],
  },
  {
    id: 'l6',
    category: 'Leg Raise',
    variant: 'Leg Raise — Hanging Bodyweight',
    variants: [
      'Leg Raise — Hanging Bodyweight',
      'Leg Raise — Captain\'s Chair',
      'Leg Raise — Lying',
    ],
    targetSets: 3,
    targetReps: '12-15',
    rpeTarget: 9,
    sets: [
      [mkSet(0,15,7), mkSet(0,13,8), mkSet(0,10,10)],
      [mkSet(0,15,7), mkSet(0,14,8), mkSet(0,11,10)],
      [mkSet(0,15,7), mkSet(0,15,9), mkSet(0,12,10)],
      // w4 today — 3 sets logged
      [mkSet(0,15,7,true), mkSet(0,14,8,true), mkSet(0,12,10,true)],
    ],
  },
];

const SESSION = {
  block: 'Block 1 · Program 2',
  day: 'Day 1 · Upper',
  dateLabel: '02/24/2026',
  currentWeekIdx: 3,       // w4
  elapsedMin: 34,
  restRemaining: 72,
  weeks: WEEKS,
  lanes: LANES,
};

// Quick aggregates.
function loggerStats(s) {
  const wi = s.currentWeekIdx;
  let done = 0, total = 0, volume = 0;
  for (const lane of s.lanes) {
    for (const set of lane.sets[wi]) {
      total++;
      if (set.done && set.w != null && set.r != null) { done++; volume += set.w * set.r; }
    }
  }
  return { done, total, volume };
}

Object.assign(window, { CATEGORY_COLOR, SESSION, loggerStats });
