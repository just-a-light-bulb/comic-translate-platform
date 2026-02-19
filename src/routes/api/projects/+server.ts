import { desc, eq } from 'drizzle-orm';
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { project } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const projects = await db
		.select()
		.from(project)
		.where(eq(project.userId, user.id))
		.orderBy(desc(project.createdAt));

	return json({ projects });
};

export const POST: RequestHandler = async (event) => {
	const user = await requireUser(event);
	const body = await event.request.json();
	const name = String(body?.name ?? '').trim();
	const description = String(body?.description ?? '').trim();

	if (!name) {
		return json({ error: 'Project name is required.' }, { status: 400 });
	}

	const [created] = await db
		.insert(project)
		.values({ userId: user.id, name, description: description || null })
		.returning();

	return json({ project: created }, { status: 201 });
};
