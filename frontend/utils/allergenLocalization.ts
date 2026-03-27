import { Allergen } from '@/types';

type AllergenGroup = {
  key: string;
  thaiName: string;
  aliases: string[];
};

const allergenGroups: AllergenGroup[] = [
  {
    key: 'gluten',
    thaiName: 'กลูเตน',
    aliases: ['gluten', 'wheat', 'barley', 'rye', 'oats', 'ข้าวสาลี', 'ข้าวบาร์เลย์', 'ข้าวไรย์', 'ข้าวโอ๊ต'],
  },
  {
    key: 'crustaceans',
    thaiName: 'สัตว์น้ำที่มีเปลือกแข็ง',
    aliases: [
      'crustaceans',
      'crustacean shellfish',
      'shellfish',
      'shrimp',
      'prawn',
      'crab',
      'mantis shrimp',
      'lobster',
      'กุ้ง',
      'ปู',
      'กั้ง',
      'ล็อบสเตอร์',
      'สัตว์น้ำที่มีเปลือกแข็ง',
    ],
  },
  {
    key: 'eggs',
    thaiName: 'ไข่',
    aliases: ['eggs', 'egg', 'chicken eggs', 'duck eggs', 'ไข่ไก่', 'ไข่เป็ด', 'ไข่'],
  },
  {
    key: 'fish',
    thaiName: 'ปลา',
    aliases: ['fish', 'ปลา'],
  },
  {
    key: 'peanuts',
    thaiName: 'ถั่วลิสง',
    aliases: ['peanuts', 'peanut', 'peanut butter', 'ถั่วลิสง', 'เนยถั่วลิสง'],
  },
  {
    key: 'soybeans',
    thaiName: 'ถั่วเหลือง',
    aliases: ['soybeans', 'soybean', 'soy', 'tofu', 'soy sauce', 'soy milk', 'ถั่วเหลือง', 'เต้าหู้', 'ซีอิ๊ว', 'นมถั่วเหลือง'],
  },
  {
    key: 'milk',
    thaiName: 'นม',
    aliases: ['milk', 'dairy', 'lactose', 'cow milk', 'นม', 'ผลิตภัณฑ์นม', 'แลคโตส', 'นมวัว'],
  },
  {
    key: 'tree nuts',
    thaiName: 'ถั่วที่มีเปลือกแข็ง',
    aliases: [
      'tree nuts',
      'tree nut',
      'almond',
      'walnut',
      'pecan',
      'macadamia',
      'อัลมอนด์',
      'วอลนัต',
      'พีแคน',
      'แมคคาเดเมีย',
      'ถั่วที่มีเปลือกแข็ง',
    ],
  },
  {
    key: 'sulphites',
    thaiName: 'ซัลไฟต์',
    aliases: ['sulphites', 'sulfites', 'preservatives', 'sulfur dioxide', 'ซัลไฟต์', 'วัตถุกันเสีย', 'ซัลเฟอร์ไดออกไซด์'],
  },
  {
    key: 'alcohol',
    thaiName: 'แอลกอฮอล์',
    aliases: ['alcohol', 'แอลกอฮอล์'],
  },
  {
    key: 'sesame',
    thaiName: 'งา',
    aliases: ['sesame', 'sesame seeds', 'งา', 'เมล็ดงา'],
  },
];

