import { PrismaClient } from "../generated/prisma";

type SafetyStatus = "SAFE" | "UNSAFE";

type ChatRequest = {
  message: string;
  barcode?: string;
  userAllergenIds: number[];
};

type AllergenTerm = {
  id: number;
  name: string;
  altNames: string[];
};

type ProductLookup = {
  source: "LOCAL" | "OFF" | "NONE";
  barcode?: string;
  name?: string;
  brand?: string;
  ingredientsText?: string;
  allergensTags?: string[];
  tracesTags?: string[];
};

type RuleResult = {
  safety: SafetyStatus;
  matchedAllergens: string[];
  reason: string;
};

const prisma = new PrismaClient();

const OFF_BASE_URL = "https://world.openfoodfacts.org/api/v2/product";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

const normalizeTag = (value: string) => {
  const raw = value.includes(":") ? value.split(":").slice(-1)[0] : value;
  return normalizeText(raw);
};

const buildRuleResult = (
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
    if (hit) matched.push(allergen.name);
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

const buildFallbackReply = (rule: RuleResult, product?: ProductLookup) => {
  const productLabel = product?.name
    ? `สินค้า: ${product.name}`
    : product?.barcode
      ? `บาร์โค้ด: ${product.barcode}`
      : "สินค้า";

  if (!product || product.source === "NONE") {
    return [
      "ยังไม่พบข้อมูลสินค้าเพียงพอสำหรับประเมินความปลอดภัย",
      "คุณสามารถส่งบาร์โค้ดหรือชื่อสินค้าให้ละเอียดขึ้นเพื่อให้ตรวจสอบได้",
      "ถ้าต้องการปรึกษาทั่วไปเกี่ยวกับการหลีกเลี่ยงสารก่อภูมิแพ้ ก็ถามต่อได้เลย",
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

const callGemini = async (prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              "คุณคือผู้ช่วยด้านความปลอดภัยอาหารสำหรับผู้แพ้อาหาร " +
              "ห้ามเปลี่ยนแปลงผลลัพธ์ความปลอดภัย (SAFE/UNSAFE) ที่ได้รับมาโดยเด็ดขาด " +
              "หน้าที่คืออธิบายอย่างสุภาพ เห็นอกเห็นใจ และให้คำแนะนำที่ปลอดภัย " +
              "อย่าให้คำแนะนำทางการแพทย์เชิงลึก",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === "string" ? text : null;
};

const buildGeminiPrompt = (
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
  if (product?.ingredientsText)
    lines.push(`ส่วนผสม: ${product.ingredientsText}`);
  if (product?.allergensTags?.length)
    lines.push(`สารก่อภูมิแพ้จากแท็ก: ${product.allergensTags.join(", ")}`);
  if (product?.tracesTags?.length)
    lines.push(`สารปนเปื้อนจากแท็ก: ${product.tracesTags.join(", ")}`);

  lines.push(
    "กรุณาสรุปเป็นภาษาไทยที่เข้าใจง่าย มีความเห็นอกเห็นใจ ถ้าไม่ปลอดภัยให้เสนอทางเลือกที่ปลอดภัยกว่าในร้านสะดวกซื้อ",
    "ถ้ายังไม่มีข้อมูลสินค้าเพียงพอ ให้ขอข้อมูลเพิ่ม เช่น บาร์โค้ดหรือชื่อสินค้าแบบละเอียด และให้คำแนะนำทั่วไปได้"
  );
  return lines.join("\n");
};

const buildConsultationPrompt = (message: string) => {
  return [
    `คำถามผู้ใช้: ${message}`,
    "นี่คือโหมดให้คำปรึกษาทั่วไป ไม่ต้องสรุปผล SAFE/UNSAFE",
    "ตอบเป็นภาษาไทยที่เข้าใจง่าย เห็นอกเห็นใจ และให้คำแนะนำทั่วไปเกี่ยวกับการหลีกเลี่ยงสารก่อภูมิแพ้",
    "ถ้าคำถามดูเหมือนถามถึงสินค้าเฉพาะ แต่ยังไม่มีข้อมูลสินค้า ให้ขอข้อมูลเพิ่ม เช่น บาร์โค้ดหรือชื่อสินค้าให้ชัดเจน",
  ].join("\n");
};

const isListRequest = (message: string) => {
  const patterns = [
    /มีสินค้าไหนบ้าง/i,
    /แนะนำสินค้า/i,
    /กินอะไรได้/i,
    /ทานอะไรได้/i,
    /สินค้าไหนกินได้/i,
  ];
  return patterns.some((pattern) => pattern.test(message));
};

const buildConsultFallback = (message: string) => {
  if (isListRequest(message)) {
    return [
      "ตอนนี้ยังไม่สามารถสรุปรายการสินค้าเฉพาะได้จากคำถามนี้",
      "เพื่อช่วยคัดกรองให้แม่นยำขึ้น โปรดบอกประเภทสินค้า/แบรนด์/ร้านที่สนใจ หรือส่งชื่อสินค้าที่อยากตรวจสอบ",
      "ถ้ามีบาร์โค้ดจะช่วยตรวจสอบได้เร็วที่สุด",
      "ระหว่างนี้ฉันให้คำแนะนำทั่วไปเรื่องการหลีกเลี่ยงสารก่อภูมิแพ้ได้",
    ].join("\n");
  }

  return [
    "ถ้าต้องการให้ประเมิน โปรดส่งบาร์โค้ดหรือชื่อสินค้าให้ชัดเจน",
    "ตอนนี้ฉันช่วยให้คำปรึกษาทั่วไปเกี่ยวกับการหลีกเลี่ยงสารก่อภูมิแพ้ได้",
  ].join("\n");
};

const fetchProductFromDb = async (barcode: string): Promise<ProductLookup | null> => {
  const product = await prisma.product.findUnique({
    where: { barcode },
    include: {
      allergens: {
        include: { allergen: true },
      },
    },
  });

  if (!product) return null;

  const declaredAllergens = product.allergens.flatMap((entry) => [
    entry.allergen.name,
    ...entry.allergen.altNames,
  ]);

  return {
    source: "LOCAL",
    barcode: product.barcode,
    name: product.name,
    brand: product.brand ?? undefined,
    ingredientsText: product.ingredients.join(", "),
    allergensTags: declaredAllergens,
    tracesTags: [],
  };
};

const fetchProductFromOff = async (barcode: string): Promise<ProductLookup | null> => {
  const url = `${OFF_BASE_URL}/${barcode}.json?fields=product_name,brands,ingredients_text_th,ingredients_text,allergens_tags,traces_tags`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  if (!data || data.status !== 1 || !data.product) return null;

  const product = data.product;
  return {
    source: "OFF",
    barcode,
    name: product.product_name || undefined,
    brand: product.brands || undefined,
    ingredientsText: product.ingredients_text_th || product.ingredients_text || undefined,
    allergensTags: Array.isArray(product.allergens_tags) ? product.allergens_tags : [],
    tracesTags: Array.isArray(product.traces_tags) ? product.traces_tags : [],
  };
};

const fetchProductByNameFromDb = async (name: string): Promise<ProductLookup | null> => {
  const product = await prisma.product.findFirst({
    where: { name: { contains: name, mode: "insensitive" } },
    include: {
      allergens: {
        include: { allergen: true },
      },
    },
  });

  if (!product) return null;

  const declaredAllergens = product.allergens.flatMap((entry) => [
    entry.allergen.name,
    ...entry.allergen.altNames,
  ]);

  return {
    source: "LOCAL",
    barcode: product.barcode,
    name: product.name,
    brand: product.brand ?? undefined,
    ingredientsText: product.ingredients.join(", "),
    allergensTags: declaredAllergens,
    tracesTags: [],
  };
};

const fetchProductByNameFromOff = async (name: string): Promise<ProductLookup | null> => {
  const query = encodeURIComponent(name);
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  const product = data?.products?.[0];
  if (!product) return null;

  return {
    source: "OFF",
    barcode: product.code || undefined,
    name: product.product_name || undefined,
    brand: product.brands || undefined,
    ingredientsText: product.ingredients_text_th || product.ingredients_text || undefined,
    allergensTags: Array.isArray(product.allergens_tags) ? product.allergens_tags : [],
    tracesTags: Array.isArray(product.traces_tags) ? product.traces_tags : [],
  };
};

const extractProductNameFromMessage = (message: string) => {
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

export const ChatService = {
  async handleChat(request: ChatRequest) {
    const { message, barcode, userAllergenIds } = request;

    const userAllergens =
      userAllergenIds.length > 0
        ? await prisma.allergen.findMany({
            where: { id: { in: userAllergenIds } },
            select: { id: true, name: true, altNames: true },
          })
        : [];

    let product: ProductLookup | undefined;
    const trimmed = message.trim();
    const productName = extractProductNameFromMessage(message);

    if (barcode) {
      const localProduct = await fetchProductFromDb(barcode);
      product = localProduct ?? (await fetchProductFromOff(barcode)) ?? undefined;
    }

    if (!product && productName.length > 2) {
      const localByName = await fetchProductByNameFromDb(productName);
      product = localByName ?? (await fetchProductByNameFromOff(productName)) ?? undefined;
    } else if (!product && trimmed.length > 2) {
      const localByName = await fetchProductByNameFromDb(trimmed);
      product = localByName ?? (await fetchProductByNameFromOff(trimmed)) ?? undefined;
    }

    const rule = buildRuleResult(
      product?.ingredientsText,
      product?.allergensTags,
      product?.tracesTags,
      userAllergens
    );

    if (userAllergens.length === 0) {
      rule.safety = "UNSAFE";
      rule.reason = "ยังไม่ได้ตั้งค่ารายการสารก่อภูมิแพ้ของผู้ใช้";
      rule.matchedAllergens = [];
    }

    if (!product) {
      const consultPrompt = buildConsultationPrompt(message);
      const consultReply =
        (await callGemini(consultPrompt)) ?? buildConsultFallback(message);

      return {
        mode: "CONSULT",
        reply: consultReply,
      };
    }

    const prompt = buildGeminiPrompt(message, rule, product);
    const geminiReply = await callGemini(prompt);
    const reply = geminiReply ?? buildFallbackReply(rule, product);

    return {
      mode: "PRODUCT",
      safety: rule.safety,
      ruleReason: rule.reason,
      matchedAllergens: rule.matchedAllergens,
      product,
      reply,
    };
  },
};
