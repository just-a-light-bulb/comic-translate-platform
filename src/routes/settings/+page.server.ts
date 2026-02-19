import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';
import { getOrCreateUserSettings } from '$lib/server/user-settings';

export const load: PageServerLoad = async (event) => {
	try {
		const user = await kindeAuthClient.getUser(event.request as unknown as SessionManager);
		if (!user) {
			throw redirect(302, '/api/auth/login');
		}

		const settings = await getOrCreateUserSettings(user.id);

		return {
			user: {
				id: user.id,
				email: user.email,
				givenName: user.given_name,
				familyName: user.family_name,
				picture: user.picture
			},
			settings: {
				displayName: settings.displayName,
				language: settings.language,
				theme: settings.theme
			}
		};
	} catch (error) {
		if (error instanceof Response && error.status === 302) {
			throw error;
		}
		console.error('Error loading settings:', error);
		throw redirect(302, '/api/auth/login');
	}
};
