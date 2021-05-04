import { sha256 } from './hash.js';
import { uuidv6 } from './uuid.js';
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

export async function signatureHeaders({ uuid }) {
	const date = new Date().toISOString();

	return new Headers({
		'x-message-id': uuid,
		'x-message-time': date,
		'x-message-origin': location.origin,
		'x-message-sig': await sha256(JSON.stringify({ uuid, date, origin: location.origin })),
		'x-message-algo': 'sha256',
	});
}

export async function send(endpoint, { name, email, phone, subject, body, url }, { signal } = {}) {
	try {
		const uuid = uuidv6();
		const data = new FormData();

		data.set('name', name);
		data.set('email', email);
		data.set('phone', phone);
		data.set('subject', subject);
		data.set('body', body);
		data.set('url', url);
		data.set('origin', location.origin);

		const resp = await POST(endpoint, {
			mode: 'cors',
			body: data,
			headers: await signatureHeaders({ uuid }),
			signal,
		});

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
