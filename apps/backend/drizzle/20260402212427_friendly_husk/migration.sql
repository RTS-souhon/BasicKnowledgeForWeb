CREATE UNIQUE INDEX IF NOT EXISTS "departments_event_id_id_idx" ON "departments" ("event_id","id");--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_event_id_pre_day_manager_id_departments_event_id_id_fkey" FOREIGN KEY ("event_id","pre_day_manager_id") REFERENCES "departments"("event_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_event_id_day_manager_id_departments_event_id_id_fkey" FOREIGN KEY ("event_id","day_manager_id") REFERENCES "departments"("event_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_UuAKvaNxzk0G_fkey" FOREIGN KEY ("event_id","department_id") REFERENCES "departments"("event_id","id") ON DELETE RESTRICT;
