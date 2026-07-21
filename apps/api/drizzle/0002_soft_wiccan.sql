ALTER TABLE "items" ADD COLUMN "importance" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;