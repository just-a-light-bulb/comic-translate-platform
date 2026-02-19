import { and, eq } from 'drizzle-orm';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chapter, project } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';

const parseChapterId = (value: string | undefined) => {
	if (!value) {
		throw error(400, 'Chapter id is required.');
	}
	const id = Number(value);
	if (Number.isNaN(id)) {
		throw error(400, 'Invalid chapter id.');
	}
	return id;
};

export const GET: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const chapterId = parseChapterId(event.params.id);

	const selectedChapter = await db.query.chapter.findFirst({
		where: and(eq(chapter.id, chapterId), eq(chapter.userId, user.id))
	});

	if (!selectedChapter) {
		throw error(404, 'Chapter not found.');
	}

	return json({ chapter: selectedChapter });
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const chapterId = parseChapterId(event.params.id);
	const body = await event.request.json();
	const projectId = Number(body?.projectId);
	const title = String(body?.title ?? '').trim();
	const chapterNumber = Number(body?.chapterNumber ?? 1);
	const status = String(body?.status ?? 'draft').trim() || 'draft';

	if (!Number.isInteger(projectId) || projectId < 1) {
		return json({ error: 'Project id must be a positive integer.' }, { status: 400 });
	}

	if (!title) {
		return json({ error: 'Chapter title is required.' }, { status: 400 });
	}

	if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
		return json({ error: 'Chapter number must be a positive integer.' }, { status: 400 });
	}

	const selectedProject = await db.query.project.findFirst({
		where: and(eq(project.id, projectId), eq(project.userId, user.id))
	});

	if (!selectedProject) {
		return json({ error: 'Project not found.' }, { status: 404 });
	}

	const [updated] = await db
		.update(chapter)
		.set({ projectId, title, chapterNumber, status })
		.where(and(eq(chapter.id, chapterId), eq(chapter.userId, user.id)))
		.returning();

	if (!updated) {
		throw error(404, 'Chapter not found.');
	}

	return json({ chapter: updated });
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const chapterId = parseChapterId(event.params.id);

	const deleted = await db
		.delete(chapter)
		.where(and(eq(chapter.id, chapterId), eq(chapter.userId, user.id)))
		.returning({ id: chapter.id });

	if (deleted.length === 0) {
		throw error(404, 'Chapter not found.');
	}

	return json({ success: true });
};
