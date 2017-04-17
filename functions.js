import zQ from './zq.js';

export function $(selector) {
	return new zQ(selector);
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
// export function ajax(data) {
// 	if ((typeof data.type !== 'undefined' && data.type.toLowerCase() === 'get') && (typeof data.request === 'string')) {
// 		data.url += '?' + data.request;
// 	}
// 	if (typeof data.form !== 'undefined') {
// 		if (typeof data.form === 'string') {
// 			data.form = document.forms[data.form];
// 		}
// 		data.request = new FormData(data.form);
// 		data.request.append('form', data.form.name);
// 		data.request.append('nonce', sessionStorage.getItem('nonce'));
// 		$('[data-input-name]').forEach(input => {
// 			data.request.append(input.dataset.inputName, input.innerHTML);
// 		});
// 	}
// 	if (typeof data.headers !== 'object') {
// 		data.headers = {Accept: 'application/json'};
// 	} else if (!('Accept' in data.headers)) {
// 		data.headers.Accept = 'application/json';
// 	}
// 	return new Promise(function (success, fail) 	{
// 		var resp;
// 		/*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise*/
// 		if (typeof navigator.onLine !== 'boolean' || navigator.onLine) {
// 			var req = new XMLHttpRequest(),
// 				progress = document.createElement('progress');
// 			if (('withCredentials' in req) && ('withCredentials' in data)) {
// 				req.withCredentials = data.withCredentials;
//
// 			}
// 			if (typeof data.contentType !== 'string') {
// 				data.contentType = 'application/x-www-form-urlencoded';
// 			}
// 			document.body.appendChild(progress);
// 			req.open(
// 				data.type || 'POST',
// 				data.url || document.baseURI,
// 				data.async || true
// 			);
// 			if (typeof data.request === 'string') {
// 				req.setRequestHeader('Content-type', data.contentType);
// 			}
// 			req.setRequestHeader('Accept', data.headers.Accept);
// 			req.setRequestHeader('Request-Type', 'AJAX');
// 			req.addEventListener('progress', event => {
// 				if (event.lengthComputable) {
// 					progress.value = event.loaded / event.total;
// 				}
// 			});
// 			req.addEventListener('load', () => {
// 				switch (req.getResponseHeader('Content-Type')) {
// 				case 'application/json':
// 					resp = JSON.parse(req.response);
// 					break;
//
// 				case 'application/xml':
// 				case 'text/xml':
// 					resp = new DOMParser().parseFromString(req.response, 'application/xml');
// 					break;
//
// 				case 'text/html':
// 					resp = new DOMParser().parseFromString(req.response, 'text/html');
// 					break;
//
// 				case 'image/svg':
// 					resp = new DOMParser().parseFromString(req.response, 'image/svg+xml');
// 					break;
//
// 				case 'text/plain':
// 					resp = req.response;
// 					break;
// 				}
// 				progress.parentElement.removeChild(progress);
// 				if (req.status == 200) {
// 					if (typeof data.history === 'string') {
// 						history.pushState({}, document.title, data.history);
// 					}
// 					success(resp);
// 				} else {
// 					fail(Error(req.statusText));
// 				}
// 			});
// 			req.addEventListener('error', function () {
// 				progress.remove();
// 				fail(Error('Network Error'));
// 			});
// 			if (typeof data.request !== 'undefined') {
// 				req.send(data.request);
// 			} else {
// 				req.send();
// 			}
// 		} else {
// 			notify({
// 				title: 'Network:',
// 				body: 'offline',
// 				icon: 'images/icons/network-server.png'
// 			});
// 			fail('No Internet Connection');
// 		}
// 	});
// }

export function getLocation(options) {
	/*https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition*/
	if (typeof options === 'undefined') {
		options = {};
	}
	return new Promise(function(success, fail) {
		if (!('geolocation' in navigator)) {
			fail('Your browser does not support GeoLocation');
		}
		navigator.geolocation.getCurrentPosition(success, fail, options);
	});
}
