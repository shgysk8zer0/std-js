/**
 * @See https://github.com/w3c/webappsec-trusted-types/blob/main/src/trustedtypes.js
 * @See https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
 */
let defaultPolicy = null;
export function isSupported() {
	return 'trustedTypes' in globalThis;
}

export const supported = isSupported();

const symbols = {
	trustedValue: Symbol('trusted-value'),
	trustedKey: Symbol('trusted-key'),
};

const aliases = {
	setAttribute: Symbol('setAttribute'),
}

if (! Symbol.hasOwnProperty('toStringTag')) {
	Symbol.toStringTag = Symbol('Symbol.toStringTag');
}

function getUnsetPolicyCallback(policy, method) {
	Object.defineProperty('createHTML', {
		enumerable: true,
		configurable: false,
		writable: false,
		value: () => {
			throw new TypeError(`Failed to execute '${method}' on 'TrustedTypePolicy': Policy ${policy.name}'s TrustedTypePolicyOptions did not specify a '${method}' member.`);
		}
	});
}

class TrustedType {
	constructor (value, key) {
		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		} else {
			Object.defineProperty(this, symbols.trustedValue, {
				enumerable: false,
				configurable: false,
				writable: false,
				value: value.toString(),
			});

			Object.seal(this);
		}
	}

	toString() {
		return this[symbols.trustedValue];
	}

	toJSON() {
		return this[symbols.trustedValue];
	}
}

export class TrustedHTML extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedHTML';
	}
}

export class TrustedScript extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedScript';
	}
}

export class TrustedScriptURL extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedScriptURL';
	}
}

export class TrustedTypesPolicy {
	constructor(name, { createHTML, createScript, createScriptURL }, key) {
		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		} else if (! name.toString().match(/^[-#a-zA-Z0-9=_/@.%]+$/g)) {
			throw new TypeError(`Policy ${name} contains invalid characters.`);
		}

		Object.defineProperty(this, 'name', {
			enumerable: true,
			configurable: false,
			writable: false,
			value: name,
		});

		if (createHTML instanceof Function) {
			Object.defineProperty(this, 'createHTML', {
				enumerable: true,
				configurable: false,
				writable: false,
				value: (...args) => new TrustedHTML(createHTML(...args), symbols.trustedKey),
			});
		} else {
			getUnsetPolicyCallback(this, 'setHTML');
		}

		if (createScript instanceof Function) {
			Object.defineProperty(this, 'createScript', {
				enumerable: true,
				configurable: false,
				writable: false,
				value: (...args) => new TrustedScript(createScript(...args), symbols.trustedKey),
			});
		} else {
			getUnsetPolicyCallback(this, 'createScript');
		}

		if (createScriptURL instanceof Function) {
			Object.defineProperty(this, 'createScriptURL', {
				enumerable: true,
				configurable: false,
				writable: false,
				value: (...args) => new TrustedScriptURL(createScriptURL(...args), symbols.trustedKey),
			});
		} else {
			getUnsetPolicyCallback(this, 'createScriptURL');
		}

		Object.seal(this);
	}
}

export class BeforeCreatePolicyEvent extends Event {
	constructor(type, policy, key) {
		super(name);

		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		}

		this.policyName = policy.name;
	}
}

export class TrustedTypeFactory extends EventTarget {
	constructor(key) {
		super();

		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		}

