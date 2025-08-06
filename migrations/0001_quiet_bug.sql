ALTER TABLE "job_listing" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."job_listing_status";--> statement-breakpoint
CREATE TYPE "public"."job_listing_status" AS ENUM('created', 'drafted', 'pending-review', 'approved', 'rejected', 'suspended');--> statement-breakpoint
--
UPDATE "job_listing" SET "status" = 'drafted' WHERE "status" = 'draft';
--
ALTER TABLE "job_listing" ALTER COLUMN "status" SET DATA TYPE "public"."job_listing_status" USING "status"::"public"."job_listing_status";--> statement-breakpoint
ALTER TABLE "organisation" ALTER COLUMN "owner_id" SET NOT NULL;