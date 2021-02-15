export function registerCustomElement(tag, cls, ...rest) {
	if (! (window.customElements instanceof Object)) {
		console.error(new Error('`customElements` not supported'));
		return false;
	} else if (typeof customElements.get(tag) !== 'undefined') {
		console.warn(new Error(`<${tag}> is already defined`));
		// Returns true/false if element being registered matches given class
		return customElements.get(tag) === cls;
	} else {
		customElements.define(tag, cls, ...rest);
		return true;
	}
}

export async function getCustomElement(tag) {
	if (! (window.customElements instanceof Object)) {
		throw(new Error('`customElements` not supported'));
	} else {
		await customElements.whenDefined(tag);
		return await customElements.get(tag);
	}
}

export async function createCustomElement(tag, ...args) {
	const Pro = await getCustomElement(tag);
	return new Pro(...args);
}

export async function defined(...els) {
	await Promise.all(els.map(el => customElements.whenDefined(el)));
}
