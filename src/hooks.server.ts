import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { sessionHooks, type EventHandler } from '@kinde-oss/kinde-auth-sveltekit';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleKinde: Handle = async ({ event, resolve }) => {
	await sessionHooks({ event: event as EventHandler });

	// Store session manager methods on locals since request gets cloned by SvelteKit
	// for server endpoints
	event.locals.getSessionItem = (event.request as any).getSessionItem?.bind(event.request);
	event.locals.setSessionItem = (event.request as any).setSessionItem?.bind(event.request);
	event.locals.removeSessionItem = (event.request as any).removeSessionItem?.bind(event.request);
	event.locals.destroySession = (event.request as any).destroySession?.bind(event.request);

	const response = await resolve(event);
	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle: Handle = sequence(handleKinde, handleParaglide);
