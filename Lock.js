const protectedData = new WeakMap();
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Lock
 */
export class Lock {
	constructor(name, mode = 'exclusive') {
		protectedData.set(this, { name, mode });
	}

	get name() {
		return protectedData.get(this).name;
	}

	get mode() {
		return protectedData.get(this).mode;
	}
}
