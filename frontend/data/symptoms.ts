import { AllergenSymptom } from '@/types';

const allergenSymptoms: AllergenSymptom[] = [
  {
    allergenId: 'peanuts',
    allergenName: 'Peanuts',
    symptoms: [
      'Skin reactions (hives, redness, swelling)',
      'Itching or tingling in or around the mouth and throat',
      'Digestive problems (diarrhea, stomach cramps, nausea, vomiting)',
      'Tightening of the throat',
      'Shortness of breath or wheezing',
      'Runny or congested nose',
      'Anaphylaxis (in severe cases)'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector (EpiPen) if prescribed',
      'Call emergency services if symptoms are severe',
      'Avoid any further contact with peanuts'
    ],
    whenToSeekHelp: [
      'Difficulty breathing or swallowing',
      'Swelling of the lips, tongue, or throat',
      'Feeling dizzy or faint',
      'Rapid heartbeat',
      'Drop in blood pressure',
      'Loss of consciousness'
    ]
  },
  {
    allergenId: 'tree_nuts',
    allergenName: 'Tree Nuts',
    symptoms: [
      'Abdominal pain, cramps, nausea, or vomiting',
      'Difficulty swallowing',
      'Itching of the mouth, throat, eyes, skin, or other areas',
      'Nasal congestion or a runny nose',
      'Shortness of breath',
      'Anaphylaxis (in severe cases)'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector (EpiPen) if prescribed',
      'Call emergency services if symptoms are severe',
      'Avoid any further contact with tree nuts'
    ],
    whenToSeekHelp: [
      'Severe swelling, especially of the face, lips, or tongue',
      'Trouble breathing or swallowing',
      'Dizziness or feeling faint',
      'Rapid pulse',
      'Drop in blood pressure',
      'Loss of consciousness'
    ]
  },
  {
    allergenId: 'milk',
    allergenName: 'Milk',
    symptoms: [
      'Hives',
      'Wheezing',
      'Itching or tingling around the lips or mouth',
      'Swelling of the lips, tongue, or throat',
      'Coughing or shortness of breath',
      'Vomiting',
      'Digestive problems like diarrhea, abdominal cramps'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector if prescribed for severe reactions',
      'Avoid all dairy products',
      'Read food labels carefully'
    ],
    whenToSeekHelp: [
      'Trouble breathing',
      'Swelling of the throat that makes it difficult to swallow',
      'Severe vomiting or diarrhea',
      'Dizziness or feeling faint',
      'Rapid heartbeat'
    ]
  },
  {
    allergenId: 'eggs',
    allergenName: 'Eggs',
    symptoms: [
      'Skin inflammation or hives',
      'Nasal congestion, runny nose, and sneezing',
      'Digestive symptoms (cramps, nausea, vomiting)',
      'Asthma symptoms (coughing, wheezing)',
      'Anaphylaxis (rare)'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector if prescribed for severe reactions',
      'Avoid all egg products',
      'Read food labels carefully'
    ],
    whenToSeekHelp: [
      'Severe skin reaction',
      'Difficulty breathing',
      'Swelling in the mouth or throat',
      'Persistent vomiting or diarrhea',
      'Signs of anaphylaxis'
    ]
  },
  {
    allergenId: 'wheat',
    allergenName: 'Wheat',
    symptoms: [
      'Swelling, itching or irritation of the mouth or throat',
      'Hives, itchy rash or swelling of the skin',
      'Nasal congestion',
      'Headache',
      'Difficulty breathing',
      'Cramps, nausea or vomiting',
      'Diarrhea',
      'Anaphylaxis (rare)'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector if prescribed for severe reactions',
      'Avoid all wheat products',
      'Read food labels carefully'
    ],
    whenToSeekHelp: [
      'Severe difficulty breathing',
      'Severe abdominal pain',
      'Swelling of the lips, tongue, or throat',
      'Feeling dizzy or faint',
      'Rapid heartbeat'
    ]
  },
  {
    allergenId: 'soy',
    allergenName: 'Soy',
    symptoms: [
      'Tingling in the mouth',
      'Hives, itching, or eczema',
      'Swelling of lips, face, tongue, throat, or other body parts',
      'Wheezing, runny nose, or breathing difficulty',
      'Abdominal pain, diarrhea, nausea, or vomiting',
      'Dizziness, lightheadedness, or fainting',
      'Anaphylaxis (rare)'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector if prescribed for severe reactions',
      'Avoid all soy products',
      'Read food labels carefully'
    ],
    whenToSeekHelp: [
      'Difficulty breathing',
      'Swelling of the throat',
      'Dizziness or fainting',
      'Rapid pulse',
      'Drop in blood pressure'
    ]
  },
  {
    allergenId: 'fish',
    allergenName: 'Fish',
    symptoms: [
      'Hives or skin rash',
      'Nausea, stomach cramps, indigestion, vomiting, or diarrhea',
      'Stuffy or runny nose and sneezing',
      'Headaches',
      'Asthma and breathing difficulties',
      'Anaphylaxis'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector if prescribed',
      'Call emergency services if symptoms are severe',
      'Avoid any further contact with fish'
    ],
    whenToSeekHelp: [
      'Difficulty breathing',
      'Swelling of the throat',
      'Severe drop in blood pressure',
      'Rapid pulse',
      'Dizziness or loss of consciousness'
    ]
  },
  {
    allergenId: 'shellfish',
    allergenName: 'Shellfish',
    symptoms: [
      'Hives, itching, or eczema',
      'Swelling of the lips, face, tongue, throat, or other parts of the body',
      'Wheezing, nasal congestion, or trouble breathing',
      'Abdominal pain, diarrhea, nausea, or vomiting',
      'Dizziness, lightheadedness, or fainting',
      'Anaphylaxis'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector if prescribed',
      'Call emergency services if symptoms are severe',
      'Avoid any further contact with shellfish'
    ],
    whenToSeekHelp: [
      'Constriction of airways',
      'Swelling of the throat that makes it difficult to breathe',
      'A severe drop in blood pressure',
      'Rapid pulse',
      'Dizziness, lightheadedness, or loss of consciousness'
    ]
  },
  {
    allergenId: 'sesame',
    allergenName: 'Sesame',
    symptoms: [
      'Redness, swelling, or itching of the skin',
      'Runny or congested nose',
      'Itchy, watery eyes',
      'Nausea, vomiting, or diarrhea',
      'Coughing or wheezing',
      'Anaphylaxis (in severe cases)'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector if prescribed',
      'Call emergency services if symptoms are severe',
      'Avoid any further contact with sesame'
    ],
    whenToSeekHelp: [
      'Difficulty breathing',
      'Swelling of the throat',
      'Severe drop in blood pressure',
      'Rapid pulse',
      'Dizziness or loss of consciousness'
    ]
  },
  {
    allergenId: 'gluten',
    allergenName: 'Gluten',
    symptoms: [
      'Digestive issues (bloating, diarrhea, constipation)',
      'Abdominal pain',
      'Nausea and vomiting',
      'Headaches or migraines',
      'Fatigue',
      'Joint and muscle pain',
      'Skin rashes (dermatitis herpetiformis)'
    ],
    firstAid: [
      'Avoid all gluten-containing products',
      'Read food labels carefully',
      'Consult with a healthcare provider for proper diagnosis and treatment'
    ],
    whenToSeekHelp: [
      'Severe abdominal pain',
      'Persistent diarrhea',
      'Unexplained weight loss',
      'Severe fatigue',
      'Malnutrition symptoms'
    ]
  },
  {
    allergenId: 'sulfites',
    allergenName: 'Sulfites',
    symptoms: [
      'Hives and itching',
      'Wheezing or difficulty breathing',
      'Stomach cramps',
      'Diarrhea',
      'Anaphylactic shock (rare)'
    ],
    firstAid: [
      'Take an antihistamine for mild symptoms',
      'Use an epinephrine auto-injector if prescribed for severe reactions',
      'Avoid foods and beverages containing sulfites',
      'Read food labels carefully'
    ],
    whenToSeekHelp: [
      'Severe difficulty breathing',
      'Swelling of the face, lips, or tongue',
      'Feeling faint or dizzy',
      'Rapid heartbeat',
      'Blue tint to the skin'
    ]
  }
];

export default allergenSymptoms;