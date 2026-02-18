import { redirect } from '@sveltejs/kit';
import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	try {
		const user = await kindeAuthClient.getUser(event.request as unknown as SessionManager);
		if (user) {
			throw redirect(302, '/');
		}
	} catch (error) {
		if (error instanceof Error && error.message?.includes('redirect')) {
			throw error;
		}
	}
	return {};
};
