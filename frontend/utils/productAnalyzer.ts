import { Allergen, Product, UserProfile } from '@/types';

export function analyzeProduct(
  product: Product,
  userProfile: UserProfile,
  allAllergens: Allergen[] // 1. รับรายการ allergen ทั้งหมดเข้ามา
) {
  // userProfile.allergens คือ array ของ allergen id (number)
  const userAllergenIds = userProfile.allergens.map(ua => ua.allergenId);
  const productAllergenWarnings = product.allergenWarnings;

  // 2. หาข้อมูล allergen ที่ผู้ใช้แพ้ จาก id ที่ระบุในโปรไฟล์
  const userAllergenDetails = allAllergens.filter((allergen) => userAllergenIds.includes(allergen.id));

  // 3. สร้าง list ของชื่อและชื่อแฝงทั้งหมดที่ผู้ใช้แพ้ (ในรูปแบบ lowercase)
  const allUserAllergenNames = userAllergenDetails.flatMap((allergen) =>
    [allergen.name.toLowerCase(), ...allergen.altNames.map((alias) => alias.toLowerCase())]
  );

  // 4. ตรวจสอบการแพ้โดยตรงจาก `allergenWarnings` ของสินค้า
  // และตรวจสอบการแพ้ทางอ้อมจาก `ingredients`
  const directMatches: Allergen[] = [];
  const potentialMatches: Allergen[] = [];

  // ตรวจสอบจากส่วนประกอบ (ingredients)
  const ingredientsText = product.ingredients.join(', ').toLowerCase();
  userAllergenDetails.forEach((allergen) => {
    const namesToCheck = [allergen.name.toLowerCase(), ...allergen.altNames.map(a => a.toLowerCase())];
    const isMatch = namesToCheck.some(name => ingredientsText.includes(name));

    if (isMatch) {
      // ตรวจสอบว่าอยู่ใน `allergenWarnings` หรือไม่เพื่อแยกว่าเป็น direct หรือ potential
      const isDirectWarning = productAllergenWarnings.some(warning => namesToCheck.includes(warning.toLowerCase()));
      if (isDirectWarning && !directMatches.some(m => m.id === allergen.id)) {
        directMatches.push(allergen);
      } else if (!directMatches.some(m => m.id === allergen.id) && !potentialMatches.some(m => m.id === allergen.id)) {
        potentialMatches.push(allergen);
      }
    }
  })

  // Determine safety status
  let safetyStatus: 'safe' | 'caution' | 'unsafe' = 'safe';

  if (directMatches.length > 0) {
    safetyStatus = 'unsafe';
  } else if (potentialMatches.length > 0) {
    safetyStatus = 'caution';
  }

  return {
    safetyStatus,
    directMatches,
    potentialMatches,
  };
}

export function findProductByBarcode(barcode: string, products: Product[]): Product | undefined {
  return products.find(product => product.barcode === barcode);
}