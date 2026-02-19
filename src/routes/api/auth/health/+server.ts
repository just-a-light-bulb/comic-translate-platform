import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';
import { json, type RequestHandler } from '@sveltejs/kit';

type KindeSessionRequest = Request & {
	getSessionItem?: (itemKey: string) => Promise<unknown> | unknown;
	setSessionItem?: (itemKey: string, itemValue: unknown) => Promise<void>;
	removeSessionItem?: (itemKey: string) => Promise<void>;
	destroySession?: () => Promise<void>;
};

export const GET: RequestHandler = async ({ request, locals }) => {
	try {
		const kindeRequest = request as KindeSessionRequest;
		if (locals.getSessionItem) {
			kindeRequest.getSessionItem = locals.getSessionItem;
		}
		if (locals.setSessionItem) {
			kindeRequest.setSessionItem = locals.setSessionItem;
		}
		if (locals.removeSessionItem) {
			kindeRequest.removeSessionItem = locals.removeSessionItem;
		}
		if (locals.destroySession) {
			kindeRequest.destroySession = locals.destroySession;
		}

		const user = await kindeAuthClient.getUser(kindeRequest as unknown as SessionManager);
		return json({ user });
	} catch {
		return json({ user: null });
	}
};
