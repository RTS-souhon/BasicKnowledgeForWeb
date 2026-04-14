ALTER TABLE "rooms" ADD COLUMN "building_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "floor" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "pre_day_assignee" varchar(255);--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "pre_day_purpose" varchar(255);--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "day_assignee" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "day_purpose" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "assignee";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "purpose";