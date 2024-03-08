import bcrypt from 'bcrypt';
import db from '~/utils/db.server';

import { createCookieSessionStorage, redirect } from '@remix-run/node';

export interface Login {
	email: string;
	password: string;
}

// Login user
export async function login({ email, password }: Login) {
	const user = await db.user.findFirst({
		where: {
			email,
		},
	});

	if (!user) return null;

	// Check password
	const isPasswordMatched = await bcrypt.compare(password, user.password);

	if (!isPasswordMatched) return null;

	return user;
}

// Register new user
export async function register({ email, password }: Login) {
	const passwordHash = await bcrypt.hash(password, 10);
	if (passwordHash) {
		return await db.user.create({
			data: {
				email,
				password: passwordHash,
			},
		});
	}
}

// Get session secret
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
	throw new Error('No session secret');
}

// Create session storage
const storage = createCookieSessionStorage({
	cookie: {
		name: 'rcr_session',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: [sessionSecret],
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 60,
	},
});

// Create user session
export async function createUserSession(user_id: number, redirectTo: string) {
	const session = await storage.getSession();
	session.set('user_id', user_id);
	return redirect(redirectTo, {
		headers: {
			'Set-Cookie': await storage.commitSession(session),
		},
	});
}

// Get user session
export function getUserSession(request: Request) {
	return storage.getSession(request.headers.get('Cookie'));
}

// Get logged in user
export async function getUser(request: Request) {
	const session = await getUserSession(request);
	const user_id = session.get('user_id');
	if (!user_id || typeof user_id !== 'number') {
		return null;
	}

	try {
		const user = await db.user.findUnique({ where: { id: +user_id } });
		return user;
	} catch (error) {
		return null;
	}
}

// Logout user and destroy session
export async function logout(request: Request) {
	const session = await storage.getSession(request.headers.get('Cookie'));
	return redirect('/login', {
		headers: {
			'Set-Cookie': await storage.destroySession(session),
		},
	});
}
