export function supported() {
	return 'trustedTypes' in globalThis && globalThis.trustedTypes.createPolicy instanceof Function;
}

export function isTrustPolicy(policy) {
	if ('TrustedTypePolicy' in globalThis) {
		return policy instanceof globalThis.TrustedTypePolicy;
	} else {
		return policy != null && policy.createHTML instanceof Function;
	}
}

export function hasDefaultPolicy() {
	return supported() && isTrustPolicy(globalThis.trustedTypes.defaultPolicy);
}

export function isHTML(input) {
	if (supported()) {
		return globalThis.trustedTypes.isHTML(input);
	} else {
		return true;
	}
}

export function isScript(input) {
	if (supported()) {
		return globalThis.trustedTypes.isScript(input);
	} else {
		return true;
	}
}

export function isScriptURL(input) {
	if (supported()) {
		return globalThis.trustedTypes.isScriptURL(input);
	} else {
		return true;
	}
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
		return globalThis.trustedTypes.createPolicy(name, { createHTML, createScript, createScriptURL });
	} else {
		Object.freeze({ name, createHTML, createScript, createScriptURL });
	}
}

export function getDefaultPolicy() {
	if (supported()) {
		return globalThis.trustedTypes.defaultPolicy;
	} else {
		return null;
	}
}

export function createNullPolicy(name = 'insecure-policy') {
	return createPolicy(name, {
		createHTML: input => input,
		createScript: input => input,
		createScriptURL: input => input,
	});
}
