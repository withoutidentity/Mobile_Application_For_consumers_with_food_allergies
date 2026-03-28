ALTER TABLE "public"."allergen_symptoms"
ADD COLUMN "defaultLevel" "public"."Severity";

UPDATE "public"."allergen_symptoms" AS "symptom"
SET "defaultLevel" = "allergen"."defaultLevel"
FROM "public"."allergens" AS "allergen"
WHERE "symptom"."allergenId" = "allergen"."id";

ALTER TABLE "public"."allergen_symptoms"
ALTER COLUMN "defaultLevel" SET NOT NULL;

DROP INDEX "public"."allergen_symptoms_allergenId_key";

CREATE UNIQUE INDEX "allergen_symptoms_allergenId_defaultLevel_key"
ON "public"."allergen_symptoms"("allergenId", "defaultLevel");

ALTER TABLE "public"."allergens"
DROP COLUMN "defaultLevel";
