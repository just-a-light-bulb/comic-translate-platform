declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface PageData {}
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface PageState {}
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface Platform {}
		interface Locals {
			getSessionItem?: (itemKey: string) => Promise<unknown> | unknown;
			setSessionItem?: (itemKey: string, itemValue: unknown) => Promise<void>;
			removeSessionItem?: (itemKey: string) => Promise<void>;
			destroySession?: () => Promise<void>;
		}
	}
}

export {};
