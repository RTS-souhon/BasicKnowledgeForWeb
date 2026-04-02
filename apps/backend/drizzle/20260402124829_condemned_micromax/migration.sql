ALTER TABLE "rooms" ADD COLUMN "pre_day_manager" varchar(255);--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "day_manager" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "pre_day_assignee";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "day_assignee";