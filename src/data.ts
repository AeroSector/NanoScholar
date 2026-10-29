/**
 * NanoScholar Core Educational Dataset
 * Includes Multi-Level Quizzes and Interactive Flashcards across 3 Difficulty Tiers:
 * - Level 1: Foundation (Core definitions & direct recognition)
 * - Level 2: Intermediate (Calculations & application reasoning)
 * - Level 3: Advanced Scholar (Edge cases, in-depth analysis, & problem solving)
 */

export type DifficultyLevel = 'level-1' | 'level-2' | 'level-3';

export interface QuizQuestion {
  id: number;
  subjectId: string;
  subjectName: string;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: number;
  subjectId: string;
  subjectName: string;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  front: string;
  back: string;
  formulaOrKey?: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  subject: string;
  subjectId: string;
  title: string;
  level: string;
  readTime: string;
  payloadSize: string;
  summary: string;
  svgDiagram: string;
  textDiagramFallback: string;
  diagramCaption: string;
  keyConcepts: { title: string; desc: string }[];
  contentSections: { heading: string; paragraphs: string[]; keyTakeaway?: string }[];
  definitions: { term: string; definition: string }[];
  quiz: QuizQuestion[];
}

export const DIFFICULTY_TIERS = [
  { id: 'all', label: 'All Levels', desc: 'Mixed challenge' },
  { id: 'level-1', label: 'Level 1: Foundation', desc: 'Core definitions & essentials' },
  { id: 'level-2', label: 'Level 2: Intermediate', desc: 'Calculations & applied concepts' },
  { id: 'level-3', label: 'Level 3: Advanced', desc: 'Critical analysis & deep mastery' },
];

export const SUBJECTS = [
  { id: 'all', name: 'All Subjects', count: 6, color: '#1d4ed8' },
  { id: 'biology', name: 'Biology & Life', count: 1, color: '#059669' },
  { id: 'math', name: 'Mathematics', count: 1, color: '#2563eb' },
  { id: 'physics', name: 'Physics & Electrical', count: 1, color: '#d97706' },
  { id: 'health', name: 'Health & Sanitation', count: 1, color: '#dc2626' },
  { id: 'cs', name: 'Digital Literacy & CS', count: 1, color: '#7c3aed' },
  { id: 'earth', name: 'Earth Science', count: 1, color: '#0284c7' },
];

