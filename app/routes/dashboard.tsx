import { redirect, type LoaderFunctionArgs, json } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { getUser } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await getUser(request);
	if (!user) return redirect('/login');
	if (user) {
		// let modules = await getUserAccess(user.user_type_id);
		// let hasAccess = determineAccess(user, request, modules);
		// if (hasAccess.error) {
		// 	return redirect('/unauthorized');
		// }
		// return redirect("/admin/maintenance/void");
		// return redirect('/admin/reports/filterable-reports');
		// return redirect("/admin/reports/filterable-reports-vgc");
		return json({ success: true });
	}
}

export default function Dashboard() {
	return (
		<main>
			<div>dashboard</div>

			<Form method="post" action="/logout">
				<button
					type="submit"
					className=" text-gray-700 text-sm dark:text-[#a0a0a0] dark:hover:text-gray-300"
				>
					Logout
				</button>
			</Form>
		</main>
	);
}
