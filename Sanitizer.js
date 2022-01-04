import { Sanitizer as BaseSanitizer } from './SanitizerBase.js';
import { SanitizerConfig as defaultConfig } from './SanitizerConfig.js';
import { getSantizerUtils, nativeSupport } from './sanitizerUtils.js';

export class Sanitizer extends BaseSanitizer {
	constructor(init = Sanitizer.getDefaultConfiguration()) {
		super(init);
	}

	static getDefaultConfiguration() {
		return defaultConfig;
	}
}

const { setHTML, polyfill } = getSantizerUtils(Sanitizer, defaultConfig);

export { nativeSupport, setHTML, polyfill };
