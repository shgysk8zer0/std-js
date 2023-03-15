if ('Symbol' in globalThis) {
	if (typeof Symbol.toStringTag === 'undefined') {
		Symbol.toStringTag = Symbol('Symbol.toStringTag');
	}

	if (typeof Symbol.iterator === 'undefined') {
		Symbol.iterator = Symbol('Symbol.iterator');
	}
}
