/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { sha256 } from './hash.js';
import { POST } from './http.js';

const errorObj = Object.seal({
	error: Object.seal({
		status: 500,
		message: 'Error submitting message',
	})
});

const successObj = Object.seal({
	message: null,
	status: 204,
});

export async function signatureHeaders({ uuid, origin = location.origin }) {
	const date = new Date().toISOString();

	return new Headers({
		'x-message-id': uuid,
		'x-message-time': date,
		'x-message-origin': origin,
		'x-message-sig': await sha256(JSON.stringify({ uuid, date, origin })),
		'x-message-algo': 'sha256',
		'Content-Type': 'application/json',
	});
}

export async function send(endpoint, { name, email, phone, subject, body, url }, { signal } = {}) {
	try {
		const uuid = crypto.randomUUID();
		const origin = location.origin;
		const headers = await signatureHeaders({ uuid, origin });
		const data = JSON.stringify({ name, email, phone, subject, url, origin, body });

		const resp = await POST(endpoint, { mode: 'cors', body: data, headers, signal });

		return Object.seal({
			status: resp.status,
			success: resp.ok,
			body: resp.ok ? successObj : errorObj,
		});
	} catch(err) {
		console.error(err);
		return Object.seal({
			status: 502,
			success: false,
			body: errorObj,
		});
	}
}