const termTranslations: Record<string, string> = {
  gluten: 'กลูเตน',
  wheat: 'ข้าวสาลี',
  barley: 'ข้าวบาร์เลย์',
  rye: 'ข้าวไรย์',
  oats: 'ข้าวโอ๊ต',
  crustaceans: 'สัตว์น้ำเปลือกแข็ง',
  'crustacean shellfish': 'สัตว์น้ำเปลือกแข็ง',
  shellfish: 'อาหารทะเลเปลือกแข็ง',
  shrimp: 'กุ้ง',
  prawn: 'กุ้ง',
  crab: 'ปู',
  'mantis shrimp': 'กั้ง',
  lobster: 'ล็อบสเตอร์',
  eggs: 'ไข่',
  egg: 'ไข่',
  'chicken eggs': 'ไข่ไก่',
  'duck eggs': 'ไข่เป็ด',
  fish: 'ปลา',
  peanuts: 'ถั่วลิสง',
  peanut: 'ถั่วลิสง',
  'peanut butter': 'เนยถั่วลิสง',
  soybeans: 'ถั่วเหลือง',
  soybean: 'ถั่วเหลือง',
  soy: 'ถั่วเหลือง',
  tofu: 'เต้าหู้',
  'soy sauce': 'ซีอิ๊ว',
  'soy milk': 'นมถั่วเหลือง',
  milk: 'นม',
  dairy: 'ผลิตภัณฑ์นม',
  lactose: 'แลคโตส',
  'cow milk': 'นมวัว',
  'tree nuts': 'ถั่วเปลือกแข็ง',
  'tree nut': 'ถั่วเปลือกแข็ง',
  almond: 'อัลมอนด์',
  walnut: 'วอลนัต',
  pecan: 'พีแคน',
  macadamia: 'แมคคาเดเมีย',
  sulphites: 'ซัลไฟต์',
  sulfites: 'ซัลไฟต์',
  preservatives: 'วัตถุกันเสีย',
  'sulfur dioxide': 'ซัลเฟอร์ไดออกไซด์',
  alcohol: 'แอลกอฮอล์',
  sesame: 'งา',
  'sesame seeds': 'เมล็ดงา',
};

export const normalizeAllergenTerm = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  return normalized.length > 0 ? normalized : null;
};

const aliasToKey = new Map<string, string>();

allergenGroups.forEach((group) => {
  aliasToKey.set(group.key, group.key);
  aliasToKey.set(normalizeAllergenTerm(group.thaiName)!, group.key);

  group.aliases.forEach((alias) => {
    const normalized = normalizeAllergenTerm(alias);
    if (normalized) {
      aliasToKey.set(normalized, group.key);
    }
  });
});

export const getAllergenCanonicalKey = (value: unknown): string | null => {
  const normalized = normalizeAllergenTerm(value);
  if (!normalized) {
    return null;
  }

  return aliasToKey.get(normalized) ?? null;
};

export const translateAllergenTermToThai = (value: unknown): string | null => {
  const normalized = normalizeAllergenTerm(value);
  if (!normalized) {
    return null;
  }

  const directTranslation = termTranslations[normalized];
  if (directTranslation) {
    return directTranslation;
  }

  const key = getAllergenCanonicalKey(normalized);
  if (!key) {
    return null;
  }

  return allergenGroups.find((group) => group.key === key)?.thaiName ?? null;
};

export const getAllergenDisplayName = (allergen: Pick<Allergen, 'name'> | string): string => {
  const source = typeof allergen === 'string' ? allergen : allergen.name;
  return translateAllergenTermToThai(source) ?? source;
};

export const getLocalizedAliasNames = (allergen: Pick<Allergen, 'name' | 'altNames'>): string[] => {
  const key = getAllergenCanonicalKey(allergen.name);
  const group = key ? allergenGroups.find((item) => item.key === key) : null;
  const sourceTerms = group ? group.aliases : [allergen.name, ...allergen.altNames];
  const displayName = getAllergenDisplayName(allergen);
  const results: string[] = [];

  sourceTerms.forEach((term) => {
    const translated = translateAllergenTermToThai(term) ?? term;
    if (translated !== displayName && !results.includes(translated)) {
      results.push(translated);
    }
  });

  return results;
};

export const getAllergenSearchTerms = (allergen: Pick<Allergen, 'name' | 'altNames'>): string[] => {
  const groupAliases = getAllergenCanonicalKey(allergen.name)
    ? allergenGroups.find((item) => item.key === getAllergenCanonicalKey(allergen.name))?.aliases ?? []
    : [];

  const translatedTerms = [allergen.name, ...allergen.altNames, ...groupAliases]
    .map((term) => [term, translateAllergenTermToThai(term)])
    .flat()
    .map((term) => normalizeAllergenTerm(term))
    .filter((term): term is string => Boolean(term));

  return Array.from(new Set(translatedTerms));
};
