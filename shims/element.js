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

if (
	! (Element.prototype.setHTML instanceof Function)
	&& 'Sanitizer' in globalThis
	&& globalThis.Sanitizer.sanitizeFor instanceof Function
) {
	Element.prototype.setHTML = function setHTML(input, { sanitizer = new globalThis.Sanitizer() } = {}) {
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

if (! HTMLTemplateElement.prototype.hasOwnProperty('shadowRootMode')) {
	function attachShadows(base = document) {
		base.querySelectorAll('template[shadowrootmode]').forEach(tmp => {
			const mode = tmp.getAttribute('shadowrootmode');
			const shadow = tmp.parentElement.attachShadow({ mode });
			shadow.append(tmp.content);
			tmp.remove();
			attachShadows(shadow);
		});
	}
	
	attachShadows(document);
}
