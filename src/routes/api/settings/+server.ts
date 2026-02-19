import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOrCreateUserSettings, updateUserSettings } from '$lib/server/user-settings';
import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';
import { z } from 'zod';

const updateSettingsSchema = z.object({
	displayName: z.string().max(50, 'Display name must be 50 characters or less').optional(),
	language: z.enum(['en', 'th'], { message: 'Invalid language selected' }).optional(),
	theme: z.enum(['light', 'dark'], { message: 'Invalid theme selected' }).optional()
});

export const GET: RequestHandler = async (event) => {
	try {
		const user = await kindeAuthClient.getUser(event.request as unknown as SessionManager);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const settings = await getOrCreateUserSettings(user.id);
		return json({
			settings: {
				displayName: settings.displayName,
				language: settings.language,
				theme: settings.theme,
				createdAt: settings.createdAt,
				updatedAt: settings.updatedAt
			}
		});
	} catch (error) {
		console.error('Error fetching user settings:', error);
		return json({ error: 'Failed to fetch settings' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const user = await kindeAuthClient.getUser(event.request as unknown as SessionManager);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await event.request.json();
		const result = updateSettingsSchema.safeParse(body);

		if (!result.success) {
			const errors = result.error.errors.map((err) => ({
				field: err.path.join('.'),
				message: err.message
			}));
			return json({ error: 'Validation failed', errors }, { status: 400 });
		}

		const updateData: Record<string, string> = {};
		if (result.data.displayName !== undefined) updateData.displayName = result.data.displayName;
		if (result.data.language !== undefined) updateData.language = result.data.language;
		if (result.data.theme !== undefined) updateData.theme = result.data.theme;

		if (Object.keys(updateData).length === 0) {
			return json({ error: 'No valid fields to update' }, { status: 400 });
		}

		const settings = await updateUserSettings(user.id, updateData);
		return json({
			settings: {
				displayName: settings.displayName,
				language: settings.language,
				theme: settings.theme,
				updatedAt: settings.updatedAt
			}
		});
	} catch (error) {
		console.error('Error updating user settings:', error);
		return json({ error: 'Failed to update settings' }, { status: 500 });
	}
};
