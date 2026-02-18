import { json, type RequestHandler } from '@sveltejs/kit';
import { authenticateRequest, clearSessionCookies } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const user = await authenticateRequest(cookies);
		return json({ user });
	} catch (error) {
		console.error('Session error:', error);
		clearSessionCookies(cookies);
		return json({ user: null });
	}
};
