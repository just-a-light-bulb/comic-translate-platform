import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';
import type { LayoutServerLoad } from './$types';

type KindeSessionRequest = Request & {
	getSessionItem?: (itemKey: string) => Promise<unknown> | unknown;
	setSessionItem?: (itemKey: string, itemValue: unknown) => Promise<void>;
	removeSessionItem?: (itemKey: string) => Promise<void>;
	destroySession?: () => Promise<void>;
};

export const load: LayoutServerLoad = async (event) => {
	try {
		const kindeRequest = event.request as KindeSessionRequest;
		if (event.locals.getSessionItem) {
			kindeRequest.getSessionItem = event.locals.getSessionItem;
		}
		if (event.locals.setSessionItem) {
			kindeRequest.setSessionItem = event.locals.setSessionItem;
		}
		if (event.locals.removeSessionItem) {
			kindeRequest.removeSessionItem = event.locals.removeSessionItem;
		}
		if (event.locals.destroySession) {
			kindeRequest.destroySession = event.locals.destroySession;
		}

		const user = await kindeAuthClient.getUser(kindeRequest as unknown as SessionManager);
		return { user };
	} catch {
		return { user: null };
	}
};
