import { PrismaClient } from "../generated/prisma";
import {
  AllergenTerm,
  ProductLookup,
  buildConsultFallback,
  buildConsultationPrompt,
  buildFallbackReply,
  buildGeminiPrompt,
  buildRuleResult,
  extractProductNameFromMessage,
} from "./chatSafety";

type ChatRequest = {
  message: string;
  barcode?: string;
  userAllergenIds: number[];
};

const prisma = new PrismaClient();
const OFF_BASE_URL = "https://world.openfoodfacts.org/api/v2/product";

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
              "ห้ามเปลี่ยนผลลัพธ์ความปลอดภัย (SAFE/UNSAFE) ที่ได้รับจากระบบโดยเด็ดขาด " +
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

export const ChatService = {
  async handleChat(request: ChatRequest) {
    const { message, barcode, userAllergenIds } = request;

    const userAllergens: AllergenTerm[] =
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
