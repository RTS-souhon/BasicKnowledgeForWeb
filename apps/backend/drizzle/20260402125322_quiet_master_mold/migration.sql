CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_departments" (
	"user_id" uuid,
	"event_id" uuid,
	"department_id" uuid NOT NULL,
	CONSTRAINT "user_departments_pkey" PRIMARY KEY("user_id","event_id")
);
--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "pre_day_manager_id" uuid;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "day_manager_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_event_id_access_codes_id_fkey" FOREIGN KEY ("event_id") REFERENCES "access_codes"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_pre_day_manager_id_departments_id_fkey" FOREIGN KEY ("pre_day_manager_id") REFERENCES "departments"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_day_manager_id_departments_id_fkey" FOREIGN KEY ("day_manager_id") REFERENCES "departments"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_event_id_access_codes_id_fkey" FOREIGN KEY ("event_id") REFERENCES "access_codes"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_department_id_departments_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "pre_day_manager";--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "day_manager";