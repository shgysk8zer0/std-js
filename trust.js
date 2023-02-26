import { getDeferred } from './promises.js';
import { listen } from './events.js';

export function supported() {
	return 'trustedTypes' in globalThis
		&& globalThis.trustedTypes instanceof EventTarget
		&& globalThis.trustedTypes.createPolicy instanceof Function;
}

export function isTrustPolicy(policy) {
	if ('TrustedTypePolicy' in globalThis && policy instanceof globalThis.TrustedTypePolicy) {
		return true;
	} else {
		return policy != null && policy.createHTML instanceof Function;
	}
}

export function hasDefaultPolicy() {
	return supported() && isTrustPolicy(globalThis.trustedTypes.defaultPolicy);
}

export function getAttributeType(tagName, attribute, elementNs) {
	if (supported()) {
		return globalThis.trustedTypes.getAttributeType(tagName, attribute, elementNs);
	} else {
		return null;
	}
}

export function isHTML(input) {
	if (supported()) {
		return globalThis.trustedTypes.isHTML(input);
	} else {
		return typeof input === 'string';
	}
}

export function isScript(input) {
	if (supported()) {
		return globalThis.trustedTypes.isScript(input);
	} else {
		return typeof input === 'string';
	}
}

export function isScriptURL(input) {
	if (supported()) {
		return globalThis.trustedTypes.isScriptURL(input);
	} else {
		return typeof input === 'string' || input instanceof URL;
	}
}

export function createHTML(input, { policy = getDefaultPolicy() } = {}) {
	if (isTrustPolicy(policy)) {
		return policy.createHTML(input);
	} else {
		return input;
	}
}

export function createScript(input, { policy = getDefaultPolicy() } = {}) {
	if (isTrustPolicy(policy)) {
		return policy.createScript(input);
	} else {
		return input;
	}
}

export function createScriptURL(input, { policy = getDefaultPolicy() } = {}) {
	if (isTrustPolicy(policy)) {
		return policy.createScriptURL(input);
	} else {
		return input;
	}
}

export function createPolicy(name, {
	createHTML = () => {
		throw new TypeError('This policy does not provide `createHTML()`');
	},
	createScript = () => {
		throw new TypeError('This policy does not provide `createScript()`');
	},
	createScriptURL = () => {
		throw new TypeError('This policy does not provide `createScriptURL()`');
	},
}) {
	if (supported()) {
		return globalThis.trustedTypes.createPolicy(name, { createHTML, createScript, createScriptURL });
	} else {
		return Object.freeze({ name, createHTML, createScript, createScriptURL });
	}
}

export function getDefaultPolicy() {
	if (supported()) {
		return globalThis.trustedTypes.defaultPolicy;
	} else {
		return null;
	}
}

export async function whenPolicyCreated(name = 'default', { signal } = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (! supported()) {
		reject(new DOMException('TrustedTypes not supported'));
	} else if (name === 'default' && isTrustPolicy(globalThis.trustedTypes.defaultPolicy)) {
		resolve({ policyName: globalThis.trustedTypes.defaultPolicy.name });
	} else {
		listen(globalThis.trustedTypes, 'beforecreatepolicy', function callback(event) {
			if (event.policyName === name) {
				requestIdleCallback(() => resolve(event));
				globalThis.trustedTypes.removeEventListener('beforecreatepolicy', callback, { signal });
			}
		}, { signal });
	}

	return promise;
}
