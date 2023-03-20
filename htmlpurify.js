/**
 * @copyright 2022-2023 Chris Zuber <admin@kernvalley.us>
 */
import { createPolicy } from './trust.js';
import { events } from './attributes.js';
import { sanitize } from './sanitizerUtils.js';

/**
 * TrustedTypePolicy for internal use
 * @type {TrustedTypePolicy}
 */
const nullPolicy = createPolicy('purify-raw#html', { createHTML: input => input });

const config = {
	allowElements: null,
	allowAttributes: null,
	allowComments: false,
	allowCustomElements: true,
	allowUnknownMarkup: true,
	blockElements: null,
	dropElements: [
		'script', 'object', 'embed', 'param', 'head', 'body', 'frame', 'noscript',
		'base', 'iframe',
	],
	dropAttributes: Object.fromEntries([...events, 'ping', 'style'].map(attr => [attr, ['*']])),
};

/**
 * [trustPolicy description]
 * @type {TrustedTypePolicy}
 */
export const purify = createPolicy('purify#html', {
	createHTML: input => {
		const div = document.createElement('div');
		const tmp = document.createElement('template');
		tmp.innerHTML = nullPolicy.createHTML(input);
		div.append(sanitize(tmp.content, { config }));
		return div.innerHTML;
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
