import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { page } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	await requireUser(event);
	const chapterId = Number(event.params.id);

	if (Number.isNaN(chapterId)) {
		throw error(400, 'Invalid chapter id.');
	}

	const pages = await db
		.select()
		.from(page)
		.where(eq(page.chapterId, chapterId))
		.orderBy(page.pageNumber);

	return json({ pages });
};

export const POST: RequestHandler = async (event) => {
	await requireUser(event);
	const chapterId = Number(event.params.id);

	if (Number.isNaN(chapterId)) {
		throw error(400, 'Invalid chapter id.');
	}

	const body = await event.request.json();
	const { imageUrl, pageNumber, width, height } = body;

	if (!imageUrl) {
		throw error(400, 'Image URL is required.');
	}

	const [newPage] = await db
		.insert(page)
		.values({
			chapterId,
			pageNumber: pageNumber ?? 1,
			imageUrl,
			width: width ?? 800,
			height: height ?? 1100,
			ocrStatus: 'pending'
		})
		.returning();

	return json({ page: newPage });
};
