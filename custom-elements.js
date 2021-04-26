export const supported = window.customElements instanceof Object;

export function isDefined(...tags) {
	return supported && tags.every(tag => typeof customElements.get(tag) !== 'undefined');
}

export function registerCustomElement(tag, cls, { extends } = {}) {
	if (! supported) {
		console.error(new Error('`customElements` not supported'));
		return false;
	} else if (isDefined(tag)) {
		console.warn(new Error(`<${tag}> is already defined`));
		// Returns true/false if element being registered matches given class
		return customElements.get(tag) === cls;
	} else {
		customElements.define(tag, cls, { extends });
		return true;
	}
}

export async function getCustomElement(tag) {
	if (supported) {
		await customElements.whenDefined(tag);
		return customElements.get(tag);
	} else {
		throw new Error('`customElements` not supported');
	}
}

export async function createCustomElement(tag, ...args) {
	const Pro = await getCustomElement(tag);
	return new Pro(...args);
}

export async function whenDefined(...els) {
	if (supported) {
		await Promise.all(els.map(el => customElements.whenDefined(el)));
	} else {
		throw new Error('`customElements` not supported');
	}
}

export async function defined(...els) {
	console.error('`defined()` is deprecated. Please use `whenDefined()` instead');
	await whenDefined(...els);
}
