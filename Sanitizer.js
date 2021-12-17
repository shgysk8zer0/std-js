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
	constructor({
		/* allowElements,
		// allowCustomElements = false,
		// allowComments = false,
		// allowAttributes, */
		blockElements,
		/* <template> might not be accessible without using `template.content`
		// which would double proccessing */
		dropElements = ['script', 'template', 'object', 'iframe', 'frame'],
		dropAttributes = [
			'onclick', 'onload', 'onerror', 'onmouseenter', 'onmouseleave', 'onmousedown', 'onmouseup',
			'onsubmit', 'onreset', 'onwheel', 'onscroll', 'oncontextmenu', 'onblur', 'onauxclick',
			'oninput', 'onchange', 'onkeydown', 'onkeyup', 'onkeypress', 'onformdata', 'onbeforeinput',
			'ondblclick', 'oncut', 'onpaste', 'oninvalid', 'ondrag', 'ondragstart',
			'ondragend', 'ondrop', 'onfocus', 'onmousein', 'onmouseout', 'onmousemove',
		],
	} = {}) {
		protectedData.set(this, { dropElements, dropAttributes, blockElements });
	}

	sanitize(doc) {
		if (doc instanceof Document) {
			const frag = new DocumentFragment();
			frag.append(...[...doc.head.childNodes, ...doc.body.childNodes].map(node => node.cloneNode(true)));
			return this.sanitize(frag);
		} else if (doc instanceof DocumentFragment) {
			/* It'd be great if this could be moved to a worker script... */
			const frag = doc.cloneNode(true);
			const { blockElements, dropElements, dropAttributes } = protectedData.get(this);

			if (Array.isArray(blockElements)) {
				blockElements.forEach(tag => frag.querySelectorAll(tag).forEach(el => el.replaceWith(...el.childNodes)));
			}

			if (Array.isArray(dropElements)) {
				dropElements.forEach(tag => frag.querySelectorAll(tag).forEach(el => el.remove()));
			}

			if (Array.isArray(dropAttributes)) {
				dropAttributes.forEach(attr => {
					frag.querySelectorAll(`[${attr}]`).forEach(el => el.removeAttribute(attr));
				});
			}

			frag.querySelectorAll('form[action]').forEach(form => form.removeAttribute('action'));

			return frag;
		}
	}

	sanitizeFor(tag, content) {
		const el = document.createElement(tag);
		const frag = new DocumentFragment();
		const doc = new DOMParser().parseFromString(content, 'text/html');
		frag.append(...[...doc.head.childNodes, ...doc.body.childNodes].map(node => node.cloneNode(true)));
		el.append(this.sanitize(frag));
		return el;
	}
}

export function polyfill() {
	if (nativeSupport) {
		return false;
	} else {
		globalThis.Sanitizer = Sanitizer;

		if (! (Element.prototype.setHTML instanceof Function)) {
			Element.prototype.setHTML = function setHTML(content, sanitizer = new Sanitizer()) {
				this.innerHTML = sanitizer.sanitizeFor(this.tagName.toLowerCase(), content).innerHTML;
			};
		}

		return true;
	}
}
