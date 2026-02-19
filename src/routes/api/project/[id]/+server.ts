import { and, eq } from 'drizzle-orm';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chapter, project } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';

const parseProjectId = (value: string | undefined) => {
	if (!value) {
		throw error(400, 'Project id is required.');
	}
	const id = Number(value);
	if (Number.isNaN(id)) {
		throw error(400, 'Invalid project id.');
	}
	return id;
};

export const GET: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const projectId = parseProjectId(event.params.id);

	const selectedProject = await db.query.project.findFirst({
		where: and(eq(project.id, projectId), eq(project.userId, user.id))
	});

	if (!selectedProject) {
		throw error(404, 'Project not found.');
	}

	const chapters = await db
		.select()
		.from(chapter)
		.where(and(eq(chapter.projectId, projectId), eq(chapter.userId, user.id)));

	return json({ project: selectedProject, chapters });
};

export const PATCH: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const projectId = parseProjectId(event.params.id);
	const body = await event.request.json();
	const name = String(body?.name ?? '').trim();
	const description = String(body?.description ?? '').trim();

	if (!name) {
		return json({ error: 'Project name is required.' }, { status: 400 });
	}

	const [updated] = await db
		.update(project)
		.set({ name, description: description || null })
		.where(and(eq(project.id, projectId), eq(project.userId, user.id)))
		.returning();

	if (!updated) {
		throw error(404, 'Project not found.');
	}

	return json({ project: updated });
};

export const DELETE: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const projectId = parseProjectId(event.params.id);

	await db
		.delete(chapter)
		.where(and(eq(chapter.projectId, projectId), eq(chapter.userId, user.id)));
	const deleted = await db
		.delete(project)
		.where(and(eq(project.id, projectId), eq(project.userId, user.id)))
		.returning({ id: project.id });

	if (deleted.length === 0) {
		throw error(404, 'Project not found.');
	}

	return json({ success: true });
};
