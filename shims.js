if (! (navigator.setAppBadge instanceof Function)) {
	navigator.setAppBadge = () => Promise.reject('Not Supported');
}

if (! (navigator.clearAppBadge instanceof Function)) {
	navigator.clearAppBadge = () => navigator.setAppBadge(0);
}

if (! (navigator.getInstalledRelatedApps instanceof Function)) {
	navigator.getInstalledRelatedApps = async () => [];
}

if (! (Element.prototype.replaceChildren instanceof Function)) {
	Element.prototype.replaceChildren = function(...items) {
		[...this.children].forEach(el => el.remove());
		this.append(...items);
	};

	Document.prototype.replaceChildren = function(...items) {
		[...this.children].forEach(el => el.remove());
		this.append(...items);
	};

	DocumentFragment.prototype.replaceChildren = function(...items) {
		[...this.children].forEach(el => el.remove());
		this.append(...items);
	};

	if ('ShadowRoot' in window) {
		ShadowRoot.prototype.replaceChildren = function(...items) {
			[...this.children].forEach(el => el.remove());
			this.append(...items);
		};
	}
}

if (! (Array.from instanceof Function)) {
	Array.from = function(args, mapFn, thisArg) {
		if (mapFn instanceof Function) {
			return typeof thisArg === 'undefined'
				? Array.prototype.slice.call(args).map(mapFn)
				: Array.prototype.slice.call(args).map(mapFn.bind(thisArg));
		} else {
			return Array.prototype.slice.call(args);
		}
	};
}

if (! (Array.of instanceof Function)) {
	Array.of = function() {
		return Array.fromx(arguments);
	};
}

if (! (Object.entries instanceof Function)) {
	Object.entries = function(obj) {
		return Object.keys(obj).map(key => [key, obj[key]]);
	};
}

if (! (Object.fromEntries instanceof Function)) {
	Object.fromEntries = function(arr) {
		if (Array.isArray(arr)) {
			return arr.reduce((obj, [key, val]) => {
				obj[key] = val;
				return obj;
			}, {});
		} else {
			return Object.fromEntries(Array.from(arr));
		}
	};
}

if (! HTMLImageElement.prototype.hasOwnProperty('complete')) {
	/**
	 * Note: This shim cannot detect if an image has an error while loading
	 * and will return false on an invalid URL, for example. It also does not
	 * work for 0-sized images, if such a thing is possible.
	 */
	Object.defineProperty(HTMLImageElement.prototype, 'complete', {
		get: function() {
			return this.src === '' || this.naturalHeight > 0;
		}
	});
}

if(! (HTMLImageElement.prototype.decode instanceof Function)) {
	HTMLImageElement.prototype.decode = function () {
		if (this.complete) {
			return Promise.resolve();
		} else {
			return new Promise((resolve, reject) => {
				const load = () => {
					this.removeEventListener('error', error);
					this.removeEventListener('load', load);
					resolve();
				};

				const error = (err) => {
					this.removeEventListener('error', error);
					this.removeEventListener('load', load);
					reject(err);
				};

				this.addEventListener('load', load);
				this.addEventListener('error', error);
			});
		}
	};
}

if (! window.hasOwnProperty('CustomEvent')) {
	window.CustomEvent = class CustomEvent {
		constructor(event, {
			bubbles = false,
			cancelable = false,
			detail = null
		} = {}) {
			const evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(event, bubbles, cancelable, detail);
			return evt;
		}
	};
}

if (window.hasOwnProperty('Animation') && ! Animation.prototype.hasOwnProperty('finished')) {
	Object.defineProperty(Animation.prototype, 'finished', {
		get: function() {
			return new Promise((resolve, reject) => {
				if (this.playState === 'finished') {
					resolve(this);
				} else {
					this.addEventListener('finish', () => resolve(this), { once: true });
					this.addEventListener('error', event => reject(event), { once: true });
				}
			});
		}
	});
}

if (window.hasOwnProperty('Animation') && ! Animation.prototype.hasOwnProperty('ready')) {
	Object.defineProperty(Animation.prototype, 'ready', {
		get: function() {
			return new Promise((resolve, reject) => {
				if (! this.pending) {
					resolve(this);
				} else {
					this.addEventListener('ready', () => resolve(this), { once: true });
					this.addEventListener('error', event => reject(event), { once: true });
				}
			});
		}
	});
}

