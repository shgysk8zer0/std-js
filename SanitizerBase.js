const protectedData = new WeakMap();
import { SanitizerConfig as defaultConfig } from './SanitizerConfigBase.js';
import { nativeSupport, getSantizerUtils } from './sanitizerUtils.js';
import { parseAsFragment, documentToFragment } from './dom.js';

/**
 * @SEE https://wicg.github.io/sanitizer-api/
 * @SEE https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/Sanitizer
 * @TODO: Figure out how to handle `allowElements`, `allowAttributes`, and how each
 *        works with their `block*` and/or `drop*` counterparts.
 *
 * @NOTE: The spec is still under development and is likely to change.
 * @NOTE: This is a very imperfect implementation and may not perform very well,
 *        as it may involve a lot of querying & modifying.
 */
export class Sanitizer {
	constructor({ allowElements, allowAttributes, blockElements, dropAttributes,
		dropElements, allowComments = false, allowCustomElements = false,
	} = Sanitizer.getDefaultConfiguration()) {
		protectedData.set(this, {
			allowElements, allowComments, allowAttributes, allowCustomElements,
			blockElements, dropAttributes, dropElements
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
				allowElements, allowComments, allowAttributes, allowCustomElements,
				blockElements, dropAttributes, dropElements
			} = this.getConfiguration();

			const sanitizeNode = function sanitizeNode(node) {
				try {
					switch(node.nodeType) {
						case Node.TEXT_NODE:
							break;

						case Node.ELEMENT_NODE: {
							if (! (node.parentNode instanceof Node)) {
								break;
							}

							const tag = node.tagName.toLowerCase();

							if (Array.isArray(dropElements) && dropElements.includes(tag)) {
								node.remove();
							} else if (Array.isArray(blockElements) && blockElements.includes(tag)) {
								if (node.hasChildNodes()) {
									[...node.childNodes].forEach(sanitizeNode);
									node.replaceWith(...node.childNodes);
								} else {
									node.remove();
								}
							} else if (tag.includes('-') && !allowCustomElements) {
								node.remove();
							} else if (Array.isArray(allowElements) && ! allowElements.includes(tag)) {
								node.remove();
							} else if (tag === 'template') {
								sanitizeNode(node.content);
							} else {
								if (node.hasAttributes()) {
									node.getAttributeNames().forEach(attr => sanitizeNode(node.getAttributeNode(attr)));
								}

								if (node.hasChildNodes()) {
									[...node.childNodes].forEach(sanitizeNode);
								}
							}

							break;
						}

						case Node.ATTRIBUTE_NODE: {
							const { name, value, ownerElement } = node;
							const tag = ownerElement.tagName.toLowerCase();

							if (name === 'href' && value.startsWith('javascript:')) {
								ownerElement.removeAttribute(name);
							} else if (typeof dropAttributes !== 'undefined') {
								if (name in dropAttributes && ['*', tag].some(sel => dropAttributes[name].includes(sel))) {
									ownerElement.removeAttribute(name);
								}
							} else if (typeof allowAttributes !== 'undefined') {
								if (! (name in allowAttributes && ['*', tag].some(sel => allowAttributes[name].includes(sel)))) {
									ownerElement.removeAttribute(name);
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

						case Node.DOCUMENT_NODE:
						case Node.DOCUMENT_FRAGMENT_NODE: {
							if (node.hasChildNodes()) {
								[...node.childNodes].forEach(node => sanitizeNode(node));
							}

							break;
						}

						case Node.CDATA_SECTION_NODE:
						case Node.PROCESSING_INSTRUCTION_NODE:
						case Node.DOCUMENT_TYPE_NODE:
						default:
							node.parentElement.removeChild(node);
					}
				} catch(err) {
					node.parentElement.removeChild(node);
					console.error(err);
				}

				return node;
			};

			sanitizeNode(frag);
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

const { setHTML, polyfill } = getSantizerUtils(Sanitizer, defaultConfig);

export { nativeSupport, setHTML, polyfill };
