CREATE TYPE "public"."job_experience_level" AS ENUM('no-experience', 'fresher', 'intermediate', 'expert');--> statement-breakpoint
CREATE TYPE "public"."job_listing_status" AS ENUM('created', 'draft', 'pending-review', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."jobListing_type" AS ENUM('full-time', 'part-time', 'freelance', 'seasonal', 'contract', 'fixed-price');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'employer', 'seeker');--> statement-breakpoint
CREATE TABLE "job_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" text NOT NULL,
	"icon_url" text
);
--> statement-breakpoint
CREATE TABLE "job_listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"title" text NOT NULL,
	"description" text,
	"requirements" text,
	"salary_from" numeric(12, 2),
	"salary_to" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"country" text,
	"city" text,
	"experience_level" "job_experience_level",
	"type" "jobListing_type",
	"status" "job_listing_status",
	"is_active" boolean DEFAULT false,
	"website" text,
	"category_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"organisation_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listing_to_job_skill" (
	"job_id" uuid,
	"skill_id" uuid,
	CONSTRAINT "job_listing_to_job_skill_job_id_skill_id_pk" PRIMARY KEY("job_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "job_skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" text
);
--> statement-breakpoint
CREATE TABLE "organisation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" text NOT NULL,
	"about" text NOT NULL,
	"website" text,
	"image_url" text,
	"country" text,
	"owner_id" uuid
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "uniqueUserIdRole" UNIQUE("user_id","role")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false,
	"firstname" text,
	"lastname" text,
	"password_hash" text,
	"country" text,
	"image_url" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "job_listing" ADD CONSTRAINT "job_listing_category_id_job_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."job_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing" ADD CONSTRAINT "job_listing_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing" ADD CONSTRAINT "job_listing_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_to_job_skill" ADD CONSTRAINT "job_listing_to_job_skill_job_id_job_listing_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_to_job_skill" ADD CONSTRAINT "job_listing_to_job_skill_skill_id_job_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."job_skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation" ADD CONSTRAINT "organisation_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;