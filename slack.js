import { sha256 } from './hash.js';
import { uuidv6 } from './uuid.js';

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

export async function send(endpoint, { name, email, phone, subject, body }) {
	try {
		const uuid = uuidv6();
		const data = new FormData();

		data.set('name', name);
		data.set('email', email);
		data.set('phone', phone);
		data.set('subject', subject);
		data.set('body', body);
		data.set('origin', location.origin);
		const resp = await fetch(endpoint, {
			method: 'POST',
			mode: 'cors',
			body: data,
			headers: await signatureHeaders({ uuid }),
		});

		return {
			status: resp.status,
			success: resp.ok,
			body: resp.ok ? null : await resp.json().catch(console.error),
		};
	} catch(err) {
		console.error(err);
		return {
			status: 502,
			success: false,
			body: {
				error: {
					status: 502,
					message: 'Error submitting message',
				}
			},
		};
	}
}
