import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { textElement } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	await requireUser(event);
	const pageId = Number(event.params.id);

	if (Number.isNaN(pageId)) {
		throw error(400, 'Invalid page id.');
	}

	const elements = await db.select().from(textElement).where(eq(textElement.pageId, pageId));

	return json({ elements });
};
