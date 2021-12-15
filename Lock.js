const protectedData = new WeakMap();
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Lock
 */
export class Lock {
	constructor(name, mode = 'exclusive') {
		if (! ['exclusive', 'shared'].includes(mode)) {
			throw new TypeError(`'${mode}' (value of 'mode' member of LockOptions) is not a valid value for enumeration LockMode.`);
		}

		if (! typeof name === 'string') {
			name = name.toString();
		}

		if (name.startsWith('-')) {
			throw new DOMException('Names starting with `-` are reserved');
		}

		protectedData.set(this, { name, mode });
	}

	get name() {
		return protectedData.get(this).name;
	}

	get mode() {
		return protectedData.get(this).mode;
	}
}
