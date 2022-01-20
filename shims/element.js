import { errorToEvent } from '../dom.js';
import './dialog.js';

if (! (HTMLScriptElement.supports instanceof Function)) {
	HTMLScriptElement.supports = function supports(type) {
		switch(type.toLowerCase()) {
			case 'classic':
				return true;

			case 'module':
				return 'noModule' in HTMLScriptElement.prototype;

			case 'importmap':
				return false;

			case 'speculationrules':
				return false;

			default:
				return false;
		}
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

	if ('ShadowRoot' in globalThis) {
		ShadowRoot.prototype.replaceChildren = function(...items) {
			[...this.children].forEach(el => el.remove());
			this.append(...items);
		};
	}
}

if (! (Element.prototype.getAttributeNames instanceof Function)) {
	Element.prototype.getAttributeNames = function() {
		return Array.from(this.attributes).map(({ name }) => name);
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

if (! (HTMLImageElement.prototype.decode instanceof Function)) {
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

		try {
			const url = new URL(link.href);
			const resp = await fetch(url);

			if (resp.ok) {
				const tmp = document.createElement('template');
				tmp.innerHTML = await resp.text();
				link.import = tmp.content;
				link.dispatchEvent(new Event('load'));
			} else {
				link.dispatchEvent(errorToEvent(new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`)));
			}
		} catch(err) {
			link.dispatchEvent(errorToEvent(err));
		}
	});
}
