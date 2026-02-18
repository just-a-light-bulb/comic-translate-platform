import { redirect, type RequestHandler } from '@sveltejs/kit';
import { stack } from '$lib/server/stack';
import { setOAuthStateCookie, generateOAuthState, getAppOrigin } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const providerId = params.provider;

	if (!providerId) {
		throw redirect(302, '/sign-in?error=Missing OAuth provider');
	}

	const state = generateOAuthState();

	const origin = getAppOrigin();
	const redirectUri = `${origin}/api/auth/oauth/callback`;

	setOAuthStateCookie(cookies, state);

	const oauthUrl = stack.getOAuthUrl(providerId, redirectUri, state);

	throw redirect(302, oauthUrl);
};
