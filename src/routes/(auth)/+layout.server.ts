import { redirect } from '@sveltejs/kit';
import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = await kindeAuthClient.getUser(event.request as unknown as SessionManager);
	if (user) {
		throw redirect(302, '/');
	}
	return {};
};
