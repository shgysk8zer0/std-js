import { createPolicy } from './trust.js';
import { events } from './attributes.js';

/**
 * TrustedTypePolicy for internal use
 * @type {TrustedTypePolicy}
 */
const nullPolicy = createPolicy('purify-raw#html', { createHTML: input => input });
const tags = ['script', 'object', 'embed', 'param', 'head', 'body', 'frame'];
const attributes = [...events, 'ping'];

/**
 * [sanitize description]
 * @param  {Node} node               [description]
 * @return {void}      [description]
 */
function sanitize(node) {
	switch(node.nodeType) {
		case Node.TEXT_NODE:
			break;

		case Node.ELEMENT_NODE: {
			const tag = node.tagName.toLowerCase();
			if (tags.includes(tag)) {
				node.remove();
			} else {
				if (tag === 'template') {
					sanitize(node.content);
				}

				if (node.hasAttributes()) {
					node.getAttributeNames().forEach(attr => sanitize(node.getAttributeNode(attr)));
				}

				if (node.hasChildNodes()) {
					[...node.childNodes].forEach(sanitize);
				}
			}

			break;
		}

		case Node.ATTRIBUTE_NODE: {
			const { value, ownerElement } = node;
			const name = node.name.toLowerCase();

			if (name === 'href' && value.toLowerCase().startsWith('javascript:')) {
				ownerElement.removeAttributeNode(node);
			} else if (attributes.includes(name.toLowerCase())) {
				ownerElement.removeAttributeNode(node);
			}

			break;
		}

		case Node.COMMENT_NODE: {
			node.remove();

			break;
		}

		case Node.DOCUMENT_NODE:
		case Node.DOCUMENT_FRAGMENT_NODE: {
			if (node.hasChildNodes()) {
				[...node.childNodes].forEach(sanitize);
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
}

/**
 * [purifyToFragment description]
 * @param  {string} input               [description]
 * @return {DocumentFragment}       [description]
 */
export function createFragment(input) {
	const tmp = document.createElement('template');
	// Set `innerHTML` to `TrustedHTML`
	tmp.innerHTML = nullPolicy.createHTML(input);
	sanitize(tmp.content);
	return tmp.content;
}

/**
 * [trustPolicy description]
 * @type {TrustedTypePolicy}
 */
export const purify = createPolicy('purify#html', {
	createHTML: input => {
		const el = document.createElement('div');
		el.append(createFragment(input));
		return el.innerHTML;
	},
});

/**
 * Alias of `purify.createHTML()`
 * @param  {string} input               [description]
 * @return {TrustedHTML}       [description]
 */
export function createHTML(input) {
	return purify.createHTML(input);
}

export const trustPolicies = [nullPolicy.name, purify.name];
