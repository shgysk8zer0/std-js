import Notification from './Notification.js';

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

if (! window.hasOwnProperty('Notification')) {
	window.Notification = Notification;
}

if (window.hasOwnProperty('Animation') && ! Animation.prototype.hasOwnProperty('finished')) {
	Object.defineProperty(Animation.prototype, 'finished', {
		get: function() {
			return new Promise((resolve, reject) => {
				if (this.playState === 'finished') {
					resolve(this);
				} else {
					this.addEventListener('finish', () => resolve(this));
					this.addEventListener('error', event => reject(event));
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
					this.addEventListener('ready', () => resolve(this));
					this.addEventListener('error', event => reject(event));
				}
			});
		}
	});
}

if (! Object.hasOwnProperty('fromEntries')) {
	Object.fromEntries = function(iterable) {
		return [...iterable].reduce((obj, [key, value]) => {
			obj[key] = value;
			return obj;
		}, {});
	};
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
	HTMLElement.prototype.show = function() {
		this.open = true;
	};

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
			}
		}
	});
}

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