export const LESSONS: Lesson[] = [
  {
    id: 'biology-photosynthesis',
    subject: 'Biology & Life',
    subjectId: 'biology',
    title: 'Photosynthesis & Cellular Energy Flow',
    level: 'Secondary',
    readTime: '4 min read',
    payloadSize: '14.2 KB',
    summary: 'How green plants convert solar light energy, carbon dioxide, and water into chemical energy (glucose) and oxygen gas.',
    svgDiagram: `<svg viewBox="0 0 540 220" width="100%" height="auto" class="svg-diagram svg-flow-path" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Photosynthesis process diagram showing sunlight, carbon dioxide, water entering plant leaf, producing glucose and oxygen">
      <defs>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ecfdf5" />
          <stop offset="100%" stop-color="#d1fae5" />
        </linearGradient>
      </defs>
      <rect width="540" height="220" fill="var(--color-bg)" rx="8" />
      <path d="M 120 180 C 120 90 220 50 380 60 C 440 90 420 170 340 180 Z" fill="url(#leafGrad)" stroke="#059669" stroke-width="2.5" />
      <path d="M 120 180 Q 260 120 380 60" fill="none" stroke="#059669" stroke-width="1.5" stroke-dasharray="4 4" />
      
      <!-- Sunlight -->
      <circle cx="60" cy="50" r="24" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" class="svg-sun-glow" />
      <line x1="60" y1="16" x2="60" y2="6" stroke="#ca8a04" stroke-width="2" />
      <line x1="60" y1="84" x2="60" y2="94" stroke="#ca8a04" stroke-width="2" />
      <line x1="26" y1="50" x2="16" y2="50" stroke="#ca8a04" stroke-width="2" />
      <line x1="94" y1="50" x2="104" y2="50" stroke="#ca8a04" stroke-width="2" />
      <line x1="80" y1="65" x2="150" y2="100" stroke="#ca8a04" stroke-width="2.5" />
      <polygon points="152,101 143,94 146,104" fill="#ca8a04" />
      <text x="60" y="55" font-size="11" text-anchor="middle" font-weight="bold" fill="#854d0e">SUN</text>
      <text x="110" y="78" font-size="11" font-weight="bold" fill="#854d0e">Photons</text>

      <!-- CO2 -->
      <rect x="20" y="115" width="84" height="30" rx="6" fill="var(--color-surface)" stroke="#94a3b8" stroke-width="1.5" />
      <text x="62" y="134" font-size="11" font-weight="bold" text-anchor="middle" fill="var(--color-text)">CO2 (Air)</text>
      <path d="M 104 130 L 160 135" stroke="#475569" stroke-width="2" />
      <polygon points="160,135 150,131 152,140" fill="#475569" />
      
      <!-- H2O -->
      <rect x="20" y="160" width="84" height="30" rx="6" fill="var(--color-surface)" stroke="#0284c7" stroke-width="1.5" />
      <text x="62" y="179" font-size="11" font-weight="bold" text-anchor="middle" fill="#0284c7">H2O (Roots)</text>
      <path d="M 104 175 L 170 165" stroke="#0284c7" stroke-width="2" />
      <polygon points="170,165 160,161 162,170" fill="#0284c7" />

      <!-- Chloroplast -->
      <circle cx="270" cy="125" r="44" fill="var(--color-surface)" stroke="#047857" stroke-width="3" />
      <text x="270" y="121" font-size="11" font-weight="bold" text-anchor="middle" fill="#065f46">CHLOROPLAST</text>
      <text x="270" y="136" font-size="9" text-anchor="middle" fill="#047857">Thylakoid / Stroma</text>

      <!-- Outputs -->
      <path d="M 314 120 L 385 105" stroke="#047857" stroke-width="2" />
      <polygon points="385,105 375,101 377,110" fill="#047857" />
      <rect x="388" y="90" width="135" height="32" rx="6" fill="var(--color-surface)" stroke="#059669" stroke-width="2" />
      <text x="455" y="111" font-size="11" font-weight="bold" text-anchor="middle" fill="#065f46">Glucose (C6H12O6)</text>

      <path d="M 314 135 L 385 150" stroke="#0284c7" stroke-width="2" />
      <polygon points="385,150 375,146 377,155" fill="#0284c7" />
      <rect x="388" y="135" width="135" height="32" rx="6" fill="var(--color-surface)" stroke="#0284c7" stroke-width="2" />
      <text x="455" y="156" font-size="11" font-weight="bold" text-anchor="middle" fill="#0369a1">Oxygen (O2 Gas)</text>
    </svg>`,
    textDiagramFallback: `[TEXT DIAGRAM: Photosynthesis]
Inputs: Sunlight (Energy) + 6 CO2 (Carbon Dioxide from air) + 6 H2O (Water from soil)
Reaction Location: Chloroplast (contains green pigment chlorophyll)
Outputs: C6H12O6 (Glucose sugar for plant growth) + 6 O2 (Oxygen gas released to air)`,
    diagramCaption: 'Figure 1: Inputs and outputs of the photosynthetic reaction inside the plant leaf chloroplast.',
    keyConcepts: [
      { title: 'The Chemical Formula', desc: '6 CO2 + 6 H2O + Light Energy -> C6H12O6 + 6 O2' },
      { title: 'Chlorophyll Role', desc: 'Absorbs blue and red wavelengths of light while reflecting green light, which makes leaves appear green.' },
      { title: 'Ecological Significance', desc: 'Provides the fundamental energy source for almost all food chains on Earth and regenerates atmospheric oxygen.' }
    ],
    contentSections: [
      {
        heading: '1. What is Photosynthesis?',
        paragraphs: [
          'Photosynthesis is the biochemical process by which photoautotrophic organisms, notably green plants, algae, and cyanobacteria, harness solar radiant energy and convert it into chemical potential energy stored in the molecular bonds of carbohydrates (glucose).',
          'Without this biological reaction, Earth would lack breathable oxygen and the nutritional foundation required to support multicellular animal life.'
        ]
      },
      {
        heading: '2. The Two Stages of the Reaction',
        paragraphs: [
          'Light-Dependent Reactions occur within the thylakoid membranes of chloroplasts. Photons of light split water molecules (photolysis), releasing oxygen gas as a byproduct and generating high-energy carrier molecules (ATP and NADPH).',
          'Light-Independent Reactions (Calvin Cycle) take place in the stroma. Here, carbon dioxide is captured through microscopic leaf pores called stomata and fixed into glucose using the energy from ATP and NADPH.'
        ],
        keyTakeaway: 'Key Takeaway: Water is split to produce oxygen; carbon dioxide is fixed to produce food (glucose).'
      },
      {
        heading: '3. Factors Influencing Reaction Rate',
        paragraphs: [
          'The rate of photosynthesis is governed by limiting factors: Light intensity, Carbon dioxide concentration, and Temperature. If any one of these inputs is deficient, the overall rate of carbohydrate production is constrained.'
        ]
      }
    ],
    definitions: [
      { term: 'Chloroplast', definition: 'The specialized double-membraned organelle inside plant cells where photosynthesis takes place.' },
      { term: 'Chlorophyll', definition: 'The primary green photoreceptive pigment responsible for capturing photon energy.' },
      { term: 'Stomata', definition: 'Microscopic pores located mainly on the underside of leaves that open and close to regulate gas exchange (CO2 in, O2 and water vapor out).' },
      { term: 'Glucose (C6H12O6)', definition: 'A six-carbon monosaccharide sugar utilized by living cells for cellular respiration or stored as insoluble starch.' }
    ],
    quiz: [
      {
        id: 101,
        subjectId: 'biology',
        subjectName: 'Biology & Life',
        difficulty: 'level-1',
        difficultyLabel: 'Level 1: Foundation',
        question: 'What is the primary gas released into the atmosphere as a byproduct of photosynthesis?',
        options: ['Carbon Dioxide (CO2)', 'Oxygen (O2)', 'Nitrogen (N2)', 'Methane (CH4)'],
        correctIndex: 1,
        explanation: 'Oxygen (O2) is produced when water (H2O) molecules are split during the light-dependent reactions in chloroplasts.'
      },
      {
        id: 102,
        subjectId: 'biology',
        subjectName: 'Biology & Life',
        difficulty: 'level-1',
        difficultyLabel: 'Level 1: Foundation',
        question: 'Which organelle within plant cells contains chlorophyll and carries out photosynthesis?',
        options: ['Mitochondria', 'Ribosome', 'Chloroplast', 'Golgi apparatus'],
        correctIndex: 2,
        explanation: 'Chloroplasts contain thylakoid discs rich in chlorophyll where solar photons are absorbed.'
      },
      {
        id: 103,
        subjectId: 'biology',
        subjectName: 'Biology & Life',
        difficulty: 'level-2',
        difficultyLabel: 'Level 2: Intermediate',
        question: 'Through which microscopic leaf structures does carbon dioxide enter the plant tissue?',
        options: ['Stomata', 'Xylem vessels', 'Root hairs', 'Phloem tubes'],
        correctIndex: 0,
        explanation: 'Stomata are regulated micro-pores on leaves that allow carbon dioxide to diffuse into the photosynthetic mesophyll tissue.'
      },
      {
        id: 104,
        subjectId: 'biology',
        subjectName: 'Biology & Life',
        difficulty: 'level-3',
        difficultyLabel: 'Level 3: Advanced',
        question: 'If light intensity and CO2 levels are high, what primary environmental factor limits photosynthesis rate if temperature drops below 5°C?',
        options: ['Lack of photons', 'Denaturation of cellular starch', 'Reduced enzyme kinetic activity in the stroma', 'Excessive transpiration'],
        correctIndex: 2,
        explanation: 'Photosynthetic enzymes (such as Rubisco in the Calvin cycle) require kinetic thermal energy. Low temperatures drastically slow biochemical collision rates.'
      }
    ]
  },
  {
    id: 'math-pythagoras',
    subject: 'Mathematics',
    subjectId: 'math',
    title: 'The Pythagorean Theorem & Right Triangles',
    level: 'Middle / Secondary',
    readTime: '3 min read',
    payloadSize: '11.8 KB',
    summary: 'Master the fundamental geometric relation between the three sides of a right triangle: a² + b² = c².',
    svgDiagram: `<svg viewBox="0 0 540 220" width="100%" height="auto" class="svg-diagram" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Right-angled triangle with sides a=3, b=4, hypotenuse c=5">
      <rect width="540" height="220" fill="var(--color-bg)" rx="8" />
      <polygon points="180,170 180,60 330,170" fill="var(--color-primary-light)" stroke="var(--color-primary)" stroke-width="2.5" />
      <rect x="180" y="152" width="18" height="18" fill="none" stroke="var(--color-primary)" stroke-width="2" />
      
      <text x="150" y="120" font-size="13" font-weight="bold" fill="var(--color-text)">a = 3</text>
      <text x="245" y="196" font-size="13" font-weight="bold" fill="var(--color-text)">b = 4</text>
      <text x="275" y="105" font-size="14" font-weight="bold" fill="var(--color-primary)">c = 5</text>

      <rect x="70" y="60" width="110" height="110" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" />
      <text x="125" y="120" font-size="12" font-weight="bold" text-anchor="middle" fill="#475569">Area = 9</text>

      <rect x="180" y="170" width="150" height="40" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" />
      <text x="255" y="195" font-size="12" font-weight="bold" text-anchor="middle" fill="#475569">Area = 16</text>

      <rect x="360" y="45" width="160" height="130" rx="6" fill="var(--color-surface)" stroke="var(--color-primary)" stroke-width="2" />
      <text x="440" y="75" font-size="12" font-weight="bold" text-anchor="middle" fill="var(--color-primary)">THE THEOREM</text>
      <text x="440" y="110" font-size="18" font-weight="800" text-anchor="middle" fill="var(--color-text)">a² + b² = c²</text>
      <text x="440" y="145" font-size="12" text-anchor="middle" fill="#475569">3² + 4² = 9 + 16 = 25</text>
      <text x="440" y="162" font-size="11" font-weight="bold" text-anchor="middle" fill="var(--color-primary)">√25 = 5</text>
    </svg>`,
    textDiagramFallback: `[TEXT DIAGRAM: Right Triangle Geometry]
Formula: a² + b² = c²
Where:
- 'a' is the vertical leg length (altitude)
- 'b' is the horizontal leg length (base)
- 'c' is the longest side opposite the 90° right angle (hypotenuse)
Example 3-4-5 Triangle:
3² + 4² = 9 + 16 = 25 = 5²`,
    diagramCaption: 'Figure 2: Geometric proof concept showing leg areas a² and b² summing to hypotenuse area c².',
    keyConcepts: [
      { title: 'The Core Condition', desc: 'The theorem applies strictly to triangles containing exactly one 90-degree right angle.' },
      { title: 'The Hypotenuse', desc: 'Always the longest side, located directly opposite the right angle.' },
      { title: 'Pythagorean Triples', desc: 'Sets of positive integers satisfying the equation, such as (3, 4, 5), (5, 12, 13), and (8, 15, 17).' }
    ],
    contentSections: [
      {
        heading: '1. What is the Theorem?',
        paragraphs: [
          'In any right-angled Euclidean triangle, the area of the square whose side is the hypotenuse is equal to the sum of the areas of the squares on the other two sides.',
          'Algebraically, this is expressed as: a² + b² = c², where c represents the hypotenuse length, and a and b denote the lengths of the two perpendicular legs.'
        ]
      },
      {
        heading: '2. Worked Step-by-Step Example',
        paragraphs: [
          'Problem: A utility pole is 8 meters tall. A guy-wire anchors from the top of the pole to a ground stake 6 meters away from the base. How long must the wire be?',
          'Step 1: Identify known legs: a = 8 m, b = 6 m.',
          'Step 2: Apply theorem: c² = 8² + 6² = 64 + 36 = 100.',
          'Step 3: Extract square root: c = √100 = 10 meters.'
        ],
        keyTakeaway: 'The guy-wire must be exactly 10 meters long.'
      }
    ],
    definitions: [
      { term: 'Hypotenuse', definition: 'The longest side of a right-angled triangle, located opposite the right (90°) angle.' },
      { term: 'Legs (Catheti)', definition: 'The two perpendicular line segments that meet to form the 90° right angle.' },
      { term: 'Square Root (√)', definition: 'A number that, when multiplied by itself, produces the given value.' }
    ],
    quiz: [
      {
        id: 201,
        subjectId: 'math',
        subjectName: 'Mathematics',
        difficulty: 'level-1',
        difficultyLabel: 'Level 1: Foundation',
        question: 'Where is the hypotenuse always located in a right triangle?',
        options: ['Adjacent to the smallest angle', 'Directly opposite the 90° right angle', 'Along the bottom baseline', 'Any arbitrary side'],
        correctIndex: 1,
        explanation: 'The hypotenuse is always strictly opposite the 90-degree right angle and is the longest side.'
      },
      {
        id: 202,
        subjectId: 'math',
        subjectName: 'Mathematics',
        difficulty: 'level-2',
        difficultyLabel: 'Level 2: Intermediate',
        question: 'If a right triangle has legs of lengths a = 3 and b = 4, what is the length of hypotenuse c?',
        options: ['5', '6', '7', '12'],
        correctIndex: 0,
        explanation: '3² + 4² = 9 + 16 = 25. The square root of 25 is 5.'
      },
      {
        id: 203,
        subjectId: 'math',
        subjectName: 'Mathematics',
        difficulty: 'level-2',
        difficultyLabel: 'Level 2: Intermediate',
        question: 'If a triangle has hypotenuse c = 13 and one leg a = 5, what is leg b?',
        options: ['8', '12', '10', '7'],
        correctIndex: 1,
        explanation: 'b = √(13² - 5²) = √(169 - 25) = √144 = 12.'
      },
      {
        id: 204,
        subjectId: 'math',
        subjectName: 'Mathematics',
        difficulty: 'level-3',
        difficultyLabel: 'Level 3: Advanced',
        question: 'A ship sails 9 km North, then 12 km East. What is the direct straight-line distance from its starting point?',
        options: ['21 km', '15 km', '17 km', '13.5 km'],
        correctIndex: 1,
        explanation: 'North and East form a perpendicular 90° angle. Distance = √(9² + 12²) = √(81 + 144) = √225 = 15 km.'
      }
    ]
  },
  {
    id: 'physics-circuits',
    subject: 'Physics & Electrical',
    subjectId: 'physics',
    title: 'Electric Circuits & Ohm\'s Law',
    level: 'Secondary',
    readTime: '4 min read',
    payloadSize: '13.5 KB',
    summary: 'Understand electrical potential (voltage), charge flow (current), and opposition to current (resistance) governed by V = I × R.',
    svgDiagram: `<svg viewBox="0 0 540 220" width="100%" height="auto" class="svg-diagram svg-flow-path" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DC electric circuit schematic showing DC battery voltage source, switch, conductor path, and resistor load">
      <rect width="540" height="220" fill="var(--color-bg)" rx="8" />
      <rect x="70" y="40" width="400" height="140" fill="none" stroke="#334155" stroke-width="2.5" rx="6" />

      <rect x="62" y="90" width="16" height="40" fill="var(--color-surface)" />
      <line x1="58" y1="100" x2="82" y2="100" stroke="#1d4ed8" stroke-width="3.5" />
      <line x1="64" y1="120" x2="76" y2="120" stroke="#1d4ed8" stroke-width="2.5" />
      <text x="35" y="105" font-size="12" font-weight="bold" fill="#1d4ed8">+ V</text>
      <text x="35" y="125" font-size="12" font-weight="bold" fill="#1d4ed8">-</text>
      <text x="25" y="145" font-size="10" font-weight="bold" fill="#475569">DC Battery</text>

      <rect x="220" y="32" width="60" height="16" fill="var(--color-surface)" />
      <circle cx="230" cy="40" r="3.5" fill="#0f172a" />
      <circle cx="270" cy="40" r="3.5" fill="#0f172a" />
      <line x1="230" y1="40" x2="265" y2="30" stroke="#0f172a" stroke-width="2.5" />
      <text x="250" y="22" font-size="10" font-weight="bold" text-anchor="middle" fill="#475569">Closed Switch</text>

      <rect x="460" y="85" width="20" height="50" fill="var(--color-surface)" />
      <path d="M 470 85 L 478 92 L 462 100 L 478 108 L 462 116 L 478 124 L 470 135" fill="none" stroke="#d97706" stroke-width="3" />
      <text x="495" y="112" font-size="13" font-weight="bold" fill="#d97706">R (Load)</text>

      <path d="M 330 180 L 220 180" stroke="#059669" stroke-width="2.5" />
      <polygon points="215,180 226,175 226,185" fill="#059669" />
      <text x="275" y="202" font-size="11" font-weight="bold" text-anchor="middle" fill="#059669">Current I (Amperes)</text>

      <rect x="140" y="75" width="160" height="75" rx="6" fill="var(--color-surface)" stroke="#94a3b8" stroke-width="1.5" />
      <text x="220" y="94" font-size="11" font-weight="bold" text-anchor="middle" fill="var(--color-primary)">OHM'S LAW</text>
      <text x="220" y="118" font-size="18" font-weight="800" text-anchor="middle" fill="var(--color-text)">V = I × R</text>
    </svg>`,
    textDiagramFallback: `[TEXT SCHEMATIC: Simple Electric Circuit]
+---[ Switch ]-------------------+
|                                |
[ Battery ]                   [ Resistor (R) ]
(Voltage V)                      |
|                                |
+---<--[ Current I (Amps) ]------+
Formula: V = I * R`,
    diagramCaption: 'Figure 3: Closed DC loop illustrating voltage driving current through resistive load.',
    keyConcepts: [
      { title: 'Voltage (V)', desc: 'The electric pressure or potential difference that drives charge carriers (measured in Volts).' },
      { title: 'Current (I)', desc: 'The rate of electrical charge flow past a point in circuit (measured in Amperes).' },
      { title: 'Resistance (R)', desc: 'The material opposition to electric charge movement (measured in Ohms, symbol Ω).' }
    ],
    contentSections: [
      {
        heading: '1. What Drives Electricity?',
        paragraphs: [
          'An electric circuit is an unbroken conductive pathway enabling continuous flow of mobile valence electrons.',
          'Ohm\'s Law describes the mathematical proportionality between potential difference (voltage), electric current, and resistance in an ideal conductor.'
        ]
      },
      {
        heading: '2. Applying Ohm\'s Law Equations',
        paragraphs: [
          'If a circuit is powered by a 12-Volt battery connected across a 4-Ohm heating element resistor, what current flows?',
          'Formula: I = V / R',
          'Calculation: I = 12 V / 4 Ω = 3 Amperes (A).'
        ],
        keyTakeaway: 'Increasing voltage increases current; increasing resistance decreases current.'
      }
    ],
    definitions: [
      { term: 'Volt (V)', definition: 'Unit of electric potential difference; one volt propels one ampere of current through one ohm of resistance.' },
      { term: 'Ampere (A)', definition: 'Standard SI unit of electric current; represents one Coulomb of charge passing per second.' },
      { term: 'Ohm (Ω)', definition: 'Unit of electrical resistance named after physicist Georg Ohm.' }
    ],
    quiz: [
      {
        id: 301,
        subjectId: 'physics',
        subjectName: 'Physics & Electrical',
        difficulty: 'level-1',
        difficultyLabel: 'Level 1: Foundation',
        question: 'What is the electrical SI unit used to measure resistance?',
        options: ['Watt', 'Ampere', 'Volt', 'Ohm (Ω)'],
        correctIndex: 3,
        explanation: 'Resistance is measured in Ohms (symbolized by the Greek letter Omega, Ω).'
      },
      {
        id: 302,
        subjectId: 'physics',
        subjectName: 'Physics & Electrical',
        difficulty: 'level-1',
        difficultyLabel: 'Level 1: Foundation',
        question: 'According to Ohm\'s Law, what happens to current if voltage is doubled while resistance stays constant?',
        options: ['Current doubles', 'Current halves', 'Current stays unchanged', 'Current drops to zero'],
        correctIndex: 0,
        explanation: 'Because I = V / R, current is directly proportional to voltage. Doubling V doubles I.'
      },
      {
        id: 303,
        subjectId: 'physics',
        subjectName: 'Physics & Electrical',
        difficulty: 'level-2',
        difficultyLabel: 'Level 2: Intermediate',
        question: 'A 24V battery is connected across a 6 Ohm heating element. How much current flows?',
        options: ['144 Amps', '4 Amps', '0.25 Amps', '18 Amps'],
        correctIndex: 1,
        explanation: 'Using I = V / R: 24 Volts / 6 Ohms = 4 Amperes.'
      },
      {
        id: 304,
        subjectId: 'physics',
        subjectName: 'Physics & Electrical',
        difficulty: 'level-3',
        difficultyLabel: 'Level 3: Advanced',
        question: 'If electric power is given by P = V × I = I²R, how much power is dissipated by a 10 Ohm resistor carrying 3 Amps?',
        options: ['30 Watts', '90 Watts', '300 Watts', '900 Watts'],
        correctIndex: 1,
        explanation: 'P = I² × R = (3 A)² × 10 Ω = 9 × 10 = 90 Watts of heat power dissipated.'
      }
    ]
  },
  {
    id: 'health-water-sanitation',
    subject: 'Health & Sanitation',
    subjectId: 'health',
    title: 'Safe Drinking Water & Low-Cost Purification',
    level: 'Foundational / Life Skills',
    readTime: '3 min read',
    payloadSize: '12.4 KB',
    summary: 'Practical, low-resource purification protocols: 3-pot settling, boiling, solar disinfection (SODIS), and chlorination.',
    svgDiagram: `<svg viewBox="0 0 540 220" width="100%" height="auto" class="svg-diagram svg-flow-path" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three pot water sedimentation and filtration system diagram">
      <rect width="540" height="220" fill="var(--color-bg)" rx="8" />
      
      <!-- Pot 1 -->
      <path d="M 50 160 C 50 100 70 80 110 80 C 150 80 170 100 170 160 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2" />
      <ellipse cx="110" cy="80" rx="60" ry="12" fill="#ffedd5" stroke="#c2410c" stroke-width="2" />
      <text x="110" y="125" font-size="11" font-weight="bold" text-anchor="middle" fill="#7c2d12">POT 1</text>
      <text x="110" y="140" font-size="9" text-anchor="middle" fill="#7c2d12">Raw Water</text>
      <text x="110" y="180" font-size="9" text-anchor="middle" fill="#475569">Heavy dirt settles (24h)</text>

      <path d="M 175 110 Q 200 90 225 110" fill="none" stroke="#0284c7" stroke-width="2" />
      <polygon points="225,110 216,105 218,114" fill="#0284c7" />

      <!-- Pot 2 -->
      <path d="M 230 160 C 230 100 250 80 290 80 C 330 80 350 100 350 160 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2" />
      <ellipse cx="290" cy="80" rx="60" ry="12" fill="#ffedd5" stroke="#c2410c" stroke-width="2" />
      <text x="290" y="125" font-size="11" font-weight="bold" text-anchor="middle" fill="#7c2d12">POT 2</text>
      <text x="290" y="140" font-size="9" text-anchor="middle" fill="#7c2d12">Settling 24h</text>
      <text x="290" y="180" font-size="9" text-anchor="middle" fill="#475569">Fine sediment drops</text>

      <path d="M 355 110 Q 380 90 405 110" fill="none" stroke="#0284c7" stroke-width="2" />
      <polygon points="405,110 396,105 398,114" fill="#0284c7" />

      <!-- Pot 3 -->
      <path d="M 410 160 C 410 100 430 80 470 80 C 510 80 530 100 530 160 Z" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2" />
      <ellipse cx="470" cy="80" rx="60" ry="12" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2" />
      <text x="470" y="125" font-size="11" font-weight="bold" text-anchor="middle" fill="#1e3a8a">POT 3</text>
      <text x="470" y="140" font-size="9" text-anchor="middle" fill="#1e3a8a">Clean Storage</text>
      <text x="470" y="180" font-size="9" text-anchor="middle" fill="#047857">Boil or Chlorine</text>
      
      <text x="270" y="30" font-size="13" font-weight="bold" text-anchor="middle" fill="var(--color-text)">Three-Pot Water Treatment System</text>
    </svg>`,
    textDiagramFallback: `[TEXT DIAGRAM: Three-Pot Water Treatment]
Raw Water -> POT 1 (Wait 24h: Heavy dirt settles)
             -> POT 2 (Wait 24h: Fine silt settles)
             -> POT 3 (Store with lid. Boil for 1 min or chlorine tablet)`,
    diagramCaption: 'Figure 4: The 3-pot natural sedimentation method dramatically reduces water turbidity and pathogen load.',
    keyConcepts: [
      { title: 'The Boiling Benchmark', desc: 'Bringing water to a rolling boil for 1 full minute inactivates virtually all enteric pathogens.' },
      { title: 'SODIS (Solar Disinfection)', desc: 'Transparent PET plastic bottles placed on corrugated zinc roofs in sunlight for 6 hours kill germs via UV-A and thermal pasteurization.' },
      { title: 'Turbidity Removal', desc: 'Clear water is essential before chemical disinfection; dirt particles shield viruses from chlorine and UV rays.' }
    ],
    contentSections: [
      {
        heading: '1. Why Water Safety Matters',
        paragraphs: [
          'Contaminated drinking water transmits deadly infectious diseases, including cholera, dysentery, hepatitis A, and typhoid.',
          'Water safety requires two fundamental steps: First clarification (removing mud and debris), followed by microbiological disinfection (killing invisible bacteria and viruses).'
        ]
      }
    ],
    definitions: [
      { term: 'Turbidity', definition: 'The cloudiness or haziness of a fluid caused by suspended particulate matter.' },
      { term: 'Pathogen', definition: 'A biological agent (bacterium, virus, protozoan) that causes infectious disease in its host.' }
    ],
    quiz: [
      {
        id: 401,
        subjectId: 'health',
        subjectName: 'Health & Sanitation',
        difficulty: 'level-1',
        difficultyLabel: 'Level 1: Foundation',
        question: 'How long should water be brought to a rolling boil to guarantee pathogen destruction?',
        options: ['10 seconds', '1 full minute', '30 minutes', '1 hour'],
        correctIndex: 1,
        explanation: 'The World Health Organization (WHO) specifies that 1 full minute of rolling boil kills virtually all bacteria and viruses.'
      },
      {
        id: 402,
        subjectId: 'health',
        subjectName: 'Health & Sanitation',
        difficulty: 'level-2',
        difficultyLabel: 'Level 2: Intermediate',
        question: 'In the SODIS method, why must bottles be clear PET plastic and not tinted glass or PVC?',
        options: ['Tinted glass melts', 'PET transmits solar UV-A radiation, whereas tinted glass blocks it', 'PVC makes water taste sweet', 'Clear bottles look prettier'],
        correctIndex: 1,
        explanation: 'PET plastic allows germicidal solar UV-A light to penetrate, whereas colored glass or thick PVC absorbs the UV rays.'
      },
      {
        id: 403,
        subjectId: 'health',
        subjectName: 'Health & Sanitation',
        difficulty: 'level-3',
        difficultyLabel: 'Level 3: Advanced',
        question: 'If water turbidity exceeds 30 NTU (visibly cloudy), why will chlorine tablets fail to disinfect properly?',
        options: ['Chlorine boils off', 'Suspended silt particles physically shield internalized pathogens from chemical contact', 'Mud neutralizes acid', 'Turbidity creates chlorine gas'],
        correctIndex: 1,
        explanation: 'Suspended organic and mineral colloids shield adsorbed pathogens, allowing viable microbes to survive disinfection.'
      }
    ]
  },
  {
    id: 'cs-internet-packets',
    subject: 'Digital Literacy & CS',
    subjectId: 'cs',
    title: 'How the Internet Works: Packets, IP & Protocols',
    level: 'Foundational / Secondary',
    readTime: '4 min read',
    payloadSize: '15.1 KB',
    summary: 'Demystifying the worldwide network: how files are sliced into small packets, routed over cables and cell towers, and reassembled.',
    svgDiagram: `<svg viewBox="0 0 540 220" width="100%" height="auto" class="svg-diagram svg-flow-path" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing internet packet routing">
      <rect width="540" height="220" fill="var(--color-bg)" rx="8" />
      <rect x="30" y="70" width="45" height="85" rx="8" fill="var(--color-surface)" stroke="#1d4ed8" stroke-width="2.5" />
      <rect x="36" y="80" width="33" height="60" fill="var(--color-primary-light)" />
      <text x="52" y="172" font-size="10" font-weight="bold" text-anchor="middle" fill="var(--color-text)">Phone (2G)</text>

      <line x1="140" y1="160" x2="140" y2="70" stroke="#475569" stroke-width="3.5" />
      <polygon points="140,65 125,95 155,95" fill="none" stroke="#475569" stroke-width="2.5" />
      <text x="140" y="178" font-size="10" font-weight="bold" text-anchor="middle" fill="#475569">Cell Tower</text>

      <circle cx="270" cy="110" r="45" fill="var(--color-surface)" stroke="#059669" stroke-width="2.5" />
      <text x="270" y="105" font-size="11" font-weight="bold" text-anchor="middle" fill="#065f46">ROUTER</text>

      <rect x="420" y="70" width="75" height="90" rx="6" fill="var(--color-surface)" stroke="#1d4ed8" stroke-width="2.5" />
      <text x="457" y="178" font-size="10" font-weight="bold" text-anchor="middle" fill="var(--color-text)">Server</text>
    </svg>`,
    textDiagramFallback: `[TEXT DIAGRAM: Packet Switching]
Phone (Requests Page) -> Cell Tower (Radio waves) -> Internet Router (Reads IP Header) -> Web Server`,
    diagramCaption: 'Figure 5: Information packets navigate cellular towers, fiber optics, and servers.',
    keyConcepts: [
      { title: 'Packet Switching', desc: 'Large documents are sliced into standardized chunks (packets ~1500 bytes).' },
      { title: 'IP Addresses', desc: 'Unique digital coordinates directing packets to their destination.' }
    ],
    contentSections: [
      {
        heading: '1. Slicing Files into Packets',
        paragraphs: [
          'The internet does not transmit entire books, videos, or songs as single unbroken streams. Instead, transmission protocols slice data into tiny standardized packets.'
        ]
      }
    ],
    definitions: [
      { term: 'IP Address', definition: 'A numerical identifier assigned to every device connected to a computer network.' },
      { term: 'Latency', definition: 'The round-trip delay time taken for a data packet to travel to destination and back.' }
    ],
    quiz: [
      {
        id: 501,
        subjectId: 'cs',
        subjectName: 'Digital Literacy & CS',
        difficulty: 'level-1',
        difficultyLabel: 'Level 1: Foundation',
        question: 'What information does an IP packet header contain so it reaches its destination?',
        options: ['The user battery percentage', 'Source and destination IP addresses', 'The device price', 'The keyboard layout'],
        correctIndex: 1,
        explanation: 'The header contains routing instructions, most critically the source and destination IP addresses.'
      },
      {
        id: 502,
        subjectId: 'cs',
        subjectName: 'Digital Literacy & CS',
        difficulty: 'level-2',
        difficultyLabel: 'Level 2: Intermediate',
        question: 'On a slow 2G connection (50 kbps), roughly how long would a heavy 5 Megabyte (5,000 KB) page take to load?',
        options: ['1 second', '13.3 minutes', '5 hours', '10 milliseconds'],
        correctIndex: 1,
        explanation: '5,000 KB * 8 = 40,000 kilobits. At 50 kbps, 40,000 / 50 = 800 seconds (~13.3 minutes).'
      },
      {
        id: 503,
        subjectId: 'cs',
        subjectName: 'Digital Literacy & CS',
        difficulty: 'level-3',
        difficultyLabel: 'Level 3: Advanced',
        question: 'In TCP/IP transmission on lossy 2G mobile networks, what protocol mechanism guarantees data integrity when a packet is dropped?',
        options: ['Packet inflation', 'TCP Acknowledgements (ACK) and Automatic Repeat Request (ARQ)', 'Increasing screen brightness', 'Switching to analog radio'],
        correctIndex: 1,
        explanation: 'TCP requires explicit ACKs from the receiver; unacknowledged packets trigger retransmission via ARQ timeouts.'
      }
    ]
  },
  {
    id: 'earth-water-cycle',
    subject: 'Earth Science',
    subjectId: 'earth',
    title: 'The Global Hydrological (Water) Cycle',
    level: 'Secondary',
    readTime: '3 min read',
    payloadSize: '12.9 KB',
    summary: 'The continuous planetary circulation of water between oceans, atmosphere, terrestrial landscapes, and aquifers.',
    svgDiagram: `<svg viewBox="0 0 540 220" width="100%" height="auto" class="svg-diagram svg-flow-path" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Global hydrological water cycle diagram">
      <rect width="540" height="220" fill="var(--color-bg)" rx="8" />
      <circle cx="80" cy="50" r="26" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" class="svg-sun-glow" />
      <text x="80" y="55" font-size="10" font-weight="bold" text-anchor="middle" fill="#854d0e">Sun Heat</text>
      <path d="M 0 160 Q 90 150 180 160 L 180 220 L 0 220 Z" fill="#bfdbfe" stroke="#0284c7" stroke-width="2" />
      <text x="80" y="195" font-size="12" font-weight="bold" fill="#0369a1">Ocean</text>
      <path d="M 230 65 C 230 50 250 40 270 45 C 285 35 315 40 320 55 C 335 55 345 70 335 85 C 315 90 240 90 230 65 Z" fill="var(--color-surface)" stroke="#94a3b8" stroke-width="2.5" />
      <text x="280" y="70" font-size="11" font-weight="bold" text-anchor="middle" fill="#334155">Condensation</text>
      <polygon points="180,160 380,80 540,220 180,220" fill="#e2e8f0" stroke="#64748b" stroke-width="2" />
      <text x="420" y="130" font-size="11" font-weight="bold" fill="#475569">Mountain</text>
      <path d="M 380 140 Q 280 170 180 170" fill="none" stroke="#0284c7" stroke-width="3.5" />
      <text x="260" y="195" font-size="11" font-weight="bold" fill="#0369a1">Runoff -> Ocean</text>
    </svg>`,
    textDiagramFallback: `[TEXT DIAGRAM: The Water Cycle]
Solar Heat -> Evaporates Ocean Water -> Condenses into clouds -> Precipitation -> Runoff into Ocean`,
    diagramCaption: 'Figure 6: The continuous closed-loop thermodynamic distillation mechanism of Earth\'s hydrosphere.',
    keyConcepts: [
      { title: 'A Closed System', desc: 'Earth does not gain or lose water; molecules cycle continuously.' },
      { title: 'The Energy Driver', desc: 'Solar radiation provides thermal energy to break hydrogen bonds, causing evaporation.' }
    ],
    contentSections: [
      {
        heading: '1. Phase Changes of Water',
        paragraphs: [
          'Water occurs abundantly in solid ice, liquid water, and gaseous vapor, cycling via evaporation, condensation, and precipitation.'
        ]
      }
    ],
    definitions: [
      { term: 'Transpiration', definition: 'The release of water vapor through the stomata of plant leaves.' },
      { term: 'Aquifer', definition: 'An underground geological formation containing permeable freshwater.' }
    ],
    quiz: [
      {
        id: 601,
        subjectId: 'earth',
        subjectName: 'Earth Science',
        difficulty: 'level-1',
        difficultyLabel: 'Level 1: Foundation',
        question: 'What is the primary source of thermal energy driving Earth\'s water cycle?',
        options: ['Geothermal volcanic vents', 'Solar radiation from the Sun', 'Ocean tides', 'Wind currents'],
        correctIndex: 1,
        explanation: 'The Sun supplies the thermal radiant energy required to evaporate water across planetary surfaces.'
      },
      {
        id: 602,
        subjectId: 'earth',
        subjectName: 'Earth Science',
        difficulty: 'level-2',
        difficultyLabel: 'Level 2: Intermediate',
        question: 'What term describes water vapor released specifically from the microscopic pores of living plant leaves?',
        options: ['Transpiration', 'Infiltration', 'Sublimation', 'Percolation'],
        correctIndex: 0,
        explanation: 'Transpiration is the biological release of water vapor through stomata during gas exchange.'
      },
      {
        id: 603,
        subjectId: 'earth',
        subjectName: 'Earth Science',
        difficulty: 'level-3',
        difficultyLabel: 'Level 3: Advanced',
        question: 'Why does excessive groundwater extraction from coastal aquifers cause irreversible saltwater intrusion?',
        options: ['Ocean water boils', 'Hydraulic freshwater head drops below sea level, drawing denser marine brine inland', 'Salt dissolves rock', 'Aquifers lose sunlight'],
        correctIndex: 1,
        explanation: 'Lowering the hydraulic piezometric head of the freshwater lens allows denser oceanic saltwater to migrate into freshwater wells.'
      }
    ]
  }
];

