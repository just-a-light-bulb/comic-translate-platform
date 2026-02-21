import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { textElement } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	await requireUser(event);
	const elementId = Number(event.params.id);

	if (Number.isNaN(elementId)) {
		throw error(400, 'Invalid element id.');
	}

	const [element] = await db.select().from(textElement).where(eq(textElement.id, elementId));

	if (!element) {
		throw error(404, 'Element not found.');
	}

	return json({ element });
};

export const PUT: RequestHandler = async (event) => {
	await requireUser(event);
	const elementId = Number(event.params.id);

	if (Number.isNaN(elementId)) {
		throw error(400, 'Invalid element id.');
	}

	const body = await event.request.json();
	const updates: Record<string, unknown> = {};

	if (body.x !== undefined) updates.x = body.x;
	if (body.y !== undefined) updates.y = body.y;
	if (body.width !== undefined) updates.width = body.width;
	if (body.height !== undefined) updates.height = body.height;
	if (body.rotation !== undefined) updates.rotation = body.rotation;
	if (body.originalText !== undefined) updates.originalText = body.originalText;
	if (body.translatedText !== undefined) updates.translatedText = body.translatedText;
	if (body.fontFamily !== undefined) updates.fontFamily = body.fontFamily;
	if (body.fontSize !== undefined) updates.fontSize = body.fontSize;
	if (body.fontWeight !== undefined) updates.fontWeight = body.fontWeight;
	if (body.fontStyle !== undefined) updates.fontStyle = body.fontStyle;
	if (body.textAlign !== undefined) updates.textAlign = body.textAlign;
	if (body.fill !== undefined) updates.fill = body.fill;
	if (body.status !== undefined) updates.status = body.status;

	const [updated] = await db
		.update(textElement)
		.set(updates)
		.where(eq(textElement.id, elementId))
		.returning();

	if (!updated) {
		throw error(404, 'Element not found.');
	}

	return json({ element: updated });
};

export const DELETE: RequestHandler = async (event) => {
	await requireUser(event);
	const elementId = Number(event.params.id);

	if (Number.isNaN(elementId)) {
		throw error(400, 'Invalid element id.');
	}

	await db.delete(textElement).where(eq(textElement.id, elementId));

	return json({ success: true });
};
