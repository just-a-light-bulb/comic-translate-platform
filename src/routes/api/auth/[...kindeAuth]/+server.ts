import { handleAuth } from '@kinde-oss/kinde-auth-sveltekit';
import type { RequestEvent } from '@sveltejs/kit';

export function GET(requestEvent: RequestEvent) {
	// Copy session manager methods from locals back to request
	// since SvelteKit clones the request object for server endpoints
	const request = requestEvent.request as any;
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
