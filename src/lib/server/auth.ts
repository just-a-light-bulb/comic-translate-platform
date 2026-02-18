import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import type { AuthUser, AuthSession } from './stack';

const ACCESS_TOKEN_COOKIE = 'stack_access_token';
const REFRESH_TOKEN_COOKIE = 'stack_refresh_token';
const OAUTH_STATE_COOKIE = 'stack_oauth_state';

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: !dev,
	sameSite: 'lax' as const
};

export function getAppOrigin(): string {
	const origin = env.ORIGIN;
	if (!origin) {
		if (dev) {
			return 'http://localhost:5173';
		}
		throw new Error('ORIGIN environment variable is required in production');
	}
	return origin;
}

export function setSessionCookies(cookies: Cookies, session: AuthSession): void {
	const accessTokenMaxAge = 60 * 60 * 24 * 7;
	const refreshTokenMaxAge = 60 * 60 * 24 * 30;

	cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, {
		...COOKIE_OPTIONS,
		maxAge: accessTokenMaxAge
	});

	cookies.set(REFRESH_TOKEN_COOKIE, session.refreshToken, {
		...COOKIE_OPTIONS,
		maxAge: refreshTokenMaxAge
	});
}

export function clearSessionCookies(cookies: Cookies): void {
	cookies.delete(ACCESS_TOKEN_COOKIE, { path: '/' });
	cookies.delete(REFRESH_TOKEN_COOKIE, { path: '/' });
}

export function getSessionFromCookies(cookies: Cookies): AuthSession | null {
	const accessToken = cookies.get(ACCESS_TOKEN_COOKIE);
	const refreshToken = cookies.get(REFRESH_TOKEN_COOKIE);

	if (!accessToken || !refreshToken) {
		return null;
	}

	return {
		accessToken,
		refreshToken,
		expiresAt: 0
	};
}

export function setOAuthStateCookie(cookies: Cookies, state: string): void {
	cookies.set(OAUTH_STATE_COOKIE, state, {
		...COOKIE_OPTIONS,
		maxAge: 60 * 10
	});
}

export function getOAuthStateCookie(cookies: Cookies): string | undefined {
	return cookies.get(OAUTH_STATE_COOKIE);
}

export function clearOAuthStateCookie(cookies: Cookies): void {
	cookies.delete(OAUTH_STATE_COOKIE, { path: '/' });
}

export function generateOAuthState(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function authenticateRequest(cookies: Cookies): Promise<AuthUser | null> {
	const session = getSessionFromCookies(cookies);

	if (!session) {
		return null;
	}

	const { stack } = await import('./stack');
	const result = await stack.getUser(session.accessToken);

	if (result.error) {
		const refreshResult = await stack.refreshToken(session.refreshToken);

		if (refreshResult.error || !refreshResult.data) {
			clearSessionCookies(cookies);
			return null;
		}

		setSessionCookies(cookies, refreshResult.data);

		const userResult = await stack.getUser(refreshResult.data.accessToken);

		if (userResult.error || !userResult.data) {
			clearSessionCookies(cookies);
			return null;
		}

		return userResult.data;
	}

	return result.data || null;
}

export async function requireAuth(cookies: Cookies): Promise<AuthUser> {
	const user = await authenticateRequest(cookies);

	if (!user) {
		throw new Error('Unauthorized');
	}

	return user;
}
