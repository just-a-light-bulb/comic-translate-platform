CREATE TABLE "page" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"page_number" integer DEFAULT 1 NOT NULL,
	"image_url" text NOT NULL,
	"width" integer DEFAULT 800 NOT NULL,
	"height" integer DEFAULT 1100 NOT NULL,
	"ocr_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "text_element" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"x" integer DEFAULT 0 NOT NULL,
	"y" integer DEFAULT 0 NOT NULL,
	"width" integer DEFAULT 100 NOT NULL,
	"height" integer DEFAULT 30 NOT NULL,
	"rotation" integer DEFAULT 0 NOT NULL,
	"original_text" text DEFAULT '' NOT NULL,
	"translated_text" text DEFAULT '',
	"font_family" text DEFAULT 'Arial' NOT NULL,
	"font_size" integer DEFAULT 16 NOT NULL,
	"font_weight" text DEFAULT 'normal' NOT NULL,
	"font_style" text DEFAULT 'normal' NOT NULL,
	"text_align" text DEFAULT 'center' NOT NULL,
	"fill" text DEFAULT '#000000' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page" ADD CONSTRAINT "page_chapter_id_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_element" ADD CONSTRAINT "text_element_page_id_page_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page"("id") ON DELETE cascade ON UPDATE no action;