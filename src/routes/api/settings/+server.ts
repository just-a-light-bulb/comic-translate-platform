import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOrCreateUserSettings, updateUserSettings } from '$lib/server/user-settings';
import { kindeAuthClient, type SessionManager } from '@kinde-oss/kinde-auth-sveltekit';

export const GET: RequestHandler = async (event) => {
	try {
		const user = await kindeAuthClient.getUser(event.request as unknown as SessionManager);
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const settings = await getOrCreateUserSettings(user.id);
		return json({ settings });
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

		const data = await event.request.json();

		// Validate allowed fields
		const allowedFields = ['displayName', 'language', 'theme'];
		const updateData: Record<string, string> = {};

		for (const field of allowedFields) {
			if (data[field] !== undefined) {
				updateData[field] = data[field];
			}
		}

		// Validate theme
		if (updateData.theme && !['light', 'dark'].includes(updateData.theme)) {
			return json({ error: 'Invalid theme value' }, { status: 400 });
		}

		// Validate language
		if (updateData.language && !['en', 'th'].includes(updateData.language)) {
			return json({ error: 'Invalid language value' }, { status: 400 });
		}

		const settings = await updateUserSettings(user.id, updateData);
		return json({ settings });
	} catch (error) {
		console.error('Error updating user settings:', error);
		return json({ error: 'Failed to update settings' }, { status: 500 });
	}
};
