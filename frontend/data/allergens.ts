import { Allergen } from '@/types';

const allergens: Allergen[] = [
  {
    id: 'peanuts',
    name: 'Peanuts',
    description: 'A legume commonly found in many foods and oils',
    aliases: ['groundnuts', 'arachis oil', 'beer nuts', 'monkey nuts'],
    severity: 'high',
  },
  {
    id: 'tree_nuts',
    name: 'Tree Nuts',
    description: 'Includes almonds, walnuts, cashews, and more',
    aliases: ['almonds', 'walnuts', 'cashews', 'hazelnuts', 'pecans', 'pistachios'],
    severity: 'high',
  },
  {
    id: 'milk',
    name: 'Milk',
    description: 'Dairy products including milk, cheese, butter, and yogurt',
    aliases: ['dairy', 'lactose', 'whey', 'casein', 'cream', 'cheese', 'butter'],
    severity: 'medium',
  },
  {
    id: 'eggs',
    name: 'Eggs',
    description: 'Chicken eggs and egg products',
    aliases: ['albumin', 'egg white', 'egg yolk', 'mayonnaise', 'meringue'],
    severity: 'medium',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    description: 'Found in many breads, pastas, and baked goods',
    aliases: ['flour', 'semolina', 'durum', 'spelt', 'farina', 'couscous'],
    severity: 'medium',
  },
  {
    id: 'soy',
    name: 'Soy',
    description: 'Soybeans and soy-derived products',
    aliases: ['soya', 'tofu', 'edamame', 'miso', 'tempeh', 'soy sauce'],
    severity: 'medium',
  },
  {
    id: 'fish',
    name: 'Fish',
    description: 'Various species of fish',
    aliases: ['cod', 'salmon', 'tuna', 'fish sauce', 'anchovy', 'surimi'],
    severity: 'high',
  },
  {
    id: 'shellfish',
    name: 'Shellfish',
    description: 'Includes crustaceans like shrimp, crab, and lobster',
    aliases: ['shrimp', 'crab', 'lobster', 'prawns', 'crayfish', 'scampi'],
    severity: 'high',
  },
  {
    id: 'sesame',
    name: 'Sesame',
    description: 'Seeds often found in breads and oils',
    aliases: ['tahini', 'sesame oil', 'sesame seeds', 'benne', 'gingelly'],
    severity: 'medium',
  },
  {
    id: 'gluten',
    name: 'Gluten',
    description: 'Protein found in wheat, barley, and rye',
    aliases: ['wheat', 'barley', 'rye', 'malt', 'brewer\'s yeast', 'triticale'],
    severity: 'medium',
  },
  {
    id: 'sulfites',
    name: 'Sulfites',
    description: 'Preservatives used in some foods and wines',
    aliases: ['sulfur dioxide', 'potassium bisulfite', 'sodium sulfite', 'E220-E228'],
    severity: 'medium',
  },
];

export default allergens;