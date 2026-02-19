import { and, desc, eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chapter, project } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const chapters = await db
		.select()
		.from(chapter)
		.where(eq(chapter.userId, user.id))
		.orderBy(desc(chapter.createdAt));

	return json({ chapters });
};

export const POST: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const body = await event.request.json();
	const projectId = Number(body?.projectId);
	const title = String(body?.title ?? '').trim();
	const chapterNumber = Number(body?.chapterNumber ?? 1);
	const status = String(body?.status ?? 'draft').trim() || 'draft';

	if (Number.isNaN(projectId)) {
		return json({ error: 'Project is required.' }, { status: 400 });
	}

	if (!title) {
		return json({ error: 'Chapter title is required.' }, { status: 400 });
	}

	if (Number.isNaN(chapterNumber) || chapterNumber < 1) {
		return json({ error: 'Chapter number must be greater than 0.' }, { status: 400 });
	}

	const selectedProject = await db.query.project.findFirst({
		where: and(eq(project.id, projectId), eq(project.userId, user.id))
	});

	if (!selectedProject) {
		return json({ error: 'Project not found.' }, { status: 404 });
	}

	const [created] = await db
		.insert(chapter)
		.values({ userId: user.id, projectId, title, chapterNumber, status })
		.returning();

	return json({ chapter: created }, { status: 201 });
};
