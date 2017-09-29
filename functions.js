import zQ from './zq.js';

export function $(selector, parent = document) {
	return new zQ(selector, parent);
}

export function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

export function query(selector, node = document.documentElement) {
	let results = Array.from(node.querySelectorAll(selector));
	if (node.matches(selector)) {
		results.unshift(node);
	}
	return results;
}

export function isOnline() {
	return (!('onLine' in navigator)) || navigator.onLine;
}
export function notify(options) {
	/*Creates a notification, with alert fallback*/
	let notification;
	if (typeof options === 'string') {
		options = {
			title: options,
			body: '',
			icon: '/images/octicons/lib/svg/megaphone.svg'
		};
	}
	if (typeof options.icon !== 'string') {
		options.icon = '/images/octicons/lib/svg/megaphone.svg';
	}
	if ('Notification' in window) {
		if (Notification.permission === 'default') {
			Notification.requestPermission().then(resp => {
				if (resp === 'granted') {
					try {
						notification = new Notification(options.title, options);
					} catch (e) {
						if (('fallback' in options) && options.fallback) {
							alert(`${options.title}\n${options.body}`);
						}
					}
				} else if (('fallback' in options) && options.fallback) {
					alert(`${options.title}\n${options.body}`);
				}
			});
		} else if (Notification.permission === 'granted') {
			notification = new Notification(options.title, options);
		} else if (('fallback' in options) && options.fallback) {
			alert(`${options.title}\n${options.body}`);
		}
	}
	if (notification) {
		if ('onclick' in options) {
			notification.onclick = options.onclick;
		}
		if ('onshow' in options) {
			notification.onshow = options.onshow;
		}
		if ('onclose' in options) {
			notification.onclose = options.onclose;
		}
		if ('onerror' in options) {
			notification.onerror = options.onerror;
		} else {
			notification.onerror = console.error;
		}
		return notification;
	}
}
export function reportError(err) {
	console.error(err);
	notify({
		title: err.name,
		body: err.message,
		icon: 'images/octicons/svg/bug.svg'
	});
}
export function isInternalLink(link) {
	return link.origin === location.origin;
}
export function parseResponse(resp) {
	if (! resp.headers.has('Content-Type')) {
		throw new Error(`No Content-Type header in request to "${resp.url}"`);
	} else if (resp.headers.get('Content-Length') === 0) {
		throw new Error(`No response body for "${resp.url}"`);
	}
	const type = resp.headers.get('Content-Type');
	if (type.startsWith('application/json')) {
		return resp.json();
	} else if (type.startsWith('application/xml')) {
		return new DOMParser().parseFromString(resp.text(), 'application/xml');
	} else if (type.startsWith('image/svg+xml')) {
		return new DOMParser().parseFromString(resp.text(), 'image/svg+xml');
	} else if (type.startsWith('text/html')) {
		return new DOMParser().parseFromString(resp.text(), 'text/html');
	} else if (type.startsWith('text/plain')) {
		return resp.text();
	} else {
		throw new TypeError(`Unsupported Content-Type: ${type}`);
	}
}

export async function getLocation(options = {}) {
	/*https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition*/
	return new Promise(function(success, fail) {
		if (!('geolocation' in navigator)) {
			fail('Your browser does not support GeoLocation');
		}
		navigator.geolocation.getCurrentPosition(success, fail, options);
	});
}
