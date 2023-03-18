/**
 * @copyright 2022-2023 Chris Zuber <admin@kernvalley.us>
 */
import { nativeSupport, getSantizerUtils, sanitize, sanitizeFor, trustPolicies } from './sanitizerUtils.js';
import { SanitizerConfig as defaultConfig } from './SanitizerConfigW3C.js';

const protectedData = new WeakMap();

/**
 * Need to create a policy for the Sanitizer API since
 * `trustedTypes.defaultPolicy.createHTML` will most likely use `new Sanitizer().sanitize()`
 * which would create infinite recursion.
 * @type {TrustedTypePolicy}
 */


/**
 * @SEE https://wicg.github.io/sanitizer-api/
 * @SEE https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/Sanitizer
 * @TODO: Figure out how to handle `allowElements`, `allowAttributes`, and how each
 *        works with their `block*` and/or `drop*` counterparts.
 * @TODO: Handle `svg:*` and `mathml:*`
 *
 * @NOTE: The spec is still under development and is likely to change.
 * @NOTE: This is a very imperfect implementation and may not perform very well,
 *        as it may involve a lot of querying & modifying.
 */
export class Sanitizer {
	constructor({
		allowElements, allowAttributes, blockElements, dropAttributes,
		dropElements, allowComments = defaultConfig.allowComments,
		allowCustomElements = defaultConfig.allowCustomElements,
		allowUnknownMarkup = defaultConfig.allowUnknownMarkup,
	} = Sanitizer.getDefaultConfiguration()) {
		protectedData.set(this, {
			allowElements, allowComments, allowAttributes, allowCustomElements,
			blockElements, dropAttributes, dropElements, allowUnknownMarkup,
		});
	}

	getConfiguration() {
		return protectedData.get(this);
	}

	sanitize(input) {
		return sanitize(input, { config: this.getConfiguration() });
	}

	sanitizeFor(tag, content) {
		return sanitizeFor(tag, content, { config: this.getConfiguration() });
	}

	static getDefaultConfiguration() {
		return defaultConfig;
	}
}

const { setHTML, polyfill } = getSantizerUtils(Sanitizer, defaultConfig);
export { nativeSupport, setHTML, polyfill, trustPolicies };
