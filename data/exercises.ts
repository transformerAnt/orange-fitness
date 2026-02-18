export type Exercise = {
  exerciseId: string;
  name: string;
  imageUrls: {
    '360p': string;
    '480p': string;
    '720p': string;
    '1080p': string;
  };
  bodyParts: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  difficulty: string;
  exerciseTypes: string[];
  movementType: string;
  gifUrls: {
    '360p': string;
    '480p': string;
    '720p': string;
    '1080p': string;
  };
  overview: string;
  instructions: string[];
  exerciseTips: string[];
  relatedExerciseIds: string[];
};

const BENCH_MEDIA = {
  imageUrls: {
    '360p': 'https://assets.exercisedb.dev/media/uc9UW4p.png',
    '480p': 'https://assets.exercisedb.dev/media/KrucGym.png',
    '720p': 'https://assets.exercisedb.dev/media/jVlPn4h.png',
    '1080p': 'https://assets.exercisedb.dev/media/UlcSMxu.png',
  },
  gifUrls: {
    '360p': 'https://assets.exercisedb.dev/media/qU7GQpl.gif',
    '480p': 'https://assets.exercisedb.dev/media/bqZjg7F.gif',
    '720p': 'https://assets.exercisedb.dev/media/Ec7u4jR.gif',
    '1080p': 'https://assets.exercisedb.dev/media/q61OKxC.gif',
  },
};

export const EXERCISES: Exercise[] = [
  {
    exerciseId: 'edb_T5uttLa',
    name: 'bench press',
    ...BENCH_MEDIA,
    bodyParts: ['chest'],
    targetMuscles: ['pectorals'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipments: ['barbell'],
    difficulty: 'intermediate',
    exerciseTypes: ['strength'],
    movementType: 'compound',
    overview:
      'The barbell bench press is a well-known strength exercise that mainly works the chest muscles, while also involving the triceps and shoulders. It is done by lying flat on a bench and smoothly lowering and pressing a barbell in a controlled motion.',
    instructions: [
      'Lie down on the bench and place your feet flat on the ground. Keep your eyes under the bar.',
      'Grab the bar with your hands about wider than shoulder-width apart. Squeeze it tight.',
      'Take the bar off the rack and raise it straight up over your chest with your elbows extended.',
      'Lower the bar slowly to your chest. Keep your elbows at 45 degrees, not straight out to the sides.',
      'Let the bar touch your mid-chest, then pause for a second.',
      'Now push the bar up by pressing your hands firmly. Keep the bar path consistent.',
    ],
    exerciseTips: [
      'Pull your shoulder blades back and down before you begin and keep them there.',
      'Do not over-arch your lower back. Maintain a slight natural curve.',
      'The bar should move straight up and down over mid-chest.',
      'Breathe in at the top and exhale on the press.',
    ],
    relatedExerciseIds: ['edb_mbpKFKd', 'edb_SIiTlYd', 'edb_TUGkclM', 'edb_WQUuNhp'],
  },
  {
    exerciseId: 'edb_BIC001',
    name: 'dumbbell bicep curl',
    ...BENCH_MEDIA,
    bodyParts: ['biceps'],
    targetMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipments: ['dumbbell'],
    difficulty: 'beginner',
    exerciseTypes: ['strength'],
    movementType: 'isolation',
    overview:
      'A classic curl that isolates the biceps while keeping the torso stable and the elbows close to the body.',
    instructions: [
      'Stand tall with a dumbbell in each hand and palms facing forward.',
      'Keep elbows close to your sides and curl the weights up.',
      'Squeeze at the top, then lower slowly with control.',
    ],
    exerciseTips: [
      'Do not swing. Keep your upper arms still.',
      'Use a full range of motion and control the lowering phase.',
    ],
    relatedExerciseIds: ['edb_BIC002', 'edb_BIC003'],
  },
  {
    exerciseId: 'edb_LEG001',
    name: 'back squat',
    ...BENCH_MEDIA,
    bodyParts: ['legs'],
    targetMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipments: ['barbell'],
    difficulty: 'intermediate',
    exerciseTypes: ['strength'],
    movementType: 'compound',
    overview:
      'A foundational lower-body movement that builds strength across quads, glutes, and core.',
    instructions: [
      'Unrack the bar and set your stance shoulder-width apart.',
      'Brace your core and sit your hips back and down.',
      'Drive through your mid-foot to stand back up.',
    ],
    exerciseTips: [
      'Keep your chest proud and your knees tracking over toes.',
      'Brace your core before each rep.',
    ],
    relatedExerciseIds: ['edb_LEG002', 'edb_LEG003'],
  },
  {
    exerciseId: 'edb_BACK001',
    name: 'pull-up',
    ...BENCH_MEDIA,
    bodyParts: ['back'],
    targetMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rear delts'],
    equipments: ['bodyweight'],
    difficulty: 'intermediate',
    exerciseTypes: ['strength'],
    movementType: 'compound',
    overview: 'A vertical pulling movement that builds the lats and upper back.',
    instructions: [
      'Hang from the bar with an overhand grip.',
      'Pull your chest to the bar by driving elbows down.',
      'Lower under control to a full hang.',
    ],
    exerciseTips: ['Avoid swinging. Keep your core tight.', 'Use a full range of motion.'],
    relatedExerciseIds: ['edb_BACK002', 'edb_BACK003'],
  },
  {
    exerciseId: 'edb_SHO001',
    name: 'shoulder press',
    ...BENCH_MEDIA,
    bodyParts: ['shoulders'],
    targetMuscles: ['deltoids'],
    secondaryMuscles: ['triceps'],
    equipments: ['dumbbell'],
    difficulty: 'beginner',
    exerciseTypes: ['strength'],
    movementType: 'compound',
    overview: 'An overhead press that builds strong shoulders and triceps.',
    instructions: [
      'Sit or stand with dumbbells at shoulder height.',
      'Press overhead until arms are fully extended.',
      'Lower back to the start with control.',
    ],
    exerciseTips: ['Keep your ribs down and core braced.', 'Avoid arching the lower back.'],
    relatedExerciseIds: ['edb_SHO002', 'edb_SHO003'],
  },
  {
    exerciseId: 'edb_CORE001',
    name: 'plank',
    ...BENCH_MEDIA,
    bodyParts: ['core'],
    targetMuscles: ['abdominals'],
    secondaryMuscles: ['glutes', 'lower back'],
    equipments: ['bodyweight'],
    difficulty: 'beginner',
    exerciseTypes: ['endurance'],
    movementType: 'isometric',
    overview: 'A core stability hold that builds endurance through the trunk and hips.',
    instructions: [
      'Place forearms on the floor and extend your legs behind you.',
      'Keep your body in a straight line from head to heels.',
      'Hold while breathing steadily.',
    ],
    exerciseTips: ['Do not let your hips sag.', 'Squeeze glutes and brace the core.'],
    relatedExerciseIds: ['edb_CORE002', 'edb_CORE003'],
  },
];
