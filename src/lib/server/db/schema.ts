import { pgTable, serial, integer, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const project = pgTable('project', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	name: text('name').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const chapter = pgTable('chapter', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	chapterNumber: integer('chapter_number').notNull().default(1),
	status: text('status').notNull().default('draft'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const page = pgTable('page', {
	id: serial('id').primaryKey(),
	chapterId: integer('chapter_id')
		.notNull()
		.references(() => chapter.id, { onDelete: 'cascade' }),
	pageNumber: integer('page_number').notNull().default(1),
	imageUrl: text('image_url').notNull(),
	width: integer('width').notNull().default(800),
	height: integer('height').notNull().default(1100),
	ocrStatus: text('ocr_status').notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const textElement = pgTable('text_element', {
	id: serial('id').primaryKey(),
	pageId: integer('page_id')
		.notNull()
		.references(() => page.id, { onDelete: 'cascade' }),
	x: integer('x').notNull().default(0),
	y: integer('y').notNull().default(0),
	width: integer('width').notNull().default(100),
	height: integer('height').notNull().default(30),
	rotation: integer('rotation').notNull().default(0),
	originalText: text('original_text').notNull().default(''),
	translatedText: text('translated_text').default(''),
	fontFamily: text('font_family').notNull().default('Arial'),
	fontSize: integer('font_size').notNull().default(16),
	fontWeight: text('font_weight').notNull().default('normal'),
	fontStyle: text('font_style').notNull().default('normal'),
	textAlign: text('text_align').notNull().default('center'),
	fill: text('fill').notNull().default('#000000'),
	status: text('status').notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const accountProfile = pgTable('account_profile', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().unique(),
	displayName: text('display_name'),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const userSettings = pgTable('user_settings', {
	id: serial('id').primaryKey(),
	userId: varchar('user_id', { length: 255 }).notNull().unique(),
	displayName: varchar('display_name', { length: 255 }),
	language: varchar('language', { length: 10 }).notNull().default('en'),
	theme: varchar('theme', { length: 10 }).notNull().default('light'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});
