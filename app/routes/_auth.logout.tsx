import { ActionFunctionArgs } from '@remix-run/node';
import { logout } from '~/utils/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
	return await logout(request);
};
