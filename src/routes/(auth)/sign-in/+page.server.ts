import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const error = url.searchParams.get('error');
	return {
		error: error || undefined
	};
};
