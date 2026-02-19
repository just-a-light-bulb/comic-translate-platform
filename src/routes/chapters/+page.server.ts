import { fail } from '@sveltejs/kit';
import { and, desc, eq, ilike, or, sql, asc, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { chapter, project } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const ITEMS_PER_PAGE = 10;
const VALID_SORT_FIELDS = ['title', 'chapterNumber', 'status', 'createdAt'] as const;
const VALID_SORT_DIRECTIONS = ['asc', 'desc'] as const;
const VALID_STATUSES = ['draft', 'in_progress', 'review', 'done'] as const;

type SortField = (typeof VALID_SORT_FIELDS)[number];
type SortDirection = (typeof VALID_SORT_DIRECTIONS)[number];
type StatusFilter = (typeof VALID_STATUSES)[number];

function parseSearchParams(url: URL) {
	const parsedPage = parseInt(url.searchParams.get('page') || '1', 10);
	const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
	const search = url.searchParams.get('search')?.trim() || '';
	const sortField = url.searchParams.get('sort') as SortField | null;
	const sortDirection = url.searchParams.get('dir') as SortDirection | null;
	const status = url.searchParams.getAll('status') as StatusFilter[];
	const projectId = url.searchParams.get('projectId');

	return {
		page,
		search,
		sort: VALID_SORT_FIELDS.includes(sortField as SortField)
			? (sortField as SortField)
			: 'createdAt',
		dir: VALID_SORT_DIRECTIONS.includes(sortDirection as SortDirection)
			? (sortDirection as SortDirection)
			: 'desc',
		statuses: status.filter((s) => VALID_STATUSES.includes(s)),
		projectId: projectId ? parseInt(projectId, 10) : null
	};
}

export const load: PageServerLoad = async (event) => {
	const user = await requireUser(event);
	const { page, search, sort, dir, statuses, projectId } = parseSearchParams(event.url);

	const conditions = [eq(chapter.userId, user.id)];

	if (search) {
		conditions.push(ilike(chapter.title, `%${search}%`));
	}

	if (statuses.length > 0) {
		conditions.push(inArray(chapter.status, statuses));
	}

	if (projectId && !Number.isNaN(projectId)) {
		conditions.push(eq(chapter.projectId, projectId));
	}

	const whereClause = and(...conditions);

	const [chapters, [{ count } = { count: 0 }], projects] = await Promise.all([
		db
			.select()
			.from(chapter)
			.where(whereClause)
			.orderBy(dir === 'asc' ? asc(chapter[sort]) : desc(chapter[sort]))
			.limit(ITEMS_PER_PAGE)
			.offset((page - 1) * ITEMS_PER_PAGE),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(chapter)
			.where(whereClause),
		db.select().from(project).where(eq(project.userId, user.id)).orderBy(desc(project.createdAt))
	]);

	const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);

	return {
		chapters,
		projects,
		pagination: {
			page,
			totalPages,
			totalItems: Number(count),
			itemsPerPage: ITEMS_PER_PAGE
		},
		search,
		sort,
		dir,
		statuses,
		projectId
	};
};

export const actions: Actions = {
	create: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const projectId = Number(formData.get('projectId'));
		const title = String(formData.get('title') ?? '').trim();
		const chapterNumber = Number(formData.get('chapterNumber') ?? 1);
		const status = String(formData.get('status') ?? 'draft').trim() || 'draft';

		if (Number.isNaN(projectId)) return fail(400, { error: 'Project is required.' });
		if (!title) return fail(400, { error: 'Chapter title is required.' });
		if (Number.isNaN(chapterNumber) || chapterNumber < 1) {
			return fail(400, { error: 'Chapter number must be greater than 0.' });
		}

		const selectedProject = await db.query.project.findFirst({
			where: and(eq(project.id, projectId), eq(project.userId, user.id))
		});

		if (!selectedProject) return fail(404, { error: 'Project not found.' });

		await db.insert(chapter).values({ userId: user.id, projectId, title, chapterNumber, status });
		return { success: true };
	},

	delete: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));

		if (Number.isNaN(id)) return fail(400, { error: 'Chapter id is invalid.' });

		await db.delete(chapter).where(and(eq(chapter.id, id), eq(chapter.userId, user.id)));
		return { success: true };
	}
};
