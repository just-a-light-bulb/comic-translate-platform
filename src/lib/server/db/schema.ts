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
