CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('image', 'video', 'document', 'audio');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('INSTANT', 'SCHEDULED', 'RECURRING', 'WEBINAR');--> statement-breakpoint
CREATE TYPE "public"."meeting_status" AS ENUM('IDLE', 'LIVE', 'ENDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'archive', 'published');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone_number" varchar(128),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"password" varchar(128),
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"last_login" timestamp,
	"device_tokens" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text,
	"type" "file_type" NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"short_code" varchar(12) NOT NULL,
	"slug" varchar(500),
	"type" "event_type" DEFAULT 'INSTANT' NOT NULL,
	"status" "meeting_status" DEFAULT 'IDLE' NOT NULL,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"invitees_email" jsonb DEFAULT '[]'::jsonb,
	"actual_started_at" timestamp with time zone,
	"recurrence_rule" text,
	"is_recording_enabled" boolean DEFAULT false,
	"requires_approval" boolean DEFAULT true,
	"host_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_short_code_unique" UNIQUE("short_code"),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "blogs_to_files" (
	"blog_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	CONSTRAINT "blogs_to_files_blog_id_file_id_pk" PRIMARY KEY("blog_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "news_to_files" (
	"news_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	CONSTRAINT "news_to_files_news_id_file_id_pk" PRIMARY KEY("news_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "galleries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "galleries_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "galleries_to_files" (
	"gallery_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	CONSTRAINT "galleries_to_files_gallery_id_file_id_pk" PRIMARY KEY("gallery_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_title_unique" UNIQUE("title")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs_to_files" ADD CONSTRAINT "blogs_to_files_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs_to_files" ADD CONSTRAINT "blogs_to_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_to_files" ADD CONSTRAINT "news_to_files_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_to_files" ADD CONSTRAINT "news_to_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries_to_files" ADD CONSTRAINT "galleries_to_files_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries_to_files" ADD CONSTRAINT "galleries_to_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_first_name" ON "users" USING btree ("first_name");--> statement-breakpoint
CREATE INDEX "idx_users_last_name" ON "users" USING btree ("last_name");--> statement-breakpoint
CREATE INDEX "idx_events_short_code" ON "events" USING btree ("short_code");--> statement-breakpoint
CREATE INDEX "idx_events_host_id" ON "events" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "idx_events_status" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_created_at_idx" ON "blogs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blog_category_id_idx" ON "blogs" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "blog_file_id_idx" ON "blogs_to_files" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "news_category_id_idx" ON "news" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "news_file_id_idx" ON "news_to_files" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "gallery_created_at_idx" ON "galleries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "gallery_category_id_idx" ON "galleries" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "gallery_file_id_idx" ON "galleries_to_files" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscribers_category_id_idx" ON "subscribers" USING btree ("title");