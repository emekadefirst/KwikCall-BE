ALTER TABLE "users" RENAME TO "accounts";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_host_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_host_id_accounts_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_email_unique" UNIQUE("email");