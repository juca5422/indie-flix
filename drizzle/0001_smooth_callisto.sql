CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"movie_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_movie_unique" UNIQUE("user_id","movie_id")
);
--> statement-breakpoint
ALTER TABLE "movies" DROP CONSTRAINT "movies_ban_reason_required";--> statement-breakpoint
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_score_range";--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "age_rating" "age_rating" NOT NULL;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorites_user_idx" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorites_movie_idx" ON "favorites" USING btree ("movie_id");--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_ban_reason_required" CHECK ("movies"."status" = 'ACTIVE' OR length(trim("movies"."ban_reason")) > 0);--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_score_range" CHECK ("ratings"."score" BETWEEN 1 AND 10);