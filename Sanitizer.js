const protectedData = new WeakMap();
export const nativeSupport = 'Sanitizer' in globalThis;
import { SanitizerConfig as defaultConfig } from './SanitizerConfig.js';
import { parseAsFragment, documentToFragment } from './dom.js';

/**
 * @SEE https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/Sanitizer
 * @SEE https://wicg.github.io/sanitizer-api/
 * @TODO: Figure out handdling of `allowCustomElements` & `allowComments`
 * @TODO: Expand list of `blockAttributes`, especially all `on*`
 * @TODO: Figure out how to handle `allowElements`, `allowAttributes`, and how each
 *        works with their `block*` and `drop*` counterparts.
 *
 * @NOTE: The spec is still under development and is likely to change.
 * @NOTE: This is a very imperfect implementation and may not perform very well,
 *        as it may involve a lot of querying & modifying.
 */
export class Sanitizer {
	constructor({
		allowElements       = defaultConfig.allowElements,
		allowComments       = defaultConfig.allowComments,
		allowAttributes     = defaultConfig.allowAttributes,
		allowCustomElements = defaultConfig.allowCustomElements,
		blockAttributes     = defaultConfig.blockAttributes,
		blockElements       = defaultConfig.blockElements,
		dropAttributes      = defaultConfig.dropAttributes,
	} = {}) {
		protectedData.set(this,{
			allowElements, allowComments, allowAttributes, allowCustomElements,
			blockAttributes, blockElements, dropAttributes,
		});
	}

	getConfiguration() {
		return protectedData.get(this);
	}

	sanitize(input) {
		if (input instanceof Document) {
			return this.sanitize(documentToFragment(input));
		} else if (input instanceof DocumentFragment) {
			/* It'd be great if this could be moved to a worker script... */
			const frag = input.cloneNode(true);
			const {
				allowElements, allowAttributes, allowComments, allowCustomElements,
				blockElements,
			} = this.getConfiguration();

			/* eslint no-inner-declarations: 0 */
			const sanitizeNode = function sanitizeNode(node) {
				switch(node.nodeType) {
					case Node.TEXT_NODE:
						break;

					case Node.ELEMENT_NODE: {
						const tag = node.tagName.toLowerCase();

						if (Array.isArray(blockElements) && blockElements.includes(tag)) {
							node.childNodes.forEach(sanitizeNode);
							node.replaceWith(...node.childNodes);
						} else if (tag.includes('-') && !allowCustomElements) {
							node.remove();
						} else if (Array.isArray(allowElements) && ! allowElements.includes(tag)) {
							node.remove();
						} else if (tag === 'template') {
							node.content.childNodes.forEach(sanitizeNode);
						} else {
							node.getAttributeNames().forEach(attr => {
								const value = node.getAttribute(attr);
								if (! (attr in allowAttributes)) {
									node.removeAttribute(attr);
								} else if (! ['*', tag].some(tag => allowAttributes[attr].includes(tag))) {
									node.removeAttribute(attr);
								} else if (['href', 'action'].includes(attr) && value.startsWith('javascript:')) {
									node.removeAttribute(attr);
								}
							});

							if (node.hasChildNodes()) {
								node.childNodes.forEach(sanitizeNode);
							}
						}
						break;
					}

					case Node.COMMENT_NODE: {
						if (! allowComments) {
							node.remove();
						}
						break;
					}

					default:
						node.remove();
				}
			};

			Array.from(frag.childNodes).forEach(sanitizeNode);
			return frag;
		}
	}

	sanitizeFor(tag, content) {
		const el = document.createElement(tag);
		el.append(this.sanitize(parseAsFragment(content)));
		return el;
	}

	static getDefaultConfiguration() {
		return defaultConfig;
	}
}

export function setHTML(el, content, sanitizer = new Sanitizer()) {
	const frag = sanitizer.sanitizeFor(el.tagName.toLowerCase(), content);
	el.replaceChildren(...frag.childNodes);
}

export function polyfill() {
	if (!('Sanitizer' in globalThis)) {
		globalThis.Sanitizer = Sanitizer;
	} else if (! (globalThis.Sanitizer.getDefaultConfiguration instanceof Function)) {
		globalThis.Sanitizer.getDefaultConfiguration = () => defaultConfig;
	}

	if (! (Element.prototype.setHTML instanceof Function)) {
		Element.prototype.setHTML = function setHTML(content, sanitizer = new globalThis.Sanitizer()) {
			setHTML(this, content, sanitizer);
		};
	}
}