// ==========================================================================
// INTERACTIVE FLASHCARDS DATASET (WITH 3 DIFFICULTY TIERS)
// ==========================================================================

export const FLASHCARDS: Flashcard[] = [
  // BIOLOGY FLASHCARDS
  {
    id: 1,
    subjectId: 'biology',
    subjectName: 'Biology & Life',
    difficulty: 'level-1',
    difficultyLabel: 'Level 1: Foundation',
    front: 'What is the primary organelle where photosynthesis takes place?',
    back: 'The Chloroplast. Contains green chlorophyll pigments organized in thylakoid discs.',
    formulaOrKey: 'Chloroplast = Photosynthesis power center',
    hint: 'Think of the green pigment inside plant cells'
  },
  {
    id: 2,
    subjectId: 'biology',
    subjectName: 'Biology & Life',
    difficulty: 'level-2',
    difficultyLabel: 'Level 2: Intermediate',
    front: 'State the complete balanced chemical equation for photosynthesis.',
    back: '6 CO2 + 6 H2O + Light Energy → C6H12O6 + 6 O2',
    formulaOrKey: '6 Carbon Dioxide + 6 Water → 1 Glucose + 6 Oxygen',
    hint: 'Six carbons in, six carbons out'
  },
  {
    id: 3,
    subjectId: 'biology',
    subjectName: 'Biology & Life',
    difficulty: 'level-3',
    difficultyLabel: 'Level 3: Advanced',
    front: 'Differentiate between Light-Dependent Reactions and the Calvin Cycle.',
    back: 'Light-Dependent reactions occur in thylakoids, splitting H2O to make ATP, NADPH, and O2. The Calvin Cycle occurs in the stroma, using ATP & NADPH to fix CO2 into glucose.',
    formulaOrKey: 'Thylakoid (Light & H2O) vs Stroma (Dark & CO2)',
    hint: 'One splits water; one fixes carbon'
  },

  // MATHEMATICS FLASHCARDS
  {
    id: 4,
    subjectId: 'math',
    subjectName: 'Mathematics',
    difficulty: 'level-1',
    difficultyLabel: 'Level 1: Foundation',
    front: 'What is the Pythagorean Theorem formula for right triangles?',
    back: 'a² + b² = c² (where c is the hypotenuse opposite the 90° right angle, and a and b are perpendicular legs).',
    formulaOrKey: 'c = √(a² + b²)',
    hint: 'Square of leg 1 + square of leg 2 = square of hypotenuse'
  },
  {
    id: 5,
    subjectId: 'math',
    subjectName: 'Mathematics',
    difficulty: 'level-2',
    difficultyLabel: 'Level 2: Intermediate',
    front: 'What are the two most famous integer Pythagorean Triples?',
    back: '(3, 4, 5) because 9 + 16 = 25.\n(5, 12, 13) because 25 + 144 = 169.',
    formulaOrKey: '3-4-5 and 5-12-13',
    hint: 'Both sets produce exact whole integer squares'
  },
  {
    id: 6,
    subjectId: 'math',
    subjectName: 'Mathematics',
    difficulty: 'level-3',
    difficultyLabel: 'Level 3: Advanced',
    front: 'How do you find an unknown perpendicular leg if you know hypotenuse c and one leg a?',
    back: 'Rearrange to: b = √(c² - a²). Always subtract the known leg square from the hypotenuse square.',
    formulaOrKey: 'b = √(c² - a²)',
    hint: 'Never add to the hypotenuse; subtract from it'
  },

  // PHYSICS FLASHCARDS
  {
    id: 7,
    subjectId: 'physics',
    subjectName: 'Physics & Electrical',
    difficulty: 'level-1',
    difficultyLabel: 'Level 1: Foundation',
    front: 'What is Ohm\'s Law and what are its standard SI units?',
    back: 'V = I × R\n• V: Voltage (Volts, V)\n• I: Current (Amperes, A)\n• R: Resistance (Ohms, Ω)',
    formulaOrKey: 'Voltage = Current × Resistance',
    hint: 'VIR triangle formula'
  },
  {
    id: 8,
    subjectId: 'physics',
    subjectName: 'Physics & Electrical',
    difficulty: 'level-2',
    difficultyLabel: 'Level 2: Intermediate',
    front: 'A light bulb has 12 Ω resistance and runs on 120 V mains. What current flows?',
    back: 'I = V / R = 120 V / 12 Ω = 10 Amperes (A).',
    formulaOrKey: 'I = 120 / 12 = 10 A',
    hint: 'Divide potential by resistance'
  },
  {
    id: 9,
    subjectId: 'physics',
    subjectName: 'Physics & Electrical',
    difficulty: 'level-3',
    difficultyLabel: 'Level 3: Advanced',
    front: 'What is electrical power (Watts) and how does it relate to Ohm\'s Law?',
    back: 'P = V × I. By substituting Ohm\'s Law, P = I²R and P = V² / R. If current doubles through a fixed resistor, heat dissipation quadruples!',
    formulaOrKey: 'P = V × I = I²R = V²/R',
    hint: 'Joule heating is quadratic with current'
  },

  // HEALTH & SANITATION FLASHCARDS
  {
    id: 10,
    subjectId: 'health',
    subjectName: 'Health & Sanitation',
    difficulty: 'level-1',
    difficultyLabel: 'Level 1: Foundation',
    front: 'What is the minimum boiling time required to kill drinking water pathogens?',
    back: '1 full minute of rolling vigorous boil (or 3 minutes at high altitude elevations above 2000m).',
    formulaOrKey: '60 Seconds of Rolling Boil',
    hint: 'Not just warm; rolling bubbles for one minute'
  },
  {
    id: 11,
    subjectId: 'health',
    subjectName: 'Health & Sanitation',
    difficulty: 'level-2',
    difficultyLabel: 'Level 2: Intermediate',
    front: 'Explain the SODIS (Solar Water Disinfection) protocol.',
    back: 'Fill clean, clear PET bottles (under 2 liters) with low-turbidity water. Place horizontally on a metal/corrugated roof in direct midday sun for at least 6 hours.',
    formulaOrKey: 'Clear PET + 6 Hours Midday Sun',
    hint: 'Combines solar UV-A radiation with pasteurizing heat'
  },
  {
    id: 12,
    subjectId: 'health',
    subjectName: 'Health & Sanitation',
    difficulty: 'level-3',
    difficultyLabel: 'Level 3: Advanced',
    front: 'Why does the 3-pot sedimentation method dramatically improve chemical chlorination efficacy?',
    back: 'Chlorine cannot penetrate solid suspended dirt particles where pathogens hide. Settling water for 24-48 hours drops turbidity below 5 NTU, allowing chlorine to directly contact cell membranes.',
    formulaOrKey: 'Clarification First → Disinfection Second',
    hint: 'Dirt particles physically shield bacteria from disinfectants'
  },

  // COMPUTER SCIENCE FLASHCARDS
  {
    id: 13,
    subjectId: 'cs',
    subjectName: 'Digital Literacy & CS',
    difficulty: 'level-1',
    difficultyLabel: 'Level 1: Foundation',
    front: 'What is a network packet and what does its header contain?',
    back: 'A packet is a small segment (~1.5 KB) of a larger digital file. Its header carries the sender IP address, receiver destination IP address, and sequence index number.',
    formulaOrKey: 'Packet = Header (Routing info) + Payload (Data)',
    hint: 'Like an envelope with a postal address'
  },
  {
    id: 14,
    subjectId: 'cs',
    subjectName: 'Digital Literacy & CS',
    difficulty: 'level-2',
    difficultyLabel: 'Level 2: Intermediate',
    front: 'Why does a 15 KB web page load in ~2 seconds on 2G EDGE while a 3 MB page fails?',
    back: '2G EDGE transfers ~50 kilobits/sec (~6.25 KB/sec). 15 KB requires ~2.4s. A 3,000 KB page requires 480 seconds (8 minutes), hitting server timeout thresholds.',
    formulaOrKey: '50 kbps = 6.25 KB/s throughput',
    hint: 'Multiply bytes by 8 to get bits'
  },
  {
    id: 15,
    subjectId: 'cs',
    subjectName: 'Digital Literacy & CS',
    difficulty: 'level-3',
    difficultyLabel: 'Level 3: Advanced',
    front: 'What is the critical difference between Bandwidth and Latency?',
    back: 'Bandwidth is transmission capacity (how wide the pipe is, e.g. 50 kbps vs 10 Mbps). Latency is round-trip propagation delay (how long a packet takes to travel to the server and back, e.g. 600ms on 2G vs 20ms on fiber).',
    formulaOrKey: 'Bandwidth = Volume capacity | Latency = Round-trip delay',
    hint: 'Width of pipe vs speed of travel'
  },

  // EARTH SCIENCE FLASHCARDS
  {
    id: 16,
    subjectId: 'earth',
    subjectName: 'Earth Science',
    difficulty: 'level-1',
    difficultyLabel: 'Level 1: Foundation',
    front: 'What are the three primary phase changes in the global water cycle?',
    back: '1. Evaporation (liquid to gas driven by sun heat)\n2. Condensation (gas to liquid clouds)\n3. Precipitation (rain, snow, or hail falling via gravity).',
    formulaOrKey: 'Evaporation → Condensation → Precipitation',
    hint: 'Rise up, form clouds, fall down'
  },
  {
    id: 17,
    subjectId: 'earth',
    subjectName: 'Earth Science',
    difficulty: 'level-2',
    difficultyLabel: 'Level 2: Intermediate',
    front: 'What is Transpiration and how does it contribute to local rain?',
    back: 'Transpiration is the evaporation of water vapor directly from microscopic pores (stomata) of plant leaves. Forests create atmospheric rivers that seed inland rainfall.',
    formulaOrKey: 'Plant transpiration = Biological water vapor pump',
    hint: 'Plant breathing of moisture'
  },
  {
    id: 18,
    subjectId: 'earth',
    subjectName: 'Earth Science',
    difficulty: 'level-3',
    difficultyLabel: 'Level 3: Advanced',
    front: 'What is an unconfined aquifer and how does surface percolation recharge it?',
    back: 'An unconfined aquifer has a permeable upper soil layer allowing rainwater to infiltrate directly down to the water table. Over-pumping lowers this water table below the root depth of crops and well bottoms.',
    formulaOrKey: 'Infiltration rate must equal or exceed extraction rate',
    hint: 'The permeable reservoir beneath our feet'
  }
];

export function getAllQuizQuestions(): QuizQuestion[] {
  return LESSONS.flatMap((lesson) => lesson.quiz);
}
