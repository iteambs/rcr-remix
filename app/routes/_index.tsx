import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
	return [
		{ title: 'RCR Facilities Management' },
		{ name: 'description', content: 'Welcome to RCR!' },
	];
};

export default function Index() {
	return <main></main>;
}
