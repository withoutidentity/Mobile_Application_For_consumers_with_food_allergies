import assert from "node:assert/strict";

import {
  buildFallbackReply,
  buildRuleResult,
  extractProductNameFromMessage,
} from "../services/chatSafety";

export const runChatSafetyTests = () => {
  const unsafeRule = buildRuleResult(
    "น้ำตาล, นมผง, ถั่วลิสง",
    [],
    [],
    [{ id: 1, name: "ถั่วลิสง", altNames: ["Peanut"] }]
  );

  assert.equal(unsafeRule.safety, "UNSAFE");
  assert.deepEqual(unsafeRule.matchedAllergens, ["ถั่วลิสง"]);
  assert.match(unsafeRule.reason, /ถั่วลิสง/);

  const safeRule = buildRuleResult(
    "ข้าว, เกลือ, น้ำ",
    [],
    [],
    [{ id: 1, name: "กุ้ง", altNames: ["Shrimp"] }]
  );

  assert.equal(safeRule.safety, "SAFE");
  assert.deepEqual(safeRule.matchedAllergens, []);

  const productName = extractProductNameFromMessage("นมอัลมอนด์ กินได้ไหม?");
  assert.equal(productName, "นมอัลมอนด์");

  const reply = buildFallbackReply(
    {
      safety: "UNSAFE",
      matchedAllergens: ["นม"],
      reason: "พบสารก่อภูมิแพ้ที่ผู้ใช้แพ้: นม",
    },
    {
      source: "LOCAL",
      name: "คุกกี้นม",
      ingredientsText: "แป้ง, นม",
    }
  );

  assert.match(reply, /ผลการประเมิน: ไม่ปลอดภัย/);
  assert.match(reply, /คุกกี้นม/);
  assert.match(reply, /นม/);
};
