export const supported = () => 'Sanitizer' in globalThis;
export const nativeSupport = supported();

export function getSantizerUtils(Sanitizer, defaultConfig) {
	const setHTML = function setHTML(el, input, sanitizer = new Sanitizer()) {
		const frag = sanitizer.sanitizeFor(el.tagName.toLowerCase(), input);
		el.replaceChildren(...frag.childNodes);
	};

	const polyfill = function polyfill() {
		let polyfilled = false;
		if (! ('Sanitizer' in globalThis)) {
			globalThis.Sanitizer = Sanitizer;
			polyfilled = true;
		} else if (! (globalThis.Sanitizer.getDefaultConfiguration instanceof Function)) {
			globalThis.Sanitizer.getDefaultConfiguration = () => defaultConfig;
			polyfilled = true;
		}

		if (! (Element.prototype.setHTML instanceof Function)) {
			Element.prototype.setHTML = function setHTML(content, sanitizer = new globalThis.Sanitizer()) {
				setHTML(this, content, sanitizer);
			};
			polyfilled = true;
		}

		return polyfilled;
	};

	return { setHTML, polyfill };
}
