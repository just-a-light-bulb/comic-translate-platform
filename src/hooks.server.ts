import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { sessionHooks, type EventHandler } from '@kinde-oss/kinde-auth-sveltekit';
import { paraglideMiddleware } from '$lib/paraglide/server';

type KindeSessionRequest = Request & {
	getSessionItem?: (itemKey: string) => Promise<unknown> | unknown;
	setSessionItem?: (itemKey: string, itemValue: unknown) => Promise<void>;
	removeSessionItem?: (itemKey: string) => Promise<void>;
	destroySession?: () => Promise<void>;
};

const handleKinde: Handle = async ({ event, resolve }) => {
	await sessionHooks({ event: event as EventHandler });

	// Store session manager methods on locals since request gets cloned by SvelteKit
	// for server endpoints
	const kindeSessionRequest = event.request as KindeSessionRequest;
	event.locals.getSessionItem = kindeSessionRequest.getSessionItem?.bind(kindeSessionRequest);
	event.locals.setSessionItem = kindeSessionRequest.setSessionItem?.bind(kindeSessionRequest);
	event.locals.removeSessionItem = kindeSessionRequest.removeSessionItem?.bind(kindeSessionRequest);
	event.locals.destroySession = kindeSessionRequest.destroySession?.bind(kindeSessionRequest);

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