if (! Element.prototype.hasOwnProperty('toggleAttribute')) {
	Element.prototype.toggleAttribute = function(name, force) {
		const forcePassed = arguments.length === 2;
		const forceOn = !!force;
		const forceOff = forcePassed && !force;

		if (this.hasAttribute(name)) {
			if (forceOn) {
				return true;
			} else {
				this.removeAttribute(name);
				return false;
			}
		} else {
			if (forceOff) {
				return false;
			} else {
				this.setAttribute(name, '');
				return true;
			}
		}
	};
}

if (document.createElement('dialog') instanceof HTMLUnknownElement && !HTMLElement.prototype.hasOwnProperty('open')) {
	window.addEventListener('keypress', event => {
		if (event.key === 'Escape') {
			document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
		}
	}, {passive: true});

	/**
	 * @TODO Only set this for `HTMLUnknownElement`
	 */
	HTMLElement.prototype.show = function() {
		this.open = true;
	};

	/**
	 * @TODO Only set this for `HTMLUnknownElement`
	 */
	HTMLElement.prototype.close = function(returnValue = null) {
		this.open = false;
		if (this.tagName === 'DIALOG') {
			const event = new CustomEvent('close');
			if (typeof returnValue === 'string') {
				event.returnValue = true;
				this.returnValue = returnValue;
			}
			this.dispatchEvent(event);
			delete this.returnValue;
		}
	};

	/**
	 * @TODO Only set this for `HTMLUnknownElement`
	 */
	Object.defineProperty(HTMLElement.prototype, 'open', {
		set: function(open) {
			if (this.tagName === 'DETAILS') {
				this.dispatchEvent(new CustomEvent('toggle'));
				this.toggleAttribute('open', open);
			} else if (this.tagName === 'DIALOG') {
				this.toggleAttribute('open', open);
				if (! open) {
					this.classList.remove('modal');
					const next = this.nextElementSibling;
					if (next instanceof HTMLElement && next.matches('.backdrop')) {
						next.remove();
					}
				}
			}
		},
		get: function() {
			return this.hasAttribute('open');
		}
	});
}

if (! document.createElement('dialog').hasOwnProperty('showModal')) {
	/**
	 * @TODO Only set this for `HTMLUnknownElement`
	 */
	HTMLElement.prototype.showModal = function() {
		this.open = true;
		this.classList.add('modal');
		const backdrop = document.createElement('div');
		backdrop.classList.add('backdrop');
		this.after(backdrop);
	};
}

if (! ('content' in document.createElement('template'))) {
	Object.defineProperty(HTMLUnknownElement.prototype, 'content', {
		get: function() {
			const frag = document.createDocumentFragment();
			for (let i = 0; i < this.childNodes.length; i++) {
				frag.appendChild(this.childNodes[i].cloneNode(true));
			}
			return frag;
		}
	});
}

if (! HTMLElement.prototype.hasOwnProperty('contextMenu')){
	Object.defineProperty(HTMLElement.prototype, 'contextMenu', {
		get: function() {
			if (this.hasAttribute('contextmenu')) {
				return document.getElementById(this.getAttribute('contextmenu'));
			} else {
				return null;
			}
		}
	});
}

/**
 * @deprecated [to be removed in 3.0.0]
 */
if (! HTMLLinkElement.prototype.hasOwnProperty('import')) {
	[...document.querySelectorAll('link[rel~="import"]')].forEach(async link => {
		link.import = null;
		const url = new URL(link.href);
		const resp = await fetch(url);

		if (resp.ok) {
			const parser = new DOMParser();
			const content = await resp.text();
			link.import = parser.parseFromString(content, 'text/html');
			link.dispatchEvent(new Event('load'));
		} else {
			link.dispatchEvent(new Event('error'));
		}
	});
}

if (! ('connection' in navigator)) {
	navigator.connection = Object.freeze({
		type: 'unknown',
		effectiveType: '4g',
		rtt: NaN,
		downlink: NaN,
		downlinkMax: Infinity,
		saveData: false,
		onchange: null,
		ontypechange: null,
		addEventListener: () => null,
	});
} else if (! ('type' in navigator.connection)) {
	navigator.connection.type = 'unknown';
}

if ('Promise' in window && ! (Promise.allSettled instanceof Function)) {
	Promise.allSettled = function(promises) {
		return Promise.all(Array.from(promises).map(function(call) {
			return new Promise(function(resolve) {
				if (! (call instanceof Promise)) {
					call = Promise.resolve(call);
				}
				call.then(function(value) {
					resolve({ status: 'fulfilled', value: value });
				}).catch(function(reason) {
					resolve({ status: 'rejected', reason: reason });
				});
			});
		}));
	};
}
