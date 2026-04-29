export type SafetyStatus = "SAFE" | "UNSAFE";

export type AllergenTerm = {
  id: number;
  name: string;
  altNames: string[];
};

export type ProductLookup = {
  source: "LOCAL" | "NONE";
  barcode?: string;
  name?: string;
  brand?: string;
  ingredientsText?: string;
  allergensTags?: string[];
  tracesTags?: string[];
};

export type RuleResult = {
  safety: SafetyStatus;
  matchedAllergens: string[];
  reason: string;
};

export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

const normalizeTag = (value: string) => {
  const raw = value.includes(":") ? value.split(":").slice(-1)[0] : value;
  return normalizeText(raw);
};

export const buildRuleResult = (
  ingredientsText: string | undefined,
  allergensTags: string[] | undefined,
  tracesTags: string[] | undefined,
  userAllergens: AllergenTerm[]
): RuleResult => {
  const text = ingredientsText?.trim() ?? "";
  const hasText = text.length > 0;
  const normalizedText = hasText ? normalizeText(text) : "";

  const tagSet = new Set<string>();
  (allergensTags ?? []).forEach((tag) => tagSet.add(normalizeTag(tag)));
  (tracesTags ?? []).forEach((tag) => tagSet.add(normalizeTag(tag)));

  if (!hasText && tagSet.size === 0) {
    return {
      safety: "UNSAFE",
      matchedAllergens: [],
      reason: "ไม่พบข้อมูลส่วนผสมหรือสารก่อภูมิแพ้ที่เพียงพอสำหรับการประเมิน",
    };
  }

  const matched: string[] = [];
  for (const allergen of userAllergens) {
    const terms = [allergen.name, ...allergen.altNames].filter(Boolean);
    const hit = terms.some((term) => {
      const normalizedTerm = normalizeText(term);
      if (!normalizedTerm) return false;
      if (normalizedText && normalizedText.includes(normalizedTerm)) return true;
      return tagSet.has(normalizedTerm);
    });

    if (hit) {
      matched.push(allergen.name);
    }
  }

  if (matched.length > 0) {
    return {
      safety: "UNSAFE",
      matchedAllergens: matched,
      reason: `พบสารก่อภูมิแพ้ที่ผู้ใช้แพ้: ${matched.join(", ")}`,
    };
  }

  return {
    safety: "SAFE",
    matchedAllergens: [],
    reason: "ไม่พบสารก่อภูมิแพ้ของผู้ใช้ในข้อมูลที่ตรวจสอบ",
  };
};

export const buildFallbackReply = (
  rule: RuleResult,
  product?: ProductLookup
) => {
  const productLabel = product?.name
    ? `สินค้า: ${product.name}`
    : product?.barcode
      ? `บาร์โค้ด: ${product.barcode}`
      : "สินค้า";

  if (!product || product.source === "NONE") {
    return [
      "ยังไม่พบข้อมูลสินค้าเพียงพอสำหรับประเมินความปลอดภัย",
      "คุณสามารถส่งบาร์โค้ดหรือชื่อสินค้าให้ละเอียดขึ้นเพื่อให้ตรวจสอบได้",
      "ถ้าต้องการคำแนะนำทั่วไปเกี่ยวกับการหลีกเลี่ยงสารก่อภูมิแพ้ ก็ถามต่อได้เลย",
    ].join("\n");
  }

  if (rule.safety === "UNSAFE") {
    const matchedText =
      rule.matchedAllergens.length > 0
        ? `พบสารก่อภูมิแพ้ที่คุณแพ้: ${rule.matchedAllergens.join(", ")}`
        : "ข้อมูลส่วนผสมไม่เพียงพอ จึงประเมินให้ไม่ปลอดภัยไว้ก่อน";
    return `ผลการประเมิน: ไม่ปลอดภัย\n${productLabel}\n${matchedText}\nแนะนำให้หลีกเลี่ยงและตรวจสอบฉลากอย่างละเอียด`;
  }

  return `ผลการประเมิน: ปลอดภัย\n${productLabel}\nไม่พบสารก่อภูมิแพ้ของคุณในข้อมูลที่ตรวจสอบ`;
};

