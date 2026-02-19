import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { chapter, project } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const parseChapterId = (value: string) => {
	const id = Number(value);
	if (Number.isNaN(id)) {
		throw error(400, 'Invalid chapter id.');
	}
	return id;
};

export const load: PageServerLoad = async (event) => {
	const user = await requireUser(event);
	const chapterId = parseChapterId(event.params.id);

	const [selectedChapter, projects] = await Promise.all([
		db.query.chapter.findFirst({
			where: and(eq(chapter.id, chapterId), eq(chapter.userId, user.id))
		}),
		db.select().from(project).where(eq(project.userId, user.id))
	]);

	if (!selectedChapter) {
		throw error(404, 'Chapter not found.');
	}

	return { chapter: selectedChapter, projects };
};

export const actions: Actions = {
	update: async (event) => {
		const user = await requireUser(event);
		const chapterId = parseChapterId(event.params.id);
		const formData = await event.request.formData();
		const projectId = Number(formData.get('projectId'));
		const title = String(formData.get('title') ?? '').trim();
		const chapterNumber = Number(formData.get('chapterNumber') ?? 1);
		const status = String(formData.get('status') ?? 'draft').trim() || 'draft';

		if (!Number.isInteger(projectId) || projectId < 1) {
			throw error(400, 'Project id must be a positive integer.');
		}

		if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
			throw error(400, 'Chapter number must be a positive integer.');
		}

		const selectedProject = await db.query.project.findFirst({
			where: and(eq(project.id, projectId), eq(project.userId, user.id))
		});

		if (!selectedProject) {
			throw error(404, 'Project not found.');
		}

		await db
			.update(chapter)
			.set({ projectId, title, chapterNumber, status })
			.where(and(eq(chapter.id, chapterId), eq(chapter.userId, user.id)));

		return { success: true };
	},

	delete: async (event) => {
		const user = await requireUser(event);
		const chapterId = parseChapterId(event.params.id);

		await db.delete(chapter).where(and(eq(chapter.id, chapterId), eq(chapter.userId, user.id)));
		throw redirect(303, '/chapters');
	}
};
