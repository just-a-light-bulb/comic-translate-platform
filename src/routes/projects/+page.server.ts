import { fail } from '@sveltejs/kit';
import { and, desc, eq, ilike, or, sql, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { chapter, project } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const ITEMS_PER_PAGE = 10;
const VALID_SORT_FIELDS = ['name', 'createdAt'] as const;
const VALID_SORT_DIRECTIONS = ['asc', 'desc'] as const;

type SortField = (typeof VALID_SORT_FIELDS)[number];
type SortDirection = (typeof VALID_SORT_DIRECTIONS)[number];

function parseSearchParams(url: URL) {
	const parsedPage = parseInt(url.searchParams.get('page') || '1', 10);
	const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
	const search = url.searchParams.get('search')?.trim() || '';
	const sortField = url.searchParams.get('sort') as SortField | null;
	const sortDirection = url.searchParams.get('dir') as SortDirection | null;

	return {
		page,
		search,
		sort: VALID_SORT_FIELDS.includes(sortField as SortField)
			? (sortField as SortField)
			: 'createdAt',
		dir: VALID_SORT_DIRECTIONS.includes(sortDirection as SortDirection)
			? (sortDirection as SortDirection)
			: 'desc'
	};
}

export const load: PageServerLoad = async (event) => {
	const user = await requireUser(event);
	const { page, search, sort, dir } = parseSearchParams(event.url);

	const whereClause = search
		? and(
				eq(project.userId, user.id),
				or(ilike(project.name, `%${search}%`), ilike(project.description, `%${search}%`))
			)
		: eq(project.userId, user.id);

	const [projects, [{ count } = { count: 0 }]] = await Promise.all([
		db
			.select()
			.from(project)
			.where(whereClause)
			.orderBy(dir === 'asc' ? asc(project[sort]) : desc(project[sort]))
			.limit(ITEMS_PER_PAGE)
			.offset((page - 1) * ITEMS_PER_PAGE),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(project)
			.where(whereClause)
	]);

	const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);

	return {
		projects,
		pagination: {
			page,
			totalPages,
			totalItems: Number(count),
			itemsPerPage: ITEMS_PER_PAGE
		},
		search,
		sort,
		dir
	};
};

export const actions: Actions = {
	create: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();

		if (!name) {
			return fail(400, { error: 'Project name is required.' });
		}

		await db.insert(project).values({ userId: user.id, name, description: description || null });
		return { success: true };
	},

	delete: async (event) => {
		const user = await requireUser(event);
		const formData = await event.request.formData();
		const id = Number(formData.get('id'));

		if (Number.isNaN(id)) {
			return fail(400, { error: 'Project id is invalid.' });
		}

		await db.delete(chapter).where(and(eq(chapter.projectId, id), eq(chapter.userId, user.id)));
		await db.delete(project).where(and(eq(project.id, id), eq(project.userId, user.id)));
		return { success: true };
	}
};