export const buildGeminiPrompt = (
  message: string,
  rule: RuleResult,
  product?: ProductLookup
) => {
  const lines = [
    `คำถามผู้ใช้: ${message}`,
    `ผลความปลอดภัย (ห้ามเปลี่ยน): ${rule.safety}`,
    `เหตุผลจากกฎ: ${rule.reason}`,
  ];

  if (product?.name) lines.push(`ชื่อสินค้า: ${product.name}`);
  if (product?.brand) lines.push(`แบรนด์: ${product.brand}`);
  if (product?.ingredientsText) lines.push(`ส่วนผสม: ${product.ingredientsText}`);
  if (product?.allergensTags?.length) {
    lines.push(`สารก่อภูมิแพ้จากแท็ก: ${product.allergensTags.join(", ")}`);
  }
  if (product?.tracesTags?.length) {
    lines.push(`สารปนเปื้อนจากแท็ก: ${product.tracesTags.join(", ")}`);
  }

  lines.push(
    "กรุณาสรุปเป็นภาษาไทยที่เข้าใจง่าย มีความเห็นอกเห็นใจ และให้คำแนะนำที่ปลอดภัย",
    "ถ้าไม่ปลอดภัยให้เสนอทางเลือกที่ปลอดภัยกว่าในร้านสะดวกซื้อ",
    "ถ้ายังไม่มีข้อมูลสินค้าเพียงพอ ให้ขอข้อมูลเพิ่ม เช่น บาร์โค้ดหรือชื่อสินค้าแบบละเอียด"
  );
  return lines.join("\n");
};

export const buildConsultationPrompt = (message: string) =>
  [
    `คำถามผู้ใช้: ${message}`,
    "นี่คือโหมดให้คำปรึกษาทั่วไป ไม่ต้องสรุปผล SAFE/UNSAFE",
    "ตอบเป็นภาษาไทยที่เข้าใจง่าย เห็นอกเห็นใจ และให้คำแนะนำทั่วไปเกี่ยวกับการหลีกเลี่ยงสารก่อภูมิแพ้",
    "ถ้าคำถามดูเหมือนถามถึงสินค้าเฉพาะ แต่ยังไม่มีข้อมูลสินค้า ให้ขอข้อมูลเพิ่ม เช่น บาร์โค้ดหรือชื่อสินค้าให้ชัดเจน",
  ].join("\n");

export const isGreetingMessage = (message: string) => {
  const normalized = normalizeText(message);
  const greetings = [
    "สวัสดี",
    "สวัสดีครับ",
    "สวัสดีค่ะ",
    "หวัดดี",
    "หวัดดีครับ",
    "หวัดดีค่ะ",
    "hello",
    "hi",
  ];

  return greetings.some((greeting) => normalized === normalizeText(greeting));
};

export const buildGreetingReply = () =>
  [
    "สวัสดี ฉันช่วยให้คำปรึกษาทั่วไปเกี่ยวกับการหลีกเลี่ยงสารก่อภูมิแพ้ได้",
    "ถ้าต้องการให้ช่วยประเมินสินค้า คุณส่งชื่อสินค้าหรือบาร์โค้ดมาได้เลย",
    "หรือถ้ามีข้อสงสัยเรื่องการหลีกเลี่ยงสารก่อภูมิแพ้ ก็ถามต่อได้ทันที",
  ].join("\n");

export const isListRequest = (message: string) => {
  const patterns = [
    /มีสินค้าไหนบ้าง/i,
    /แนะนำสินค้า/i,
    /กินอะไรได้/i,
    /ทานอะไรได้/i,
    /สินค้าไหนกินได้/i,
  ];
  return patterns.some((pattern) => pattern.test(message));
};

export const buildConsultFallback = (message: string) => {
  if (isListRequest(message)) {
    return [
      "ตอนนี้ยังไม่สามารถสรุปรายการสินค้าเฉพาะได้จากคำถามนี้",
      "เพื่อช่วยคัดกรองให้แม่นยำขึ้น โปรดบอกประเภทสินค้า แบรนด์ หรือร้านที่สนใจ หรือส่งชื่อสินค้าที่อยากตรวจสอบ",
      "ถ้ามีบาร์โค้ดจะช่วยตรวจสอบได้เร็วที่สุด",
      "ระหว่างนี้ฉันให้คำแนะนำทั่วไปเรื่องการหลีกเลี่ยงสารก่อภูมิแพ้ได้",
    ].join("\n");
  }

  return [
    "ถ้าต้องการให้ประเมิน โปรดส่งบาร์โค้ดหรือชื่อสินค้าให้ชัดเจน",
    "ตอนนี้ฉันช่วยให้คำปรึกษาทั่วไปเกี่ยวกับการหลีกเลี่ยงสารก่อภูมิแพ้ได้",
  ].join("\n");
};

export const extractProductNameFromMessage = (message: string) => {
  let text = message.trim();
  const patterns = [
    /กินได้ไหม/gi,
    /กินได้มั้ย/gi,
    /ทานได้ไหม/gi,
    /ทานได้มั้ย/gi,
    /ทานได้หรือไม่/gi,
    /กินได้หรือไม่/gi,
    /แพ้ไหม/gi,
    /อันตรายไหม/gi,
    /ปลอดภัยไหม/gi,
  ];

  for (const pattern of patterns) {
    text = text.replace(pattern, "");
  }

  text = text.replace(/[?!.，。、:;()\[\]{}"'“”‘’]/g, " ");
  text = text.replace(/\s+/g, " ").trim();

  return text.length > 1 ? text : "";
};
