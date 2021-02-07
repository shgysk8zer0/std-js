export const SUPPORTED_TYPES = ['image/jpeg', 'image/png'];

export async function upload(what, { clientId }) {
	if (typeof clientId !== 'string' || clientId.length === 0) {
		throw new Error('Missing clientId');
	} else if (what instanceof File) {
		if (! SUPPORTED_TYPES.includes(what.type)) {
			throw new TypeError(`Unsupported file type: ${what.type}`);
		}
		const resp = await fetch('https://api.imgur.com/3/image', {
			method: 'POST',
			body: what,
			headers: new Headers({
				Authorization: `Client-ID ${clientId}`,
				Accept: 'application/json',
			})
		});

		if (resp.ok) {
			return await resp.json();
		} else {
			throw new Error(`${resp.ul} [${resp.status} ${resp.statusText}]`);
		}
	} else if (what instanceof FileList && what.length !== 0) {
		return await Promise.all(Array.from(what).map(f => upload(f, { clientId })));
	} else if (Array.isArray(what)) {
		return await Promise.all(what.map(item => upload(item, { clientId })));
	} else if (what instanceof HTMLInputElement && what.type === 'file') {
		if (what.multiple) {
			return await upload(what.files, { clientId });
		} else {
			return await upload(what.files.item(0), { clientId });
		}
	}
}
