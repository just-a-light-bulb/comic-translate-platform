import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';
import { getOrCreateUserSettings, updateUserSettings } from '$lib/server/user-settings';
import { z } from 'zod';

const settingsSchema = z.object({
	displayName: z.string().max(50, 'Display name must be 50 characters or less').optional(),
	language: z.enum(['en', 'th'], { message: 'Invalid language selected' }),
	theme: z.enum(['light', 'dark', { message: 'Invalid theme selected' }])
});

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

export const actions: Actions = {
	default: async (event) => {
		try {
			const user = await kindeAuthClient.getUser(event.request as unknown as SessionManager);
			if (!user) {
				return fail(401, { error: 'Unauthorized' });
			}

			const formData = await event.request.formData();
			const displayName = formData.get('displayName') as string;
			const language = formData.get('language') as string;
			const theme = formData.get('theme') as string;

			const result = settingsSchema.safeParse({
				displayName: displayName || undefined,
				language,
				theme
			});

			if (!result.success) {
				const errors: Record<string, string> = {};
				result.error.errors.forEach((err) => {
					if (err.path[0]) {
						errors[err.path[0]] = err.message;
					}
				});
				return fail(400, { error: 'Validation failed', errors, displayName, language, theme });
			}

			const updatedSettings = await updateUserSettings(user.id, result.data);

			return {
				success: true,
				settings: {
					displayName: updatedSettings.displayName,
					language: updatedSettings.language,
					theme: updatedSettings.theme
				}
			};
		} catch (error) {
			console.error('Error updating settings:', error);
			return fail(500, { error: 'Failed to update settings' });
		}
	}
};
