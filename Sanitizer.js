import { Sanitizer as BaseSanitizer, trustPolicies } from './SanitizerBase.js';
import { SanitizerConfig as defaultConfig } from './SanitizerConfig.js';
import { getSantizerUtils, nativeSupport } from './sanitizerUtils.js';

export class Sanitizer extends BaseSanitizer {
	constructor({
		allowElements       = defaultConfig.allowElements,
		allowAttributes     = defaultConfig.allowAttributes,
		blockElements       = defaultConfig.blockElements,
		dropAttributes      = defaultConfig.dropAttributes,
		dropElements        = defaultConfig.dropElements,
		allowComments       = defaultConfig.allowComments,
		allowCustomElements = defaultConfig.allowCustomElements,
	} = {}) {
		super({ allowElements, allowAttributes, blockElements, dropAttributes,
			dropElements, allowComments, allowCustomElements,
		});
	}
}

const { setHTML, polyfill } = getSantizerUtils(Sanitizer, defaultConfig);

export { nativeSupport, setHTML, polyfill, trustPolicies };
