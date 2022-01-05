export function supported() {
	return 'trustedTypes' in globalThis;
}

export function hasDefaultPolicy() {
	return supported() && globalThis.trustedTypes.defaultPolicy != null;
}

export function createHTML(input) {
	if (hasDefaultPolicy()) {
		return globalThis.trustedTypes.createHTML(input);
	} else {
		return input;
	}
}

export function createScript(input) {
	if (hasDefaultPolicy()) {
		return globalThis.trustedTypes.createScript(input);
	} else {
		return input;
	}
}

export function createScriptURL(input) {
	if (hasDefaultPolicy()) {
		return globalThis.trustedTypes.createScriptURL(input);
	} else {
		return input;
	}
}

export function createPolicy(name, { createHTML, createScript, createScriptURL }) {
	if (supported()) {
		return global.trustedTypes.createPolicy(name, { createHTML, createScript, createScriptURL });
	} else {
		Object.freeze({ name, createHTML, createScript, createScript });
	}
}

export function createNullPolicy(name = 'insecure-policy') {
	return createPolicy(name, {
		createHTML: input => input,
		createScript: input => input,
		createScriptURL: input => input,
	});
}
