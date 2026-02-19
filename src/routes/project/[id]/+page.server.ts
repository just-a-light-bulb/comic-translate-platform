import { error, fail, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { chapter, project } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const getProjectId = (value: string) => {
	const id = Number(value);
	if (Number.isNaN(id)) {
		throw error(400, 'Invalid project id.');
	}
	return id;
};

export const load: PageServerLoad = async (event) => {
	const user = await requireUser(event);
	const projectId = getProjectId(event.params.id);

	const selectedProject = await db.query.project.findFirst({
		where: and(eq(project.id, projectId), eq(project.userId, user.id))
	});

	if (!selectedProject) {
		throw error(404, 'Project not found.');
	}

	const chapters = await db
		.select()
		.from(chapter)
		.where(and(eq(chapter.projectId, projectId), eq(chapter.userId, user.id)))
		.orderBy(desc(chapter.createdAt));

	return { project: selectedProject, chapters };
};

export const actions: Actions = {
	updateProject: async (event) => {
		const user = await requireUser(event);
		const projectId = getProjectId(event.params.id);
		const formData = await event.request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();

		if (!name) {
			return fail(400, { error: 'Project name is required.' });
		}

		await db
			.update(project)
			.set({ name, description: description || null })
			.where(and(eq(project.id, projectId), eq(project.userId, user.id)));

		return { success: true };
	},

	deleteProject: async (event) => {
		const user = await requireUser(event);
		const projectId = getProjectId(event.params.id);

		await db
			.delete(chapter)
			.where(and(eq(chapter.projectId, projectId), eq(chapter.userId, user.id)));
		await db.delete(project).where(and(eq(project.id, projectId), eq(project.userId, user.id)));

		throw redirect(303, '/projects');
	},

	createChapter: async (event) => {
		const user = await requireUser(event);
		const projectId = getProjectId(event.params.id);
		const formData = await event.request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const chapterNumber = Number(formData.get('chapterNumber') ?? 1);
		const status = String(formData.get('status') ?? 'draft').trim() || 'draft';

		if (!title) {
			return fail(400, { error: 'Chapter title is required.' });
		}

		if (Number.isNaN(chapterNumber) || chapterNumber < 1) {
			return fail(400, { error: 'Chapter number must be greater than 0.' });
		}

		await db.insert(chapter).values({
			userId: user.id,
			projectId,
			title,
			chapterNumber,
			status
		});

		return { success: true };
	},

	deleteChapter: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));

		if (Number.isNaN(id)) {
			return fail(400, { error: 'Chapter id is invalid.' });
		}

		await db.delete(chapter).where(and(eq(chapter.id, id), eq(chapter.userId, user.id)));
		return { success: true };
	}
};
