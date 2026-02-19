import { handleAuth } from '@kinde-oss/kinde-auth-sveltekit';
import type { RequestEvent } from '@sveltejs/kit';

type KindeSessionRequest = Request & {
	getSessionItem?: (itemKey: string) => Promise<unknown> | unknown;
	setSessionItem?: (itemKey: string, itemValue: unknown) => Promise<void>;
	removeSessionItem?: (itemKey: string) => Promise<void>;
	destroySession?: () => Promise<void>;
};

export function GET(requestEvent: RequestEvent) {
	// Copy session manager methods from locals back to request
	// since SvelteKit clones the request object for server endpoints
	const request = requestEvent.request as KindeSessionRequest;
	if (requestEvent.locals.getSessionItem) {
		request.getSessionItem = requestEvent.locals.getSessionItem;
	}
	if (requestEvent.locals.setSessionItem) {
		request.setSessionItem = requestEvent.locals.setSessionItem;
	}
	if (requestEvent.locals.removeSessionItem) {
		request.removeSessionItem = requestEvent.locals.removeSessionItem;
	}
	if (requestEvent.locals.destroySession) {
		request.destroySession = requestEvent.locals.destroySession;
	}

	return handleAuth(requestEvent);
}
