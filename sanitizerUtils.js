import { SanitizerConfig as defaultConfig } from './SanitizerConfigW3C.js';
import { createPolicy } from './trust.js';
import { isObject, getType, callOnce } from './utility.js';
import { urls } from './attributes.js';

export const supported = () => 'Sanitizer' in globalThis;
export const nativeSupport = supported();

const allowProtocols = ['https:'];

if (! allowProtocols.includes(location.protocol)) {
	allowProtocols.push(location.protocol);
}
const policyName = 'sanitizer-raw#html';
const getPolicy = callOnce(() => createPolicy(policyName, { createHTML: input => input }));
const createHTML = input => getPolicy().createHTML(input);

function documentToFragment(doc) {
	const frag = document.createDocumentFragment();
	const clone = doc.cloneNode(true);
	frag.append(...clone.head.childNodes, ...clone.body.childNodes);
	return frag;
}

export function sanitize(input, { config = defaultConfig } = {}) {
	if (! (input instanceof Node)) {
		throw new TypeError('sanitize requires a Document or DocumentFragment');
	} else if (input.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
		return sanitizeNode(input, config);
	} else if (input.nodeType === Node.DOCUMENT_NODE) {
		return sanitizeNode(documentToFragment(input), { config });
	} else {
		throw new TypeError('sanitize requires a Document or DocumentFragment');
	}
}

export function sanitizeFor(tag, content, { config = defaultConfig } = {}) {
	const el = document.createElement(tag);
	const temp = document.createElement('template');
	temp.innerHTML = createHTML(content);
	el.append(sanitize(temp.content, { config }));
	return el;
}

