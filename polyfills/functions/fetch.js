export default (url, init = {}) => {
	if (!(url instanceof URL)) {
		url = new URL(url, location.origin);
	}
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		if (! ('method' in init)) {
			init.method = 'GET';
		}
		xhr.open(init.method , url, true);
		if ('credentials' in init) {
			if (init.credentials === 'include' || (init.credentials === 'same-origin' && url.origin === location.origin)) {
				xhr.withCredentials = true;
			}
		}
		xhr.addEventListener('load', event => {
			resolve(new Response(event.target.response, {
				status: event.target.status,
				statusText: event.target.statusText,
				headers: event.target
			}));
		});
		xhr.addEventListener('error', event => {
			reject(event);
		});
		if ('headers' in init) {
			for (let header in init.headers) {
				xhr.setRequestHeader(header, init.headers[header]);
			}
		}
		xhr.send(('body' in init) ? init.body : null);
	});
};
