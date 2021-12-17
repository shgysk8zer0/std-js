const protectedData = new WeakMap();
export const nativeSupport = 'Sanitizer' in globalThis;

/**
 * @SEE https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/Sanitizer
 * @SEE https://wicg.github.io/sanitizer-api/
 *
 * @TODO: Figure out handdling of `allowCustomElements` & `allowComments`
 * @TODO: Expand list of `blockAttributes`, especially all `on*`
 * @TODO: Figure out how to handle `allowElements`, `alloeAttributes`, and how each
 *        works with their `block*` and `drop*` counterparts.
 *
 * @NOTE: The spec is still under development and is likely to change.
 * @NOTE: This is a very imperfect implementation and may not perform very well,
 *        as it may involve a lot of querying & modifying.
 */
export class Sanitizer {
	constructor(...args) {
		if (args.length !== 0) {
			throw new Error('Sanitizer API is not yet stable, so contructor arguments are not yet supported');
		}

		protectedData.set(this, Sanitizer.getDefaultConfiguration());
	}

	getConfiguration() {
		return protectedData.get(this);
	}

	sanitize(input) {
		if (input instanceof Document) {
			const frag = new DocumentFragment();
			frag.append(...[...input.head.childNodes, ...input.body.childNodes].map(node => node.cloneNode(true)));
			return this.sanitize(frag);
		} else if (input instanceof DocumentFragment) {
			/* It'd be great if this could be moved to a worker script... */
			const frag = input.cloneNode(true);
			const { blockElements, dropElements, dropAttributes } = this.getConfiguration();

			if (Array.isArray(blockElements)) {
				blockElements.forEach(tag => frag.querySelectorAll(tag).forEach(el => el.replaceWith(...el.childNodes)));
			}

			if (Array.isArray(dropElements)) {
				dropElements.forEach(tag => frag.querySelectorAll(tag).forEach(el => el.remove()));
			}

			if (Array.isArray(dropAttributes)) {
				dropAttributes.forEach(attr => frag.querySelectorAll(`[${attr}]`).forEach(el => el.removeAttribute(attr)));
			}

			frag.querySelectorAll('[href^="javascript:"]').forEach(el => el.removeAttribute('href'));


			return frag;
		}
	}

	sanitizeFor(tag, content) {
		const el = document.createElement(tag);
		el.append(this.sanitize(new DOMParser().parseFromString(content, 'text/html')));
		return el;
	}

	static getDefaultConfiguration() {
		return {
			/* allowElements,
			// allowCustomElements: false,
			// allowComments: false,
			// allowAttributes, */
			blockElements: ['iframe', 'frame'],
			/* <template> might not be accessible without using `template.content`
			// which would double proccessing */
			dropElements: ['script', 'object', 'param', 'embed', 'applet'],
			dropAttributes: [
				'onclick', 'onload', 'onerror', 'onmouseenter', 'onmouseleave', 'onmousedown', 'onmouseup',
				'onsubmit', 'onreset', 'onwheel', 'onscroll', 'oncontextmenu', 'onblur', 'onauxclick',
				'oninput', 'onchange', 'onkeydown', 'onkeyup', 'onkeypress', 'onformdata', 'onbeforeinput',
				'ondblclick', 'oncut', 'onpaste', 'oninvalid', 'ondrag', 'ondragstart',
				'ondragend', 'ondrop', 'onfocus', 'onmousein', 'onmouseout', 'onmousemove',
			],
		};
	}
}

export function setHTML(el, content, sanitizer = new Sanitizer()) {
	const frag = sanitizer.sanitizeFor(el.tagName.toLowerCase(), content);
	el.replaceChildren(...frag.childNodes);
}

export function polyfill() {
	if (nativeSupport) {
		return false;
	} else {
		globalThis.Sanitizer = Sanitizer;

		if (! (Element.prototype.setHTML instanceof Function)) {
			Element.prototype.setHTML = function setHTML(content, sanitizer = new Sanitizer()) {
				setHTML(this, content, sanitizer);
			};
		}

		return true;
	}
}
