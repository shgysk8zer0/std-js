import { Sanitizer as BaseSanitizer, trustPolicies } from './SanitizerBase.js';
import { SanitizerConfig as defaultConfig } from './SanitizerConfigW3C.js';
import { getSantizerUtils, nativeSupport } from './sanitizerUtils.js';

export class Sanitizer extends BaseSanitizer {
	constructor({
		allowElements, allowAttributes, blockElements, dropAttributes,
		dropElements, allowComments = defaultConfig.allowComments,
		allowCustomElements, allowUnknownMarkup = defaultConfig.allowUnknownMarkup,
	} = BaseSanitizer.getDefaultConfiguration()) {
		super({ allowElements, allowAttributes, blockElements, dropAttributes,
			dropElements, allowComments, allowCustomElements, allowUnknownMarkup,
		});
	}
}

const { setHTML, polyfill } = getSantizerUtils(Sanitizer, defaultConfig);

export { nativeSupport, setHTML, polyfill, trustPolicies };
