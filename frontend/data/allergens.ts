export { fetchAllergens } from './allergenService';

export const allergenTranslations: Record<string, string> = {
  milk: 'นม',
  eggs: 'ไข่',
  fish: 'ปลา',
  'crustacean shellfish': 'สัตว์น้ำที่มีเปลือกแข็ง',
  shellfish: 'สัตว์น้ำที่มีเปลือกแข็ง',
  'tree nuts': 'ถั่วที่มีเปลือกแข็ง',
  peanuts: 'ถั่วลิสง',
  peanut: 'ถั่วลิสง',
  wheat: 'ข้าวสาลี',
  soy: 'ถั่วเหลือง',
  soybeans: 'ถั่วเหลือง',
  sesame: 'งา',
  gluten: 'กลูเตน',
};
