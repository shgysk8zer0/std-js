import esQuery from './esQuery.js';

export function clone(thing) {
	if (thing instanceof Array) {
		return [...thing].map(clone);
	} else if (['string', 'number'].includes(typeof(thing))) {
		return thing;
	} else if (thing instanceof Element) {
		return thing.cloneNode(true);
	} else if (thing instanceof Function) {
		return thing;
	} else {
		return Object.assign({}, thing);
	}
}

export function $(selector, parent = document) {
	return new esQuery(selector, parent);
}

export async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

export function* toGenerator(...items) {
	/*eslint no-constant-condition: "off" */
	while (true) {
		for (const item of items) {
			yield item;
		}
	}
}

export function query(selector, node = document) {
	let results = Array.from(node.querySelectorAll(selector));
	if (node.matches(selector)) {
		results.unshift(node);
	}
	return results;
}

export function isOnline() {
	return navigator.onLine === true;
}
export async function notify(title, options = {}) {
	if (! window.hasOwnProperty('Notification') || Notification.permission === 'denied') {
		alert(`${title}\n${options.body || ''}`);
		return {};
	} else if (Notification.permission === 'default') {
		const permission = await Notification.requestPermission();
		if (permission === 'granted') {
			return notify(title, options);
		} else {
			alert(`${title}\n${options.body || ''}`);
			return {};
		}
	} else {
		try {
			return new Notification(title, options);
		} catch (err) {
			console.error(err);
			alert(`${title}\n${options.body || ''}`);
			return {};
		}
	}
}

export function isInternalLink(link) {
	return link.origin === location.origin;
}

export async function parseResponse(resp) {
	if (! resp.headers.has('Content-Type')) {
		throw new Error(`No Content-Type header in request to "${resp.url}"`);
	} else if (resp.headers.get('Content-Length') === 0) {
		throw new Error(`No response body for "${resp.url}"`);
	}
	const type = resp.headers.get('Content-Type');
	if (type.startsWith('application/json')) {
		return resp.json();
	} else if (type.startsWith('application/xml')) {
		return new DOMParser().parseFromString(await resp.text(), 'application/xml');
	} else if (type.startsWith('image/svg+xml')) {
		return new DOMParser().parseFromString(await resp.text(), 'image/svg+xml');
	} else if (type.startsWith('text/html')) {
		return new DOMParser().parseFromString(await resp.text(), 'text/html');
	} else if (type.startsWith('text/plain')) {
		return resp.text();
	} else {
		throw new TypeError(`Unsupported Content-Type: ${type}`);
	}
}

export async function marquee({
	parent,
	delay        = 200,
	cursor       = '|',
	blinkRate    = 800,
	pause        = 1000,
	containerTag = 'span',
	cursorTag    = 'span',
} = {}, ...sentences) {
	const cursorEl = document.createElement(cursorTag);
	const container = document.createElement(containerTag);

	cursorEl.animate([
		{opacity: 0},
		{opacity: 1}
	], {
		duration: blinkRate,
		iterations: Infinity,
		direction: 'alternate',
	});

	cursorEl.textContent = cursor;
	parent.prepend(container, cursorEl);

	for (const text of toGenerator(...sentences)) {
		container.textContent = '';

		for (const char of text.split('')) {
			container.append(char);
			await wait(delay);
		}

		await wait(pause);

		while (container.textContent !== '') {
			const chars = container.textContent.split('');
			chars.pop();
			container.textContent = chars.join('');
			await wait(delay);
		}
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
