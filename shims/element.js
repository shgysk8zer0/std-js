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
		const url = new URL(link.href);
		const resp = await fetch(url);

		if (resp.ok) {
			const parser = new DOMParser();
			const content = await resp.text();

			if ('trustedTypes' in globalThis && globalThis.trustedTypes.defaultPolicy != null && globalThis.trustedTypes.createHTML instanceof Function) {
				link.import = parser.parseFromString(globalThis.trustedTypes.createHTML(content), 'text/html');
			} else {
				link.import = parser.parseFromString(content, 'text/html');
			}

			link.dispatchEvent(new Event('load'));
		} else {
			link.dispatchEvent(new Event('error'));
		}
	});
}
