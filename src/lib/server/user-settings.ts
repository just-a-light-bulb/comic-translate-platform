import { db } from './db';
import { userSettings } from './db/schema';
import { eq } from 'drizzle-orm';

export type UserSettings = {
	id: number;
	userId: string;
	displayName: string | null;
	language: string;
	theme: string;
	createdAt: Date;
	updatedAt: Date;
};

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
	const settings = await db
		.select()
		.from(userSettings)
		.where(eq(userSettings.userId, userId))
		.limit(1);
	return settings[0] || null;
}

export async function createUserSettings(userId: string): Promise<UserSettings> {
	const [settings] = await db
		.insert(userSettings)
		.values({
			userId,
			language: 'en',
			theme: 'light'
		})
		.returning();
	return settings;
}

export async function updateUserSettings(
	userId: string,
	data: Partial<Pick<UserSettings, 'displayName' | 'language' | 'theme'>>
): Promise<UserSettings> {
	const existing = await getUserSettings(userId);

	if (!existing) {
		const [settings] = await db
			.insert(userSettings)
			.values({
				userId,
				...data
			})
			.returning();
		return settings;
	}

	const [updated] = await db
		.update(userSettings)
		.set({
			...data,
			updatedAt: new Date()
		})
		.where(eq(userSettings.userId, userId))
		.returning();

	return updated;
}

export async function getOrCreateUserSettings(userId: string): Promise<UserSettings> {
	const existing = await getUserSettings(userId);
	if (existing) return existing;
	return createUserSettings(userId);
}
