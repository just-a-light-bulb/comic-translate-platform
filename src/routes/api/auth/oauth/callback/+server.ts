import { redirect, type RequestHandler } from '@sveltejs/kit';
import { stack } from '$lib/server/stack';
import {
	getOAuthStateCookie,
	clearOAuthStateCookie,
	setSessionCookies,
	getAppOrigin
} from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');
		const error = url.searchParams.get('error');
		const errorDescription = url.searchParams.get('error_description');

		if (error) {
			console.error('OAuth error:', error, errorDescription);
			throw redirect(302, `/sign-in?error=${encodeURIComponent(errorDescription || error)}`);
		}

		if (!code || !state) {
			throw redirect(302, '/sign-in?error=Missing authorization code or state');
		}

		const storedState = getOAuthStateCookie(cookies);

		if (!storedState || storedState !== state) {
			throw redirect(302, '/sign-in?error=Invalid state parameter');
		}

		clearOAuthStateCookie(cookies);

		const origin = getAppOrigin();
		const redirectUri = `${origin}/api/auth/oauth/callback`;

		const result = await stack.exchangeOAuthCode(code, redirectUri);

		if (result.error || !result.data) {
			console.error('OAuth exchange error:', result.error);
			throw redirect(
				302,
				`/sign-in?error=${encodeURIComponent(result.error?.message || 'OAuth authentication failed')}`
			);
		}

		setSessionCookies(cookies, result.data.session);

		throw redirect(302, '/');
	} catch (err) {
		if (err instanceof Response || (err && typeof err === 'object' && 'status' in err)) {
			throw err;
		}
		console.error('OAuth callback error:', err);
		throw redirect(302, '/sign-in?error=An unexpected error occurred');
	}
};