export function sanitizeNode(node, { config = defaultConfig } = {}) {
	try {
		if (! (node instanceof Node)) {
			throw new TypeError(`Expected a Node but got a ${getType(node)}.`);
		} else if (! isObject(config)) {
			throw new TypeError(`Expected config to be an object but got ${getType(config)}.`);
		}

		const {
			allowElements, allowComments, allowAttributes, allowCustomElements,
			blockElements, dropAttributes, dropElements, allowUnknownMarkup,
		} = config;

		switch(node.nodeType) {
			case Node.TEXT_NODE:
				break;

			case Node.ELEMENT_NODE: {
				if (
					! allowUnknownMarkup
					&& ( ! (node instanceof HTMLElement) || node instanceof HTMLUnknownElement)
				) {
					node.remove();
					break;
				}

				const tag = node.tagName.toLowerCase();

				if (Array.isArray(dropElements) && dropElements.includes(tag)) {
					node.remove();
				} else if (Array.isArray(blockElements) && blockElements.includes(tag)) {
					if (node.hasChildNodes()) {
						[...node.childNodes].forEach(node => sanitizeNode(node, config));
						node.replaceWith(...node.childNodes);
					} else {
						node.remove();
					}
				} else if (tag.includes('-') && ! allowCustomElements) {
					node.remove();
				} else if (Array.isArray(allowElements) && ! allowElements.includes(tag)) {
					node.remove();
				} else if (tag === 'template') {
					sanitizeNode(node.content, config);
				} else {
					if (node.hasAttributes()) {
						node.getAttributeNames()
							.forEach(attr => sanitizeNode(node.getAttributeNode(attr), config));
					}

					if (node.hasChildNodes()) {
						[...node.childNodes].forEach(node => sanitizeNode(node, config));
					}
				}

				break;
			}

			case Node.ATTRIBUTE_NODE: {
				const { value, ownerElement } = node;
				const name = node.name.toLowerCase();
				const tag = ownerElement.tagName.toLowerCase();

				if (
					urls.includes(name)
					&& ! allowProtocols.includes(new URL(value, document.baseURI).protocol)
				) {
					ownerElement.removeAttributeNode(node);
				} else if (isObject(dropAttributes)) {
					if (
						name in dropAttributes
						&& ['*', tag].some(sel => dropAttributes[name].includes(sel))
					) {
						ownerElement.removeAttributeNode(node);

						if (name.startsWith('on')) {
							delete ownerElement[name];
						}
					}
				} else if (isObject(allowAttributes)) {
					if (
						! name.startsWith('data-')
						&& ! (name in allowAttributes
						&& ['*', tag].some(sel => allowAttributes[name].includes(sel)))
					) {
						ownerElement.removeAttributeNode(node);

						if (name.startsWith('on')) {
							delete ownerElement[name];
						}
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
					[...node.childNodes].forEach(node => sanitizeNode(node, config));
				}

				break;
			}

			case Node.CDATA_SECTION_NODE:
			case Node.PROCESSING_INSTRUCTION_NODE:
			case Node.DOCUMENT_TYPE_NODE:
			default: {
				node.parentElement.removeChild(node);
			}
		}
	} catch(err) {
		node.parentElement.removeChild(node);
		console.error(err);
	}

	return node;
}

export function getSantizerUtils(Sanitizer, defaultConfig) {
	const setHTML = function setHTML(el, input, { sanitizer = new Sanitizer() } = {}) {
		const div = sanitizer.sanitizeFor('div', input);
		el.replaceChildren(...div.children);
	};

	const polyfill = function polyfill() {
		let polyfilled = false;

		if (! supported()) {
			globalThis.Sanitizer = Sanitizer;
			polyfilled = true;
		} else {
			if (! (globalThis.Sanitizer.getDefaultConfiguration instanceof Function)) {
				globalThis.Sanitizer.getDefaultConfiguration = function() {
					return defaultConfig;
				};
				polyfilled = true;
			}

			if (! (globalThis.Sanitizer.prototype.getConfiguration instanceof Function)) {
				const configs = new WeakMap();
				const SanitizerNative = globalThis.Sanitizer;

				globalThis.Sanitizer = class Sanitizer extends SanitizerNative {
					constructor({
						allowAttributes, allowComments, allowElements, allowCustomElements,
						blockElements, dropAttributes, dropElements, allowUnknownMarkup,
					} = SanitizerNative.getDefaultConfiguration()) {
						super({
							allowAttributes, allowComments, allowElements, allowCustomElements,
							blockElements, dropAttributes, dropElements, allowUnknownMarkup,
						});
						configs.set(this, {
							allowAttributes, allowComments, allowElements, allowCustomElements,
							blockElements, dropAttributes, dropElements, allowUnknownMarkup,
						});
					}

					getConfiguration() {
						return configs.get(this);
					}
				};
				polyfilled = true;
			}

			if (! (globalThis.Sanitizer.prototype.sanitize instanceof Function)) {
				globalThis.Sanitizer.prototype.sanitize = function(input) {
					if (! (input instanceof Node)) {
						throw new TypeError('`Sanitizer.sanitize()` expects a `Node`');
					} else if (! [Node.DOCUMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE].includes(input.nodeType)) {
						throw new TypeError('Expected a Document or DocumentFragment in `Sanitizer.sanitize()`.');
					} else {
						return sanitize(input, { config: this.getConfiguration() });
					}
				};
				polyfilled = true;
			}

			if (
				! (globalThis.Sanitizer.prototype.sanitizeFor instanceof Function)
				&& Element.prototype.setHTML instanceof Function
			) {
				globalThis.Sanitizer.prototype.sanitizeFor = function(element, input) {
					const el = document.createElement(element);
					el.setHTML(input, { sanitizer: this });
					return el;
				};
				polyfilled = true;
			} else if (! (globalThis.Sanitizer.prototype.sanitizeFor instanceof Function)) {
				globalThis.Sanitizer.prototype.sanitizeFor = function(element, input) {
					const el = document.createElement(element);
					const tmp = document.createElement('template');
					tmp.innerHTML = createHTML(input);
					el.append(this.sanitize(tmp.content));
					return el;
				};
				polyfilled = true;
			}

			if (! (Element.prototype.setHTML instanceof Function)) {
				Element.prototype.setHTML = function(input, { sanitizer = new globalThis.Sanitizer() } = {}) {
					const el = sanitizer.sanitizeFor('div', input);
					this.replaceChildren(...el.children);
				};
				polyfilled = true;
			}
		}

		return polyfilled;
	};

	return { setHTML, polyfill };
}

export const trustPolicies = [policyName];
