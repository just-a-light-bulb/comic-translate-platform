import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { page, chapter } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	await requireUser(event);
	const pageId = Number(event.params.id);

	if (Number.isNaN(pageId)) {
		throw error(400, 'Invalid page id.');
	}

	const [foundPage] = await db.select().from(page).where(eq(page.id, pageId));

	if (!foundPage) {
		throw error(404, 'Page not found.');
	}

	return json({ page: foundPage });
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const pageId = Number(event.params.id);

	if (Number.isNaN(pageId)) {
		throw error(400, 'Invalid page id.');
	}

	const [foundPage] = await db
		.select()
		.from(page)
		.innerJoin(chapter, eq(page.chapterId, chapter.id))
		.where(and(eq(page.id, pageId), eq(chapter.userId, user.id)));

	if (!foundPage) {
		throw error(404, 'Page not found or you do not have permission to delete it.');
	}

	await db.delete(page).where(eq(page.id, pageId));

	return json({ success: true });
};
