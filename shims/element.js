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

if (! (Element.prototype.closest instanceof Function)) {
	Element.prototype.closest = function closest(selector) {
		if (this.matches(selector)) {
			return this;
		} else {
			let found = null;
			let target = this.parentElement;

			while(target instanceof Element) {
				if (target.matches(selector)) {
					found = target;
					break;
				} else {
					target = target.parentElement;
				}
			}

			return found;
		}
	};
}

if (! (Element.prototype.toggleAttribute instanceof Function)) {
	Element.prototype.toggleAttribute = function(name, force) {
		if (typeof force === 'undefined') {
			return this.toggleAttribute(name, ! this.hasAttribute(name));
		} else if (force) {
			this.setAttribute(name, '');
			return true;
		} else {
			this.removeAttribute(name);
			return false;
		}
	};
}

if (! (Element.prototype.remove instanceof Function)) {
	Element.prototype.remove = function remove() {
		if (this.parentNode instanceof Node) {
			this.parentNode.removeChild(this);
		}
	};
}

if (! (Element.prototype.after instanceof Function)) {
	Element.prototype.after = function after(...items) {
		items.forEach(item => {
			if (item instanceof Node) {
				this.insertAdjacentElement('afterend', item);
			} else {
				this.insertAdjacentText('afterend', item);
			}
		});
	};
}

if (! (Element.prototype.before instanceof Function)) {
	Element.prototype.before = function before(...items) {
		items.forEach(item => {
			if (item instanceof Node) {
				this.insertAdjacentElement('beforebegin', item);
			} else {
				this.insertAdjacentText('beforebegin', item);
			}
		});
	};
}

if (! (Element.prototype.append instanceof Function)) {
	Element.prototype.append = function append(...items) {
		items.forEach(item => {
			if (item instanceof Node) {
				this.appendChild(item);
			} else {
				this.appendChild(document.createTextNode(item));
			}
		});
	};
}

if (! (Element.prototype.prepend instanceof Function)) {
	Element.prototype.prepend = function prepend(...items) {
		items.forEach(item => {
			if (item instanceof Node) {
				this.insertAdjacentElement('afterbegin', item);
			} else {
				this.insertAdjacentText('afterbegin', item);
			}
		});
	};
}

if (! (Element.prototype.replaceWith instanceof Function)) {
	Element.prototype.replaceWith = function replaceWith(...items) {
		this.before(...items);
		this.remove();
	};
}

if (! (Element.prototype.replaceChildren instanceof Function)) {
	Element.prototype.replaceChildren = function(...items) {
		[...this.children].forEach(el => el.remove());
		this.append(...items);
	};

	Document.prototype.replaceChildren = function(...items) {
		Element.prototype.replaceChildren.apply(this, items);
	};

	DocumentFragment.prototype.replaceChildren = function(...items) {
		Element.prototype.replaceChildren.apply(this, items);
	};

	if ('ShadowRoot' in globalThis) {
		ShadowRoot.prototype.replaceChildren = function(...items) {
			Element.prototype.replaceChildren.apply(this, items);
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

if (! (Element.prototype.setHTML instanceof Function)) {
	Element.prototype.setHTML = function setHTML(input, sanitizer) {
		if (
			('Sanitizer' in globalThis && sanitizer instanceof globalThis.Sanitizer)
			|| (typeof sanitizer !== 'undefined' && sanitizer.sanitizeFor instanceof Function)
		) {
			const el = sanitizer.sanitizeFor(this.tagName.toLowerCase(), input);
			this.replaceChildren(...el.children);
		} else {
			throw new TypeError('`sanitizer` is not a valid Sanitizer');
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

/**
 * @deprecated [to be removed in 3.0.0]
 * `<menu type="context">` is no longer supported in any browser
 */
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
