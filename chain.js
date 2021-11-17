export function unchain(str, { base = globalThis, defaultValue = undefined, expect = undefined } = {}) {
	if (typeof str === 'string' && str.length !== 0) {
		let result = base;

		const found = str.split('.').every(seg => {
			if (seg.length !== 0 && seg in result) {
				result = result[seg];
				return result != null;
			} else {
				return false;
			}
		});

		if (! found) {
			return defaultValue;
		} else if (typeof expect === 'string') {
			return typeof result === expect ? result : defaultValue;
		} else {
			return result;
		}
	} else {
		return defaultValue;
	}
}
