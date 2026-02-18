import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	try {
		const user = await kindeAuthClient.getUser(request as unknown as SessionManager);
		return json({ user });
	} catch {
		return json({ user: null });
	}
};
