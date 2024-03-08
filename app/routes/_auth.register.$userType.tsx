import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'; // or cloudflare/deno
import { json, redirect } from '@remix-run/node'; // or cloudflare/deno
import { Form, useLoaderData } from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

import db from '~/utils/db.server';
import { register } from '~/utils/session.server';
import type { Login } from '~/utils/session.server';
import { useEffect } from 'react';

// Define a schema for your form
const schema = z
	.object({
		email: z.string().email({ message: 'Email must have @ and domain' }),
		password: z.string().min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema });

	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		return submission.reply();
	}

	let parsedData = Object.fromEntries(formData);
	let data: Login = {
		email: parsedData.email.toString(),
		password: parsedData.password.toString(),
	};

	await register(data);
	return redirect(`/login`);
}

export async function loader({ params }: LoaderFunctionArgs) {
	return json({ userType: params.userType });
}

export default function Index() {
	const data = useLoaderData<typeof loader>();
	const [form, fields] = useForm({
		shouldValidate: 'onBlur',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});

	return (
		<div>
			<Form method="post" id={form.id} onSubmit={form.onSubmit}>
				<div>{form.errors}</div>
				<input
					type="text"
					name="userType"
					defaultValue={data.userType?.toUpperCase()}
				/>
				<input placeholder="email" type="email" name="email" />
				<div>{fields.email.errors}</div>
				<input placeholder="password" type="password" name="password" />
				<div>{fields.password.errors}</div>
				<input
					placeholder="confirmPassword"
					type="password"
					name="confirmPassword"
				/>
				<div>{fields.confirmPassword.errors}</div>
				<button type="submit">Create User</button>
			</Form>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
}
