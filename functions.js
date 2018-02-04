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

export async function ready() {
	if (document.readyState === 'loading') {
		await waitUntil(document, 'DOMContentLoaded');
	}
}

export async function loaded() {
	if (document.readyState !== 'complete') {
		await waitUntil(window, 'load');
	}
}

export async function waitUntil(target, event) {
	const prom = new Promise(resolve => {
		target.addEventListener(event, () => resolve(), {once: true});
	});
	await prom;
}

export function* toGenerator(...items) {
	/*eslint no-constant-condition: "off" */
	while (true) {
		for (const item of items) {
			yield item;
		}
	}
}
export async function imgur(url, {
	sizes       = ['100vw'],
	alt         = '',
	defaultSize = 'h',
} = {}) {
	const imgurSizes = {
		h: 1024,
		l: 640,
		m: 320,
		t: 160,
	};

	const formats = {
		'image/webp': '.webp',
		'image/png': '.png',
	};

	const picture = document.createElement('picture');
	const imgur = new URL(url, 'https://i.imgur.com/');
	const image = new Image();


	imgur.host = 'i.imgur.com';
	imgur.protocol = 'https:';
	imgur.pathname = imgur.pathname.replace(/\.[A-z]+$/, '');
	Object.entries(formats).forEach(format => {
		const [type, ext] = format;
		const source = document.createElement('source');
		source.type = type;
		source.sizes = sizes.join(', ');
		const srcset = Object.entries(imgurSizes).map(size => {
			const [suffix, width] = size;
			return `${imgur}${suffix}${ext} ${width}w`;
		});
		source.srcset = srcset.join(', ');
		picture.append(source);
	});

	return new Promise((resolve, reject) => {
		picture.append(image);
		image.alt = alt;
		image.addEventListener('load', (event) => resolve(event.target.parentElement), {once: true});
		image.addEventListener('error', event => reject(event.target));
		image.src = `${imgur}${defaultSize}.png`;
	});
}

export async function read(...nodes) {
	if (! window.hasOwnProperty('speechSynthesis')) {
		throw new Error('SpeechSynthesis not supported');
	}

	for (const node of nodes) {
		if (typeof(node) === 'string') {
			/*
			 * Work-around for Chrome issue with long utterances
			 * <https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak#Browser_compatibility>
			*/
			for (const chunk of chunkText(node, 200)) {
				await new Promise((resolve, reject) => {
					const utter = new SpeechSynthesisUtterance(chunk);
					utter.addEventListener('end', resolve);
					utter.addEventListener('error', reject);
					speechSynthesis.speak(utter);
				});
			}
		} else if (node  instanceof Text) {
			node.parentElement.classList.add('reading');
			await read(node.wholeText);
			node.parentElement.classList.remove('reading');
		} else if (node instanceof Element && ! node.hidden && node.hasChildNodes()) {
			await read(...node.childNodes);
		}
	}
}

export function chunkText(string, length) {
	const size = Math.ceil(string.length / length);
	const chunks = Array(size);

	for (let i = 0, offset = 0; i < size; i++, offset++) {
		chunks[i] = string.substr(offset, length);
	}
	return chunks;
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

export async function getLocation(options = {}) {
	/*https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition*/
	return new Promise((resolve, reject) => {
		if (!('geolocation' in navigator)) {
			reject('Your browser does not support GeoLocation');
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, options);
	});
}

export async function registerServiceWorker(path) {
	return new Promise(async (resolve, reject) => {
		try {
			if (! Navigator.prototype.hasOwnProperty('serviceWorker')) {
				throw new Error('Service worker not supported');
			} else if (! navigator.onLine) {
				throw new Error('Offline');
			}

			const url = new URL(path, document.baseURI);
			const reg = await navigator.serviceWorker.register(url, {scope: document.baseURI});

			if (navigator.onLine) {
				reg.update();
			}

			reg.addEventListener('updatefound', event => resolve(event.target));
			reg.addEventListener('install', event => resolve(event.target));
			reg.addEventListener('activate', event => resolve(event.target));
			reg.addEventListener('error', event => reject(event.target));
			reg.addEventListener('fetch', console.info);
		} catch (error) {
			reject(error);
		}
	});
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