		this.addEventListener('beforecreatepolicy', event => {
			if (this.onbeforecreatepolicy instanceof Function) {
				this.onbeforecreatepolicy.call(this, event);
			}
		});
	}

	isHTML(value) {
		return value instanceof globalThis.TrustedHTML;
	}

	isScript(value) {
		return value instanceof globalThis.TrustedScript;
	}

	isScriptURL(value) {
		return value instanceof globalThis.TrustedScriptURL;
	}

	createPolicy(name, {
		createHTML,
		createScript,
		createScriptURL,
	}) {
		const policy = new TrustedTypesPolicy(name, { createHTML, createScript, createScriptURL }, symbols.trustedKey);
		this.dispatchEvent(new BeforeCreatePolicyEvent('beforecreatepolicy', policy, symbols.trustedKey));

		if (policy.name === 'default') {
			defaultPolicy = policy;
		}

		return policy;
	}

	getAttributeType(tagName, attribute/*, elementNs, attrNs*/) {
		tagName = tagName.toLowerCase();
		attribute = attribute.toLowerCase();

		switch(tagName) {
			case 'script': {
				if (attribute === 'src') {
					return TrustedScriptURL.name;
				} else {
					return null;
				}

				break;
			}

			case 'iframe': {
				if (attribute === 'srcdoc') {
					return TrustedHTML.name;
				} else {
					return null;
				}

				break;
			}

			default:
				return null;
		}
	}

	getPropertyType(tagName, property/*, elementNS*/) {
		property = property.toLowerCase();
		tagName = tagName.toLowerCase();

		switch(tagName) {
			case 'embed': {
				if (property === 'src') {
					return TrustedScriptURL.name;
				} else {
					return null;
				}

				break;
			}

			case 'script': {
				if (property === 'src') {
					return TrustedScriptURL.name;
				} else if (['text', 'innerText', 'textContent'].includes(property)) {
					return TrustedScript.name;
				} else if (['outerHTML', 'innerHTML']) {
					return TrustedHTML.name;
				} else {
					return null;
				}

				break;
			}

			default: {
				if (['innerHTML', 'outerHTML'].includes(property)) {
					return 'TrustedHTML';
				} else {
					return null;
				}
			}
		}
	}

	get emptyHTML() {
		return new TrustedHTML('', symbols.trustedKey);
	}

	get emptyScript() {
		return new TrustedScript('', symbols.trustedKey);
	}

	get defaultPolicy() {
		return defaultPolicy;
	}

	get _isPolyfill_() {
		return true;
	}
}

function harden() {
	Object.entries(aliases).forEach(([name, symbol]) => {
		Element.prototype[symbol] = Element.prototype[name];
		delete Element.prototype[name];
	});

	Element.prototype.setAttribute = function(name, value) {
		switch(trustedTypes.getAttributeType(this.tagName, name)) {
			case TrustedHTML.name: {
				if (trustedTypes.isHTML(value)) {
					this[aliases.setAttribute].call(this, name, value);
				} else {
					throw new DOMException('Untrusted HTML');
				}

				break;
			}

			case TrustedScript.name: {
				if (trustedTypes.isScript(value)) {
					this[aliases.setAttribute].call(this, name, value);
				} else {
					throw new DOMException('Untrusted script');
				}

				break;
			}

			case TrustedScriptURL.name: {
				if (trustedTypes.isScriptURL(value)) {
					this[aliases.setAttribute].call(this, name, value);
				} else {
					throw new DOMException('Untrusted script url');
				}

				break;
			}

			default:
				this[aliases.setAttribute].call(this, name, value);
		}
	}
}

export const trustedTypes = new TrustedTypeFactory(symbols.trustedKey);

export function polyfill() {
	if (! ('TrustedHTML' in globalThis)) {
		globalThis.TrustedHTML = TrustedHTML;
	}

	if (! ('TrustedScript' in globalThis)) {
		globalThis.TrustedScript = TrustedScript;
	}

	if (! ('TrustedScriptURL' in globalThis)) {
		globalThis.TrustedScriptURL = TrustedScriptURL;
	}

	if (! ('trustedTypes' in globalThis)) {
		globalThis.trustedTypes = trustedTypes;
		harden();
	}
}

export function getInsecurePolicy(name = 'no-op') {
	if (isSupported()) {
		return globalThis.trustedTypes.createPolicy(name, {
			createHTML: val => val,
			createScript: val => val,
			createScriptURL: val => val,
		});
	} else {
		return trustedTypes.createPolicy(name, {
			createHTML: val => val,
			createScript: val => val,
			createScriptURL: val => val,
		});
	}
}

export function getStrictPolicy(name = 'lock-down') {
	if (isSupported()) {
		return globalThis.trustedTypes.createPolicy(name, {
			createHTML: () => globalThis.trustedTypes.emptyHTML,
			createScript: () => globalThis.trustedTypes.emptyScript,
			createScriptURL: () => '',
		});
	} else {
		return trustedTypes.createPolicy(name, {
			createHTML: () => trustedTypes.emptyHTML,
			createScript: () => trustedTypes.emptyScript,
			createScriptURL: () => '',
		});
	}
}
