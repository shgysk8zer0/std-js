import { createHTML } from './SanitizerBase.js';

export const supported = () => 'Sanitizer' in globalThis;
export const nativeSupport = supported();

export function getSantizerUtils(Sanitizer, defaultConfig) {
	const setHTML = function setHTML(el, input, { sanitizer = new Sanitizer() } = {}) {
		const tmp = document.createElement('template');
		tmp.innerHTML = createHTML(input);
		sanitizer.sanitize(tmp.content);
		el.replaceChildren(tmp.content);
	};

	const polyfill = function polyfill() {
		let polyfilled = false;
		if (! supported()) {
			globalThis.Sanitizer = Sanitizer;
			polyfilled = true;
		} else {
			if (! (globalThis.Sanitizer.prototype.sanitizeFor instanceof Function)) {
				globalThis.Sanitizer.prototype.sanitizeFor = function(element, input) {
					const el = document.createElement(element);
					const tmp = document.createElement('template');
					tmp.innerHTML = createHTML(input);
					el.append(this.sanitize(tmp.content));
					return el;
				};
			}

			if (! (globalThis.Sanitizer.getDefaultConfiguration instanceof Function)) {
				globalThis.Sanitizer.getDefaultConfiguration = () => defaultConfig;
				polyfilled = true;
			}
		}

		if (! (Element.prototype.setHTML instanceof Function)) {
			Element.prototype.setHTML = function(input, { sanitizer } = {}) {
				setHTML(this, input, { sanitizer });
			};
		}

		return polyfilled;
	};

	return { setHTML, polyfill };
}
