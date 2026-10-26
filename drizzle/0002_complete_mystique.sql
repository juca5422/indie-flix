ALTER TABLE "movies" DROP CONSTRAINT "movies_ban_reason_required";--> statement-breakpoint
ALTER TABLE "movies" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "movies" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW'::text;--> statement-breakpoint
DROP TYPE "public"."movie_status";--> statement-breakpoint
CREATE TYPE "public"."movie_status" AS ENUM('PENDING_REVIEW', 'PUBLISHED', 'BANNED');--> statement-breakpoint
ALTER TABLE "movies" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW'::"public"."movie_status";--> statement-breakpoint
ALTER TABLE "movies" ALTER COLUMN "status" SET DATA TYPE "public"."movie_status" USING "status"::"public"."movie_status";--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_ban_reason_required" CHECK ("movies"."status" <> 'BANNED' OR (
        "movies"."ban_reason" IS NOT NULL
        AND length(trim("movies"."ban_reason")) > 0
      ));