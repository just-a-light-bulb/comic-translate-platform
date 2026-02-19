import { fail } from '@sveltejs/kit';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { accountProfile, chapter, project, task } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = await requireUser(event);

	const [tasks, profile, projects, chapters] = await Promise.all([
		db.select().from(task).where(eq(task.userId, user.id)).orderBy(desc(task.createdAt)),
		db.query.accountProfile.findFirst({ where: eq(accountProfile.userId, user.id) }),
		db.select().from(project).where(eq(project.userId, user.id)).orderBy(desc(project.createdAt)),
		db.select().from(chapter).where(eq(chapter.userId, user.id)).orderBy(desc(chapter.createdAt))
	]);

	return { user, tasks, profile, projects, chapters };
};

export const actions: Actions = {
	createTask: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const priority = Number(formData.get('priority') ?? 1);

		if (!title) return fail(400, { error: 'Task title is required.' });
		if (Number.isNaN(priority) || priority < 1 || priority > 5) {
			return fail(400, { error: 'Priority must be between 1 and 5.' });
		}

		await db.insert(task).values({ userId: user.id, title, priority });
		return { success: true };
	},

	updateTask: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));
		const title = String(formData.get('title') ?? '').trim();
		const priority = Number(formData.get('priority') ?? 1);

		if (Number.isNaN(id)) return fail(400, { error: 'Task id is invalid.' });
		if (!title) return fail(400, { error: 'Task title is required.' });
		if (Number.isNaN(priority) || priority < 1 || priority > 5) {
			return fail(400, { error: 'Priority must be between 1 and 5.' });
		}

		await db
			.update(task)
			.set({ title, priority })
			.where(and(eq(task.id, id), eq(task.userId, user.id)));
		return { success: true };
	},

	deleteTask: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));

		if (Number.isNaN(id)) return fail(400, { error: 'Task id is invalid.' });
		await db.delete(task).where(and(eq(task.id, id), eq(task.userId, user.id)));
		return { success: true };
	},

	createProject: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();

		if (!name) return fail(400, { error: 'Project name is required.' });

		await db.insert(project).values({ userId: user.id, name, description: description || null });
		return { success: true };
	},

	updateProject: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();

		if (Number.isNaN(id)) return fail(400, { error: 'Project id is invalid.' });
		if (!name) return fail(400, { error: 'Project name is required.' });

		await db
			.update(project)
			.set({ name, description: description || null })
			.where(and(eq(project.id, id), eq(project.userId, user.id)));

		return { success: true };
	},

	deleteProject: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));

		if (Number.isNaN(id)) return fail(400, { error: 'Project id is invalid.' });

		const ownedChapters = await db
			.select({ id: chapter.id })
			.from(chapter)
			.where(and(eq(chapter.projectId, id), eq(chapter.userId, user.id)));

		if (ownedChapters.length > 0) {
			await db.delete(chapter).where(
				inArray(
					chapter.id,
					ownedChapters.map((item) => item.id)
				)
			);
		}

		await db.delete(project).where(and(eq(project.id, id), eq(project.userId, user.id)));
		return { success: true };
	},

	createChapter: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const projectId = Number(formData.get('projectId'));
		const title = String(formData.get('title') ?? '').trim();
		const chapterNumber = Number(formData.get('chapterNumber') ?? 1);
		const status = String(formData.get('status') ?? 'draft').trim() || 'draft';

		if (Number.isNaN(projectId)) return fail(400, { error: 'Project is required for chapter.' });
		if (!title) return fail(400, { error: 'Chapter title is required.' });
		if (Number.isNaN(chapterNumber) || chapterNumber < 1) {
			return fail(400, { error: 'Chapter number must be greater than 0.' });
		}

		const ownedProject = await db.query.project.findFirst({
			where: and(eq(project.id, projectId), eq(project.userId, user.id))
		});

		if (!ownedProject) return fail(404, { error: 'Project not found.' });

		await db.insert(chapter).values({ userId: user.id, projectId, title, chapterNumber, status });
		return { success: true };
	},

	updateChapter: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));
		const projectId = Number(formData.get('projectId'));
		const title = String(formData.get('title') ?? '').trim();
		const chapterNumber = Number(formData.get('chapterNumber') ?? 1);
		const status = String(formData.get('status') ?? 'draft').trim() || 'draft';

		if (Number.isNaN(id)) return fail(400, { error: 'Chapter id is invalid.' });
		if (Number.isNaN(projectId)) return fail(400, { error: 'Project is required for chapter.' });
		if (!title) return fail(400, { error: 'Chapter title is required.' });
		if (Number.isNaN(chapterNumber) || chapterNumber < 1) {
			return fail(400, { error: 'Chapter number must be greater than 0.' });
		}

		const ownedProject = await db.query.project.findFirst({
			where: and(eq(project.id, projectId), eq(project.userId, user.id))
		});

		if (!ownedProject) return fail(404, { error: 'Project not found.' });

		await db
			.update(chapter)
			.set({ projectId, title, chapterNumber, status })
			.where(and(eq(chapter.id, id), eq(chapter.userId, user.id)));

		return { success: true };
	},

	deleteChapter: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));

		if (Number.isNaN(id)) return fail(400, { error: 'Chapter id is invalid.' });

		await db.delete(chapter).where(and(eq(chapter.id, id), eq(chapter.userId, user.id)));
		return { success: true };
	},

	updateProfile: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const displayName = String(formData.get('displayName') ?? '').trim();

		await db
			.insert(accountProfile)
			.values({ userId: user.id, displayName: displayName || null })
			.onConflictDoUpdate({
				target: accountProfile.userId,
				set: { displayName: displayName || null, updatedAt: new Date() }
			});

		return { success: true };
	}
};
