ALTER TABLE "shop_items" ADD COLUMN IF NOT EXISTS "image_key" varchar(512) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "shop_items" ADD COLUMN IF NOT EXISTS "image_url" string NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "shop_items" ALTER COLUMN "image_key" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "shop_items" ALTER COLUMN "image_url" DROP DEFAULT;
