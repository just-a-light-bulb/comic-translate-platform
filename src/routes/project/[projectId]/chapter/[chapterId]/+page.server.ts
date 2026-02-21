import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { chapter, project, page, textElement } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const parseId = (value: string, name: string) => {
	const id = Number(value);
	if (Number.isNaN(id)) {
		throw error(400, `Invalid ${name}.`);
	}
	return id;
};

export const load: PageServerLoad = async (event) => {
	const user = await requireUser(event);
	const projectId = parseId(event.params.projectId, 'project id');
	const chapterId = parseId(event.params.chapterId, 'chapter id');

	const [selectedChapter, projects, pages, selectedProject] = await Promise.all([
		db.query.chapter.findFirst({
			where: and(eq(chapter.id, chapterId), eq(chapter.userId, user.id))
		}),
		db.select().from(project).where(eq(project.userId, user.id)),
		db.select().from(page).where(eq(page.chapterId, chapterId)).orderBy(page.pageNumber),
		db.query.project.findFirst({
			where: and(eq(project.id, projectId), eq(project.userId, user.id))
		})
	]);

	if (!selectedProject) {
		throw error(404, 'Project not found.');
	}

	if (!selectedChapter) {
		throw error(404, 'Chapter not found.');
	}

	if (selectedChapter.projectId !== projectId) {
		throw error(400, 'Chapter does not belong to this project.');
	}

	let firstPageElements: (typeof textElement.$inferSelect)[] = [];
	if (pages.length > 0) {
		firstPageElements = await db
			.select()
			.from(textElement)
			.where(eq(textElement.pageId, pages[0].id));
	}

	return {
		chapter: selectedChapter,
		project: selectedProject,
		projects,
		pages,
		firstPageElements
	};
};

export const actions: Actions = {
	update: async (event) => {
		const user = await requireUser(event);
		const chapterId = parseId(event.params.chapterId, 'chapter id');
		const formData = await event.request.formData();
		const newProjectId = Number(formData.get('projectId'));
		const title = String(formData.get('title') ?? '').trim();
		const chapterNumber = Number(formData.get('chapterNumber') ?? 1);
		const status = String(formData.get('status') ?? 'draft').trim() || 'draft';

		if (!Number.isInteger(newProjectId) || newProjectId < 1) {
			throw error(400, 'Project id must be a positive integer.');
		}

		if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
			throw error(400, 'Chapter number must be a positive integer.');
		}

		const selectedProject = await db.query.project.findFirst({
			where: and(eq(project.id, newProjectId), eq(project.userId, user.id))
		});

		if (!selectedProject) {
			throw error(404, 'Project not found.');
		}

		await db
			.update(chapter)
			.set({ projectId: newProjectId, title, chapterNumber, status })
			.where(and(eq(chapter.id, chapterId), eq(chapter.userId, user.id)));

		return { success: true };
	},

	delete: async (event) => {
		const user = await requireUser(event);
		const routeProjectId = parseId(event.params.projectId, 'project id');
		const chapterId = parseId(event.params.chapterId, 'chapter id');

		const existingChapter = await db.query.chapter.findFirst({
			where: and(eq(chapter.id, chapterId), eq(chapter.userId, user.id))
		});

		if (!existingChapter) {
			throw error(404, 'Chapter not found.');
		}

		await db.delete(chapter).where(and(eq(chapter.id, chapterId), eq(chapter.userId, user.id)));
		throw redirect(303, `/project/${routeProjectId}`);
	}
};
