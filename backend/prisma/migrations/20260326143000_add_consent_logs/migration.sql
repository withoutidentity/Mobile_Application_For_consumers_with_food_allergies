-- CreateEnum
CREATE TYPE "public"."ConsentType" AS ENUM ('TOS', 'PRIVACY_POLICY', 'SENSITIVE_HEALTH_DATA');

-- CreateEnum
CREATE TYPE "public"."ConsentStatus" AS ENUM ('GRANTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "public"."consent_logs" (
    "log_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "consent_type" "public"."ConsentType" NOT NULL,
    "consent_status" "public"."ConsentStatus" NOT NULL,
    "document_version" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "action_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE INDEX "consent_logs_user_id_consent_type_action_timestamp_idx" ON "public"."consent_logs"("user_id", "consent_type", "action_timestamp");

-- AddForeignKey
ALTER TABLE "public"."consent_logs" ADD CONSTRAINT "consent_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
