import { json, type RequestHandler } from '@sveltejs/kit';
import { stack } from '$lib/server/stack';
import { setSessionCookies, getAppOrigin } from '$lib/server/auth';
import { signUpSchema } from '$lib/schemas/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		let body: Record<string, unknown>;
		try {
			body = await request.json();
		} catch {
			return json({ error: 'Invalid JSON in request body' }, { status: 400 });
		}

		const parseResult = signUpSchema.safeParse(body);

		if (!parseResult.success) {
			return json(
				{
					error: 'Validation failed',
					details: parseResult.error.flatten().fieldErrors
				},
				{ status: 400 }
			);
		}

		const { email, password } = parseResult.data;

		const origin = getAppOrigin();
		const verificationCallbackUrl = `${origin}/auth/verify-email`;

		const result = await stack.signUp(email, password, verificationCallbackUrl);

		if (result.error || !result.data) {
			return json({ error: result.error?.message || 'Sign up failed' }, { status: 400 });
		}

		setSessionCookies(cookies, result.data.session);

		return json({ user: result.data.user });
	} catch (error) {
		console.error('Sign up error:', error);
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
