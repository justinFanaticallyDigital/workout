import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// [name, equipment, movementPattern, primaryMuscle, secondaryMuscle1, secondaryMuscle2]
type ExerciseRow = [string, string | null, string, string | null, string | null, string | null];

const exercises: ExerciseRow[] = [
  // ─── Squat ──────────────────────────────────────────────
  ["Hack Squat - Plate Lever", "Plate Lever", "Squat", "Quadriceps", "Glutes", "Hamstrings"],
  ["Squat - Box Barbell", "Barbell", "Squat", "Glutes", "Quadriceps", "Hamstrings"],
  ["Squat - Box Bodyweight", "Bodyweight", "Squat", "Glutes", "Quadriceps", "Hamstrings"],
  ["Squat - Front Barbell", "Barbell", "Squat", "Quadriceps", "Core", "Glutes"],
  ["Squat - Goblet Dumbbell", "Dumbbell", "Squat", "Quadriceps", "Glutes", "Core"],
  ["Squat - Goblet Kettlebell", "Kettlebell", "Squat", "Quadriceps", "Glutes", "Core"],
  ["Squat - High Bar Barbell", "Barbell", "Squat", "Quadriceps", "Glutes", "Core"],
  ["Squat - Jump Bodyweight", "Bodyweight", "Squat", "Quadriceps", "Glutes", "Calves"],
  ["Squat - Low Bar Barbell", "Barbell", "Squat", "Glutes", "Quadriceps", "Hamstrings"],
  ["Squat - Plate Lever", "Plate Lever", "Squat", "Quadriceps", "Glutes", "Core"],
  ["Squat - Single Leg to Box Bodyweight", "Bodyweight", "Squat", "Quadriceps", "Glutes", "Core"],
  ["Squat - Smith Machine", "Smith Machine", "Squat", "Quadriceps", "Glutes", "Core"],
  ["Squat - Sumo Dumbbell", "Dumbbell", "Squat", "Glutes", "Quadriceps", "Adductors"],
  ["Squat - Sumo Kettlebell", "Kettlebell", "Squat", "Glutes", "Quadriceps", "Adductors"],
  ["Squat - Wall Sit Bodyweight", "Bodyweight", "Squat", "Quadriceps", "Glutes", "Core"],

  // ─── Lunge ──────────────────────────────────────────────
  ["Lunge - Bulgarian Split Squat Bodyweight", "Bodyweight", "Lunge", "Quadriceps", "Glutes", "Core"],
  ["Lunge - Bulgarian Split Squat Dumbbell", "Dumbbell", "Lunge", "Quadriceps", "Glutes", "Core"],
  ["Lunge - Curtsy Bodyweight", "Bodyweight", "Lunge", "Glutes", "Quadriceps", "Adductors"],
  ["Lunge - Curtsy Dumbbell", "Dumbbell", "Lunge", "Glutes", "Quadriceps", "Adductors"],
  ["Lunge - Forward Bodyweight", "Bodyweight", "Lunge", "Quadriceps", "Glutes", "Core"],
  ["Lunge - Forward Dumbbell", "Dumbbell", "Lunge", "Quadriceps", "Glutes", "Core"],
  ["Lunge - Jump Bodyweight", "Bodyweight", "Lunge", "Quadriceps", "Glutes", "Calves"],
  ["Lunge - Lateral Bodyweight", "Bodyweight", "Lunge", "Glutes", "Quadriceps", "Adductors"],
  ["Lunge - Lateral Dumbbell", "Dumbbell", "Lunge", "Glutes", "Quadriceps", "Adductors"],
  ["Lunge - Reverse Bodyweight", "Bodyweight", "Lunge", "Quadriceps", "Glutes", "Core"],
  ["Lunge - Reverse Dumbbell", "Dumbbell", "Lunge", "Quadriceps", "Glutes", "Core"],
  ["Lunge - Reverse Smith Machine", "Smith Machine", "Lunge", "Quadriceps", "Glutes", "Core"],
  ["Lunge - Walking Dumbbell", "Dumbbell", "Lunge", "Quadriceps", "Glutes", "Core"],
  ["Skater Jump - Bodyweight", "Bodyweight", "Lunge", "Glutes", "Quadriceps", "Core"],
  ["Split Squat - Smith Machine", "Smith Machine", "Lunge", "Quadriceps", "Glutes", "Core"],

  // ─── Step ───────────────────────────────────────────────
  ["Box Jump - Bodyweight", "Bodyweight", "Step", "Quadriceps", "Glutes", "Calves"],
  ["Step Down - Controlled Bodyweight", "Bodyweight", "Step", "Quadriceps", "Glutes", "Core"],
  ["Step Up - Bodyweight", "Bodyweight", "Step", "Quadriceps", "Glutes", "Core"],
  ["Step Up - Dumbbell", "Dumbbell", "Step", "Quadriceps", "Glutes", "Core"],
  ["Step Up - Lateral Bodyweight", "Bodyweight", "Step", "Glutes", "Quadriceps", "Abductors"],
  ["Step Up - Lateral Dumbbell", "Dumbbell", "Step", "Glutes", "Quadriceps", "Abductors"],

  // ─── Hip Hinge ──────────────────────────────────────────
  ["Deadlift - Conventional Barbell", "Barbell", "Hip Hinge", "Hamstrings", "Glutes", "Lower Back"],
  ["Deadlift - Elevated Straight Bar Barbell", "Barbell", "Hip Hinge", "Hamstrings", "Glutes", "Lower Back"],
  ["Deadlift - Hex Bar", "Hex Bar", "Hip Hinge", "Hamstrings", "Glutes", "Quadriceps"],
  ["Deadlift - Kettlebell", "Kettlebell", "Hip Hinge", "Hamstrings", "Glutes", "Core"],
  ["Deadlift - Romanian Barbell", "Barbell", "Hip Hinge", "Hamstrings", "Glutes", "Lower Back"],
  ["Deadlift - Romanian Dumbbell", "Dumbbell", "Hip Hinge", "Hamstrings", "Glutes", "Core"],
  ["Deadlift - Romanian Single Leg Dumbbell", "Dumbbell", "Hip Hinge", "Hamstrings", "Glutes", "Core"],
  ["Deadlift - Romanian Single Leg Kettlebell", "Kettlebell", "Hip Hinge", "Hamstrings", "Glutes", "Core"],
  ["Deadlift - Smith Machine Romanian", "Smith Machine", "Hip Hinge", "Hamstrings", "Glutes", "Lower Back"],
  ["Deadlift - Sumo Barbell", "Barbell", "Hip Hinge", "Glutes", "Hamstrings", "Adductors"],
  ["Good Morning - Barbell", "Barbell", "Hip Hinge", "Hamstrings", "Glutes", "Lower Back"],
  ["Good Morning - Smith Machine", "Smith Machine", "Hip Hinge", "Hamstrings", "Glutes", "Lower Back"],
  ["Kettlebell Swing - American", "Kettlebell", "Hip Hinge", "Glutes", "Hamstrings", "Shoulders"],
  ["Kettlebell Swing - Single Arm", "Kettlebell", "Hip Hinge", "Glutes", "Hamstrings", "Core"],
  ["Kettlebell Swing - Two Arm", "Kettlebell", "Hip Hinge", "Glutes", "Hamstrings", "Core"],

  // ─── Hip Extension ──────────────────────────────────────
  ["Glute Bridge - Bodyweight", "Bodyweight", "Hip Extension", "Glutes", "Hamstrings", "Core"],
  ["Glute Bridge - Dumbbell", "Dumbbell", "Hip Extension", "Glutes", "Hamstrings", "Core"],
  ["Glute Bridge - Single Leg Bodyweight", "Bodyweight", "Hip Extension", "Glutes", "Hamstrings", "Core"],
  ["Glute Bridge - Single Leg Dumbbell", "Dumbbell", "Hip Extension", "Glutes", "Hamstrings", "Core"],
  ["Hip Thrust - Barbell", "Barbell", "Hip Extension", "Glutes", "Hamstrings", "Core"],
  ["Hip Thrust - Dumbbell", "Dumbbell", "Hip Extension", "Glutes", "Hamstrings", "Core"],
  ["Hip Thrust - Smith Machine", "Smith Machine", "Hip Extension", "Glutes", "Hamstrings", "Core"],

  // ─── Hip Abduction ──────────────────────────────────────
  ["Clamshell - Resistance Band", "Resistance Band", "Hip Abduction", "Abductors", "Glutes", null],
  ["Fire Hydrant - Bodyweight", "Bodyweight", "Hip Abduction", "Abductors", "Glutes", null],
  ["Hip Abduction - Machine", "Machine", "Hip Abduction", "Abductors", null, null],
  ["Lateral Walk - Resistance Band", "Resistance Band", "Hip Abduction", "Abductors", "Glutes", null],
  ["Leg Raise - Side Lying Bodyweight", "Bodyweight", "Hip Abduction", "Abductors", null, null],

  // ─── Hip Adduction ──────────────────────────────────────
  ["Copenhagen Plank - Bodyweight", "Bodyweight", "Hip Adduction", "Adductors", "Core", null],
  ["Hip Adduction - Cable", "Cable", "Hip Adduction", "Adductors", null, null],
  ["Hip Adduction - Machine", "Machine", "Hip Adduction", "Adductors", null, null],
  ["Hip Adduction - Resistance Band", "Resistance Band", "Hip Adduction", "Adductors", null, null],

  // ─── Knee Extension ─────────────────────────────────────
  ["Leg Extension - Machine", "Machine", "Knee Extension", "Quadriceps", null, null],
  ["Leg Press - Machine", "Machine", "Knee Extension", "Quadriceps", "Glutes", "Calves"],
  ["Leg Press - Plate", "Plate", "Knee Extension", "Quadriceps", "Glutes", "Calves"],
  ["Leg Press - Single Leg Machine", "Machine", "Knee Extension", "Quadriceps", "Glutes", "Core"],

  // ─── Knee Flexion ───────────────────────────────────────
  ["Glute Ham Raise - Bodyweight", "Bodyweight", "Knee Flexion", "Hamstrings", "Glutes", "Core"],
  ["Leg Curl - Machine", "Machine", "Knee Flexion", "Hamstrings", "Calves", null],
  ["Leg Curl - Prone Machine", "Machine", "Knee Flexion", "Hamstrings", "Calves", null],
  ["Leg Curl - Seated Machine", "Machine", "Knee Flexion", "Hamstrings", "Calves", null],
  ["Leg Curl - Single Leg Machine", "Machine", "Knee Flexion", "Hamstrings", "Calves", null],
  ["Nordic Curl - Assisted Bodyweight", "Bodyweight", "Knee Flexion", "Hamstrings", "Core", null],

  // ─── Plantar Flexion ────────────────────────────────────
  ["Calf Raise - Bodyweight", "Bodyweight", "Plantar Flexion", "Calves", null, null],
  ["Calf Raise - Dumbbell", "Dumbbell", "Plantar Flexion", "Calves", null, null],
  ["Calf Raise - Plate", "Plate", "Plantar Flexion", "Calves", null, null],
  ["Calf Raise - Seated Machine", "Machine", "Plantar Flexion", "Calves", null, null],
  ["Calf Raise - Single Leg Bodyweight", "Bodyweight", "Plantar Flexion", "Calves", null, null],
  ["Calf Raise - Smith Machine", "Smith Machine", "Plantar Flexion", "Calves", null, null],
  ["Calf Raise - Standing Machine", "Machine", "Plantar Flexion", "Calves", null, null],

  // ─── Horizontal Push ────────────────────────────────────
  ["Bench Press - Close Grip Barbell", "Barbell", "Horizontal Push", "Triceps", "Chest", "Shoulders"],
  ["Bench Press - Decline Barbell", "Barbell", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Bench Press - Decline Dumbbell", "Dumbbell", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Bench Press - Decline Smith Machine", "Smith Machine", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Bench Press - Flat Barbell", "Barbell", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Bench Press - Flat Dumbbell", "Dumbbell", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Bench Press - Incline Barbell", "Barbell", "Horizontal Push", "Chest", "Shoulders", "Triceps"],
  ["Bench Press - Incline Dumbbell", "Dumbbell", "Horizontal Push", "Chest", "Shoulders", "Triceps"],
  ["Bench Press - Incline Smith Machine", "Smith Machine", "Horizontal Push", "Chest", "Shoulders", "Triceps"],
  ["Bench Press - Smith Machine", "Smith Machine", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Chest Press - Plate", "Plate", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Dip - Chest Bodyweight", "Bodyweight", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Dip - Chest Weighted", "Weighted", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Fly - Flat Dumbbell", "Dumbbell", "Horizontal Push", "Chest", "Shoulders", null],
  ["Fly - Incline Dumbbell", "Dumbbell", "Horizontal Push", "Chest", "Shoulders", null],
  ["Fly - Low-to-High Cable", "Cable", "Horizontal Push", "Chest", "Shoulders", null],
  ["Fly - Machine", "Machine", "Horizontal Push", "Chest", "Shoulders", null],
  ["Press - Chest Cable", "Cable", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Press - Chest Machine", "Machine", "Horizontal Push", "Chest", "Triceps", "Shoulders"],
  ["Push Up - Diamond Bodyweight", "Bodyweight", "Horizontal Push", "Triceps", "Chest", "Core"],
  ["Push Up - Incline Bodyweight", "Bodyweight", "Horizontal Push", "Chest", "Triceps", "Core"],
  ["Push Up - Medicine Ball", "Medicine Ball", "Horizontal Push", "Chest", "Triceps", "Core"],
  ["Push Up - Standard Bodyweight", "Bodyweight", "Horizontal Push", "Chest", "Triceps", "Core"],
  ["Push Up - TRX", "TRX", "Horizontal Push", "Chest", "Triceps", "Core"],

  // ─── Vertical Push ──────────────────────────────────────
  ["Landmine Press - Kneeling", "Barbell", "Vertical Push", "Shoulders", "Triceps", "Core"],
  ["Landmine Press - Single Arm", "Barbell", "Vertical Push", "Shoulders", "Triceps", "Core"],
  ["Landmine Press - Standing", "Barbell", "Vertical Push", "Shoulders", "Triceps", "Core"],
  ["Overhead Press - Arnold Dumbbell", "Dumbbell", "Vertical Push", "Shoulders", "Triceps", null],
  ["Overhead Press - EZ Bar", "EZ Bar", "Vertical Push", "Shoulders", "Triceps", null],
  ["Overhead Press - Pike Bodyweight", "Bodyweight", "Vertical Push", "Shoulders", "Triceps", "Core"],
  ["Overhead Press - Seated Barbell", "Barbell", "Vertical Push", "Shoulders", "Triceps", null],
  ["Overhead Press - Seated Dumbbell", "Dumbbell", "Vertical Push", "Shoulders", "Triceps", null],
  ["Overhead Press - Single Arm Dumbbell", "Dumbbell", "Vertical Push", "Shoulders", "Triceps", "Core"],
  ["Overhead Press - Single Arm Kettlebell", "Kettlebell", "Vertical Push", "Shoulders", "Triceps", "Core"],
  ["Overhead Press - Smith Machine", "Smith Machine", "Vertical Push", "Shoulders", "Triceps", null],
  ["Overhead Press - Standing Barbell", "Barbell", "Vertical Push", "Shoulders", "Triceps", "Core"],
  ["Overhead Press - Standing Dumbbell", "Dumbbell", "Vertical Push", "Shoulders", "Triceps", "Core"],
  ["Press - Shoulder Cable", "Cable", "Vertical Push", "Shoulders", "Triceps", null],
  ["Press - Shoulder Machine", "Machine", "Vertical Push", "Shoulders", "Triceps", null],
  ["Shoulder Press - Plate", "Plate", "Vertical Push", "Shoulders", "Triceps", null],

  // ─── Shoulder Isolation ─────────────────────────────────
  ["Face Pull - Cable", "Cable", "Shoulder Isolation", "Rear Delts", "Rhomboids", "Shoulders"],
  ["Face Pull - Resistance Band", "Resistance Band", "Shoulder Isolation", "Rear Delts", "Rhomboids", "Shoulders"],
  ["Fly - Rear Delt Dumbbell", "Dumbbell", "Shoulder Isolation", "Rear Delts", "Rhomboids", null],
  ["Fly - Rear Delt Machine", "Machine", "Shoulder Isolation", "Rear Delts", "Rhomboids", null],
  ["Raise - Front Cable", "Cable", "Shoulder Isolation", "Shoulders", null, null],
  ["Raise - Front Dumbbell", "Dumbbell", "Shoulder Isolation", "Shoulders", "Core", null],
  ["Raise - Lateral Cable", "Cable", "Shoulder Isolation", "Shoulders", null, null],
  ["Raise - Lateral Dumbbell", "Dumbbell", "Shoulder Isolation", "Shoulders", null, null],
  ["Raise - Lateral Resistance Band", "Resistance Band", "Shoulder Isolation", "Shoulders", null, null],
  ["Raise - Rear Delt Cable", "Cable", "Shoulder Isolation", "Shoulders", null, null],
  ["Raise - Rear Delt Resistance Band", "Resistance Band", "Shoulder Isolation", "Rear Delts", null, null],
  ["Upright Row - Barbell", "Barbell", "Shoulder Isolation", "Shoulders", "Traps", "Biceps"],
  ["Upright Row - Cable", "Cable", "Shoulder Isolation", "Shoulders", "Traps", "Biceps"],
  ["Upright Row - Dumbbell", "Dumbbell", "Shoulder Isolation", "Shoulders", "Traps", "Biceps"],
  ["Upright Row - EZ Bar", "EZ Bar", "Shoulder Isolation", "Shoulders", "Traps", "Biceps"],
  ["Upright Row - Smith Machine", "Smith Machine", "Shoulder Isolation", "Shoulders", "Traps", "Biceps"],

  // ─── Elbow Extension ────────────────────────────────────
  ["Skull Crusher - Barbell", "Barbell", "Elbow Extension", "Triceps", null, null],
  ["Skull Crusher - Dumbbell", "Dumbbell", "Elbow Extension", "Triceps", null, null],
  ["Skull Crusher - EZ Bar", "EZ Bar", "Elbow Extension", "Triceps", null, null],
  ["Tricep Dip - Bodyweight", "Bodyweight", "Elbow Extension", "Triceps", "Chest", "Shoulders"],
  ["Tricep Dip - Machine", "Machine", "Elbow Extension", "Triceps", "Chest", "Shoulders"],
  ["Tricep Extension - Overhead Cable", "Cable", "Elbow Extension", "Triceps", null, null],
  ["Tricep Extension - Overhead Dumbbell", "Dumbbell", "Elbow Extension", "Triceps", "Shoulders", null],
  ["Tricep Extension - Overhead EZ Bar", "EZ Bar", "Elbow Extension", "Triceps", null, null],
  ["Tricep Kickback - Dumbbell", "Dumbbell", "Elbow Extension", "Triceps", null, null],
  ["Tricep Press - TRX", "TRX", "Elbow Extension", "Triceps", "Core", null],
  ["Tricep Pressdown - Cable", "Cable", "Elbow Extension", "Triceps", null, null],
  ["Tricep Pressdown - Machine", "Machine", "Elbow Extension", "Triceps", null, null],

  // ─── Horizontal Pull ────────────────────────────────────
  ["Row - Bent Over Barbell", "Barbell", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Bent Over Dumbbell", "Dumbbell", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Bent Over EZ Bar", "EZ Bar", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Chest Supported Dumbbell", "Dumbbell", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Inverted Barbell", "Barbell", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Plate", "Plate", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Renegade Dumbbell", "Dumbbell", "Horizontal Pull", "Lats", "Core", "Biceps"],
  ["Row - Resistance Band", "Resistance Band", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Seated Cable", "Cable", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Seated Machine", "Machine", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Single Arm Cable", "Cable", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Single Arm Dumbbell", "Dumbbell", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - Smith Machine", "Smith Machine", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - T-Bar Landmine", "Barbell", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - TRX", "TRX", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],
  ["Row - TRX Single Arm", "TRX", "Horizontal Pull", "Lats", "Core", "Biceps"],
  ["Row - Wide Grip Cable", "Cable", "Horizontal Pull", "Lats", "Rhomboids", "Biceps"],

  // ─── Vertical Pull ──────────────────────────────────────
  ["Chin Up - Assisted Machine", "Machine", "Vertical Pull", "Biceps", "Lats", "Rhomboids"],
  ["Chin Up - Bodyweight", "Bodyweight", "Vertical Pull", "Biceps", "Lats", "Rhomboids"],
  ["Pull Up - Assisted Machine", "Machine", "Vertical Pull", "Lats", "Biceps", "Rhomboids"],
  ["Pull Up - Bodyweight", "Bodyweight", "Vertical Pull", "Lats", "Biceps", "Rhomboids"],
  ["Pull Up - Negative", "Bodyweight", "Vertical Pull", "Lats", "Biceps", "Rhomboids"],
  ["Pull Up - TRX", "TRX", "Vertical Pull", "Lats", "Biceps", "Core"],
  ["Pull Up - Weighted Bodyweight", "Weighted", "Vertical Pull", "Lats", "Biceps", "Core"],
  ["Pulldown - Close Grip Cable", "Cable", "Vertical Pull", "Lats", "Biceps", "Rhomboids"],
  ["Pulldown - Lat Cable", "Cable", "Vertical Pull", "Lats", "Biceps", "Rhomboids"],
  ["Pulldown - Reverse Grip Cable", "Cable", "Vertical Pull", "Biceps", "Lats", "Rhomboids"],
  ["Pulldown - Wide Grip Cable", "Cable", "Vertical Pull", "Lats", "Biceps", "Rhomboids"],
  ["Pullover - Cable", "Cable", "Vertical Pull", "Lats", "Chest", "Triceps"],
  ["Pullover - Dumbbell", "Dumbbell", "Vertical Pull", "Lats", "Chest", "Triceps"],

  // ─── Elbow Flexion ──────────────────────────────────────
  ["Curl - 21s Barbell", "Barbell", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - 21s Dumbbell", "Dumbbell", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - 21s EZ Bar", "EZ Bar", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Barbell", "Barbell", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Cable", "Cable", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Concentration Dumbbell", "Dumbbell", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Dumbbell", "Dumbbell", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - EZ Bar", "EZ Bar", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Hammer Dumbbell", "Dumbbell", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Incline Dumbbell", "Dumbbell", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Preacher Dumbbell", "Dumbbell", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Preacher EZ Bar", "EZ Bar", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Preacher Machine", "Machine", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - Resistance Band", "Resistance Band", "Elbow Flexion", "Biceps", "Forearms", null],
  ["Curl - TRX", "TRX", "Elbow Flexion", "Biceps", "Core", null],
  ["Reverse Curl - Barbell", "Barbell", "Elbow Flexion", "Forearms", "Biceps", null],
  ["Reverse Curl - Dumbbell", "Dumbbell", "Elbow Flexion", "Forearms", "Biceps", null],
  ["Reverse Curl - EZ Bar", "EZ Bar", "Elbow Flexion", "Forearms", "Biceps", null],

  // ─── Scapular Elevation ─────────────────────────────────
  ["Shrug - Barbell", "Barbell", "Scapular Elevation", "Traps", "Shoulders", null],
  ["Shrug - Cable", "Cable", "Scapular Elevation", "Traps", "Shoulders", null],
  ["Shrug - Dumbbell", "Dumbbell", "Scapular Elevation", "Traps", "Shoulders", null],
  ["Shrug - Smith Machine", "Smith Machine", "Scapular Elevation", "Traps", "Shoulders", null],

  // ─── Core Stability ─────────────────────────────────────
  ["Bird Dog - Bodyweight", "Bodyweight", "Core Stability", "Core", "Glutes", null],
  ["Dead Bug - Bodyweight", "Bodyweight", "Core Stability", "Core", null, null],
  ["Hollow Body Hold - Bodyweight", "Bodyweight", "Core Stability", "Core", "Hip Flexors", null],
  ["Pallof Press - Cable", "Cable", "Core Stability", "Core", "Obliques", null],
  ["Pallof Press - Resistance Band", "Resistance Band", "Core Stability", "Core", "Obliques", null],
  ["Plank - Side Bodyweight", "Bodyweight", "Core Stability", "Core", "Obliques", null],
  ["Plank - Standard Bodyweight", "Bodyweight", "Core Stability", "Core", "Shoulders", null],
  ["Plank - TRX", "TRX", "Core Stability", "Core", "Shoulders", null],
  ["Rollout - Ab Wheel", "Ab Wheel", "Core Stability", "Core", "Shoulders", "Lats"],
  ["Stir the Pot - Swiss Ball", "Swiss Ball", "Core Stability", "Core", "Shoulders", null],

  // ─── Core Flexion ───────────────────────────────────────
  ["Crunch - Bodyweight", "Bodyweight", "Core Flexion", "Core", null, null],
  ["Crunch - Cable", "Cable", "Core Flexion", "Core", null, null],
  ["Knee Raise - Hanging Bodyweight", "Bodyweight", "Core Flexion", "Core", "Hip Flexors", null],
  ["Leg Raise - Hanging Bodyweight", "Bodyweight", "Core Flexion", "Core", "Hip Flexors", null],
  ["Mountain Climber - Bodyweight", "Bodyweight", "Core Flexion", "Core", "Shoulders", null],
  ["Sit Up - Bodyweight", "Bodyweight", "Core Flexion", "Core", "Hip Flexors", null],
  ["Toe Touch - Bodyweight", "Bodyweight", "Core Flexion", "Core", null, null],
  ["V-Up - Bodyweight", "Bodyweight", "Core Flexion", "Core", "Hip Flexors", null],

  // ─── Core Extension ─────────────────────────────────────
  ["Back Extension - 45 Degree Bodyweight", "Bodyweight", "Core Extension", "Lower Back", "Glutes", "Hamstrings"],
  ["Back Extension - Machine", "Machine", "Core Extension", "Lower Back", "Glutes", null],
  ["Reverse Hyper - Machine", "Machine", "Core Extension", "Lower Back", "Glutes", "Hamstrings"],
  ["Reverse Plank - Bodyweight", "Bodyweight", "Core Extension", "Lower Back", "Glutes", "Hamstrings"],
  ["Superman - Bodyweight", "Bodyweight", "Core Extension", "Lower Back", "Glutes", null],

  // ─── Core Rotation ──────────────────────────────────────
  ["Bicycle Crunch - Bodyweight", "Bodyweight", "Core Rotation", "Obliques", "Core", null],
  ["Russian Twist - Bodyweight", "Bodyweight", "Core Rotation", "Obliques", "Core", null],
  ["Russian Twist - Medicine Ball", "Medicine Ball", "Core Rotation", "Obliques", "Core", null],
  ["Wood Chop - Cable", "Cable", "Core Rotation", "Obliques", "Core", null],
  ["Wood Chop - Medicine Ball", "Medicine Ball", "Core Rotation", "Obliques", "Core", null],

  // ─── Power ──────────────────────────────────────────────
  ["Clean - Barbell", "Barbell", "Power", "Glutes", "Hamstrings", "Shoulders"],
  ["Clean - Kettlebell", "Kettlebell", "Power", "Glutes", "Shoulders", "Core"],
  ["Medicine Ball Throw - Chest Pass", "Medicine Ball", "Power", "Chest", "Triceps", "Core"],
  ["Medicine Ball Throw - Overhead", "Medicine Ball", "Power", "Shoulders", "Core", "Lats"],
  ["Slam - Medicine Ball", "Medicine Ball", "Power", "Core", "Shoulders", "Lats"],
  ["Slam Ball - Overhead", "Slam Ball", "Power", "Core", "Shoulders", "Lats"],
  ["Snatch - Kettlebell", "Kettlebell", "Power", "Glutes", "Shoulders", "Core"],
  ["Thruster - Barbell", "Barbell", "Power", "Quadriceps", "Shoulders", "Core"],
  ["Thruster - Dumbbell", "Dumbbell", "Power", "Quadriceps", "Shoulders", "Core"],

  // ─── Carry ──────────────────────────────────────────────
  ["Farmer Walk - Dumbbell", "Dumbbell", "Carry", "Forearms", "Core", "Traps"],
  ["Farmer Walk - Kettlebell", "Kettlebell", "Carry", "Forearms", "Core", "Traps"],
  ["Farmer Walk - Single Arm Dumbbell", "Dumbbell", "Carry", "Forearms", "Core", "Obliques"],
  ["Farmer Walk - Single Arm Kettlebell", "Kettlebell", "Carry", "Forearms", "Core", "Obliques"],
  ["Overhead Carry - Dumbbell", "Dumbbell", "Carry", "Shoulders", "Core", "Traps"],
  ["Overhead Carry - Kettlebell", "Kettlebell", "Carry", "Shoulders", "Core", "Traps"],
  ["Rack Carry - Kettlebell", "Kettlebell", "Carry", "Core", "Forearms", "Shoulders"],

  // ─── Cardio ─────────────────────────────────────────────
  ["Battle Ropes - Alternating", "Battle Ropes", "Cardio", "Shoulders", "Core", null],
  ["Burpee - Bodyweight", "Bodyweight", "Cardio", "Full Body", "Core", null],
  ["Butt Kickers - Bodyweight", "Bodyweight", "Cardio", "Hamstrings", "Calves", "Core"],
  ["High Knees - Bodyweight", "Bodyweight", "Cardio", "Hip Flexors", "Calves", "Core"],
  ["Jumping Jacks - Bodyweight", "Bodyweight", "Cardio", "Calves", "Shoulders", "Core"],
  ["Row - Ergometer", "Ergometer", "Cardio", "Full Body", "Lats", "Core"],
  ["Sprint - Treadmill", "Treadmill", "Cardio", "Quadriceps", "Hamstrings", "Calves"],

  // ─── Stretch ────────────────────────────────────────────
  ["Bear Hug", null, "Stretch", null, null, null],
  ["Bent Over Calf Stretch", null, "Stretch", null, null, null],
  ["Cactus Arms", null, "Stretch", null, null, null],
  ["Chest Opener", null, "Stretch", null, null, null],
  ["Chin Retractions", null, "Stretch", null, null, null],
  ["Corner Pecs Stretch", null, "Stretch", null, null, null],
  ["Cow Face Stretch", null, "Stretch", null, null, null],
  ["Cross Leg Fold", null, "Stretch", null, null, null],
  ["Cross Leg Side Bend", null, "Stretch", null, null, null],
  ["Deep Split Squat Stretch", null, "Stretch", null, null, null],
  ["Diver Stretch", null, "Stretch", null, null, null],
  ["Doorway Pecs Stretch", null, "Stretch", null, null, null],
  ["Eagle Arm Stretch", null, "Stretch", null, null, null],
  ["Ear-to-Shoulder Stretch", null, "Stretch", null, null, null],
  ["Forward Fold", null, "Stretch", null, null, null],
  ["Leaning Calf Stretch", null, "Stretch", null, null, null],
  ["Modified Reverse Prayer", null, "Stretch", null, null, null],
  ["Neck Extension", null, "Stretch", null, null, null],
  ["Neck Flexion", null, "Stretch", null, null, null],
  ["Neck Laterals", null, "Stretch", null, null, null],
  ["Neck Rotation", null, "Stretch", null, null, null],
  ["One Arm Hug", null, "Stretch", null, null, null],
  ["Overhead Tricep Stretch", null, "Stretch", null, null, null],
  ["Rag Doll", null, "Stretch", null, null, null],
  ["Reverse Prayer Pose", null, "Stretch", null, null, null],
  ["Reverse Shoulder Stretch", null, "Stretch", null, null, null],
  ["Scalene Stretch", null, "Stretch", null, null, null],
  ["Scapula Stretch", null, "Stretch", null, null, null],
  ["Side Bend", null, "Stretch", null, null, null],
  ["Side Lunge Stretch", null, "Stretch", null, null, null],
  ["Single Leg Deadlift Stretch", null, "Stretch", null, null, null],
  ["Soleus Stretch", null, "Stretch", null, null, null],
  ["Squat Stretch", null, "Stretch", null, null, null],
  ["Standing Frog Stretch", null, "Stretch", null, null, null],
  ["Standing Lunge Twist", null, "Stretch", null, null, null],
  ["Standing Quad Stretch", null, "Stretch", null, null, null],
  ["Toe Touch Stretch", null, "Stretch", null, null, null],
  ["Toe-to-Wall Stretch", null, "Stretch", null, null, null],
  ["Upward Salute", null, "Stretch", null, null, null],
  ["Wall Arms", null, "Stretch", null, null, null],
  ["Wall Dog", null, "Stretch", null, null, null],
  ["Wall Pecs Stretch", null, "Stretch", null, null, null],
  ["Wide Leg Bend", null, "Stretch", null, null, null],
  ["Wide Leg Side Bend", null, "Stretch", null, null, null],
  ["Wrist Extension I", null, "Stretch", null, null, null],
  ["Wrist Extension II", null, "Stretch", null, null, null],
  ["Wrist Flexion I", null, "Stretch", null, null, null],
];

async function main() {
  console.log(`Seeding ${exercises.length} exercises...`);

  const data = exercises.map(([name, equipment, movementPattern, primaryMuscle, secondaryMuscle1, secondaryMuscle2]) => ({
    name,
    equipment,
    movementPattern,
    primaryMuscle,
    secondaryMuscle1,
    secondaryMuscle2,
    isCustom: false,
  }));

  // Use upsert to avoid duplicates on re-run
  let created = 0;
  let skipped = 0;

  for (const exercise of data) {
    try {
      await prisma.exercise.upsert({
        where: { name: exercise.name },
        update: {
          equipment: exercise.equipment,
          movementPattern: exercise.movementPattern,
          primaryMuscle: exercise.primaryMuscle,
          secondaryMuscle1: exercise.secondaryMuscle1,
          secondaryMuscle2: exercise.secondaryMuscle2,
        },
        create: exercise,
      });
      created++;
    } catch (e) {
      console.error(`Failed to upsert "${exercise.name}":`, e);
      skipped++;
    }
  }

  console.log(`Done! ${created} exercises upserted, ${skipped} failed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
