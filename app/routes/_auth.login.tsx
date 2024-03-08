import type { ActionFunctionArgs } from '@remix-run/node'; // or cloudflare/deno
import { json } from '@remix-run/node'; // or cloudflare/deno
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

import db from '~/utils/db.server';
import { createUserSession, login } from '~/utils/session.server';
import { useEffect, useRef } from 'react';

// Define a schema for your form
const schema = z.object({
	email: z.string().email({ message: 'Email must have @ and domain' }),
	password: z.string().min(8),
});

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema });

	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		return submission.reply();
	}

	let data = Object.fromEntries(formData);

	const result = await login({
		email: data.email.toString(),
		password: data.password.toString(),
	});

	if (!result) {
		return json({
			success: false,
			payload: {
				email: data.email,
			},
			error: {
				code: 400,
				message: 'Incorrect username or password.',
			},
		});
	}

	return createUserSession(result.id, '/dashboard');
}

export async function loader() {
	return json(await db.user.findMany());
}

export default function Todos() {
	const data = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	let $form = useRef<HTMLFormElement>(null);
	let navigation = useNavigation();
	const [form, fields] = useForm({
		// Configure when each field should be validated
		shouldValidate: 'onBlur',
		// Optional: Required only if you're validating on the server
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});

	useEffect(
		function resetFormOnSuccess() {
			if (navigation.state === 'idle' && actionData) {
				$form.current?.reset();
			}
		},
		[navigation.state, actionData],
	);

	return (
		<div>
			<Form ref={$form} method="post" id={form.id} onSubmit={form.onSubmit}>
				<div>
					{actionData &&
						actionData?.success === false &&
						actionData?.error?.message}
				</div>
				<input type="email" name="email" />
				<div>{fields.email.errors}</div>
				<input type="password" name="password" />
				<div>{fields.password.errors}</div>
				<button type="submit">Continue</button>
			</Form>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
}
