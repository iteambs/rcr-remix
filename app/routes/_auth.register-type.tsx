import type { ActionFunctionArgs } from '@remix-run/node'; // or cloudflare/deno
import { json, redirect } from '@remix-run/node'; // or cloudflare/deno
import { Form, useLoaderData } from '@remix-run/react';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

import { USER_TYPE } from '@prisma/client';

enum type {
	CLIENT,
	TALENT,
}

// Define a schema for your form
const schema = z.object({
	type: z.nativeEnum(type),
});

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema });

	// Send the submission back to the client if the status is not successful
	if (submission.status !== 'success') {
		return submission.reply();
	}
	let parsedData = Object.fromEntries(formData);
	const type = parsedData.type.toString().toLowerCase();
	return redirect(`/register/${type}`);
}

export async function loader() {
	return json({ userTypes: Object.keys(USER_TYPE) });
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
			<Form method="POST" id={form.id} onSubmit={form.onSubmit}>
				<div>{form.errors}</div>
				{data.userTypes.map((type) => (
					<div key={type}>
						<input id={type} type="radio" name="type" value={type} />
						<label htmlFor="type">{type}</label>
					</div>
				))}
				<button type="submit">Continue</button>
			</Form>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
}
