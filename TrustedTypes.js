/**
 * @See https://github.com/w3c/webappsec-trusted-types/blob/main/src/trustedtypes.js
 * @See https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
 * @Todo: Handle Element.prototype.innerHTML & ELement.prototype.outerHTML
 * @Todo: HAndle HTMLScriptElement.prototype.text & HTMLScriptElement.prototype.textContent
 * @Todo: Handle HTMLScriptElement.prototype.src
 * @Todo: Handle HTMLIframeElement.prototype.srcdoc
 * @Todo: Handle new Function()
 */

/**
 * [isSupported description]
 * @return {Boolean} [description]
 */
export function isSupported() {
	return 'trustedTypes' in globalThis;
}

/**
 * [supported description]
 */
export const supported = isSupported();

/**
 * [symbols description]
 * @type {Object}
 */
const symbols = {
	trustedValue: Symbol('trusted-value'),
	trustedKey: Symbol('trusted-key'),
	defaultPolicy: Symbol('defaultPolicy'),
};

/**
 * [aliases description]
 * @type {Object}
 */
const aliases = {
	element: {
		setAttribute: Symbol('element.setAttribute'),
		setAttributeNS: Symbol('element.setAttributeNS'),
		setAttributeNode: Symbol('element.setAttributeNode'),
		setAttributeNodeNS: Symbol('element.setAttributeNodeNS'),
		insertAdjacentHTML: Symbol('element.insertAdjacentHTML'),
	},
	document: {
		write: Symbol('document.write'),
		writeln: Symbol('document.writeln'),
	},
	global: {
		eval: Symbol('window.eval'),
	},
}

if (! Symbol.hasOwnProperty('toStringTag')) {
	Symbol.toStringTag = Symbol('Symbol.toStringTag');
}

/**
 * [getUnsetPolicyException description]
 * @param {TrustedTypesPolicy} policy  [description]
 * @param {string} method  [description]
 */
function getUnsetPolicyException(policy, method) {
	return function() {
		throw new TypeError(`Failed to execute '${method}' on 'TrustedTypePolicy': Policy ${policy.name}'s TrustedTypePolicyOptions did not specify a '${method}' member.`);
	}
}

/**
 * [TrustedType description]
 */
class TrustedType {
	/**
	 * [constructor description]
	 * @param {string} value  [description]
	 * @param {Symbol} key    [description]
	 */
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

			Object.freeze(this);
		}
	}

	/**
	 * [toString description]
	 * @return {string} [description]
	 */
	toString() {
		return this[symbols.trustedValue];
	}

	/**
	 * [toJSON description]
	 * @return {string} [description]
	 */
	toJSON() {
		return this[symbols.trustedValue];
	}
}

/**
 *
 */
export class TrustedHTML extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedHTML';
	}
}

/**
 *
 */
export class TrustedScript extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedScript';
	}
}

/**
 * [name description]
 * @type {Object}
 */
export class TrustedScriptURL extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedScriptURL';
	}
}

/**
 * [name description]
 * @type {Object}
 */
export class TrustedTypesPolicy {
	/**
	 * [constructor description]
	 * @param {string} name             [description]
	 * @param {Function} createHTML       [description]
	 * @param {Function} createScript     [description]
	 * @param {Function} createScriptURL  [description]
	 * @param {String} key              [description]
	 */
	constructor(name, { createHTML, createScript, createScriptURL }, key) {
		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		} else if (! name.toString().match(/^[-#a-zA-Z0-9=_/@.%]+$/g)) {
			throw new TypeError(`Policy ${name} contains invalid characters.`);
		}

		Object.defineProperties(this, {
			name: {
				enumerable: true,
				configurable: false,
				writable: false,
				value: name.toString(),
			},
			createHTML: {
				enumerable: true,
				configurable: false,
				writable: false,
				value: createHTML instanceof Function
					? (...args) => new TrustedHTML(createHTML(...args), symbols.trustedKey)
					: getUnsetPolicyException(this, 'createHTML'),
			},
			createScript: {
				enumerable: true,
				configurable: false,
				writable: false,
				value: createScript instanceof Function
					? (...args) => new TrustedScript(createScript(...args), symbols.trustedKey)
					: getUnsetPolicyException(this, 'createScript'),
			},
			createScriptURL: {
				enumerable: true,
				configurable: false,
				writable: false,
				value: createScriptURL instanceof Function
					? (...args) => new TrustedScriptURL(createScriptURL(...args), symbols.trustedKey)
					: getUnsetPolicyException(this, 'createScriptURL'),
			},
		});

		Object.freeze(this);
	}
}

/**
 * [policyName description]
 * @type {[type]}
 */
export class BeforeCreatePolicyEvent extends Event {
	constructor(type, policy, key) {
		super(name);

		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		}

		this.policyName = policy.name;
	}
}

/**
 * [enumerable description]
 * @type {Boolean}
 */
export class TrustedTypeFactory extends EventTarget {
	/**
	 * [constructor description]
	 * @param {Symbol} key  [description]
	 */
	constructor(key) {
		super();

		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		}

		Object.defineProperty(this, symbols.defaultPolicy, {
			enumerable: false,
			configurable: false,
			writable: true,
			value: null,
		});

		this.addEventListener('beforecreatepolicy', event => {
			if (this.onbeforecreatepolicy instanceof Function) {
				this.onbeforecreatepolicy.call(this, event);
			}
		});
	}

	/**
	 * [isHTML description]
	 * @param  {[type]}  value               [description]
	 * @return {Boolean}       [description]
	 */
	isHTML(value) {
		return value instanceof globalThis.TrustedHTML;
	}

	/**
	 * [isScript description]
	 * @param  {[type]}  value               [description]
	 * @return {Boolean}       [description]
	 */
	isScript(value) {
		return value instanceof globalThis.TrustedScript;
	}

	/**
	 * [isScriptURL description]
	 * @param  {[type]}  value               [description]
	 * @return {Boolean}       [description]
	 */
	isScriptURL(value) {
		return value instanceof globalThis.TrustedScriptURL;
	}

	/**
	 * [createPolicy description]
	 * @param  {string} name                          [description]
	 * @param  {Function} createHTML                    [description]
	 * @param  {Function} createScript                  [description]
	 * @param  {Function} createScriptURL               [description]
	 */
	createPolicy(name, {
		createHTML,
		createScript,
		createScriptURL,
	}) {
		const policy = new TrustedTypesPolicy(name, { createHTML, createScript, createScriptURL }, symbols.trustedKey);
		this.dispatchEvent(new BeforeCreatePolicyEvent('beforecreatepolicy', policy, symbols.trustedKey));

		if (policy.name === 'default') {
			this[symbols.defaultPolicy] = policy;
		}

		return policy;
	}

	/**
	 * [getAttributeType description]
	 * @param  {string} tagName                 [description]
	 * @param  {string} attribute               [description]
	 * @param  {string} elementNs               [description]
	 * @return {string}           [description]
	 */
	getAttributeType(tagName, attribute, elementNs/*, attrNs*/) {
		tagName = tagName.toLowerCase();
		attribute = attribute.toLowerCase();

		if (typeof elementNS === 'string' && elementNS.length !== 0) {
			return null;
		}

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

	/**
	 * [getPropertyType description]
	 * @param  {string} tagName                [description]
	 * @param  {string} property               [description]
	 * @return {string}          [description]
	 */
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

	/**
	 * [emptyHTML description]
	 * @return {TrustedHTML}
	 */
	get emptyHTML() {
		return new TrustedHTML('', symbols.trustedKey);
	}

	/**
	 * [emptyScript description]
	 * @return {TrustedScript}
	 */
	get emptyScript() {
		return new TrustedScript('', symbols.trustedKey);
	}

	/**
	 * [defaultPolicy description]
	 * @return {TrustedTypesPolicy} [description]
	 */
	get defaultPolicy() {
		return this[symbols.defaultPolicy];
	}

	/**
	 * [_isPolyfill_ description]
	 * @return {Boolean} [description]
	 */
	get _isPolyfill_() {
		return true;
	}
}

function harden() {
	Object.entries(aliases.element).forEach(([name, symbol]) => {
		Element.prototype[symbol] = Element.prototype[name];
		delete Element.prototype[name];
	});

	Object.entries(aliases.document).forEach(([name, symbol]) => {
		Document.prototype[symbol] = Document.prototype[name];
		delete Document.prototype[name];
	});

	Object.entries(aliases.global).forEach(([name, symbol]) => {
		globalThis[symbol] = globalThis[name];
		delete globalThis[name];
	});

	Document.prototype.write = function(text) {
		if (trustedTypes.isHTML(text)) {
			this[aliases.document.write].call(this, text.toString());
		} else {
			throw new TypeError('Untrusted HTML');
		}
	};

	Document.prototype.writeln = function(line) {
		if (trustedTypes.isHTML(line)) {
			this[aliases.document.writeln].call(this, line);
		} else {
			throw new TypeError('Untrusted HTML');
		}
	}

	globalThis.eval = function(code) {
		if (trustedTypes.isScript(code)) {
			globalThis[aliases.global.eval].call(this, code.toString());
		} else {
			throw new TypeError('Untrusted script');
		}
	}

	Element.prototype.insertAdjacentHTML = function(position, text) {
		if (trustedTypes.isHTML(text)) {
			this[aliases.element.insertAdjacentHTML].call(this, position, text.toString());
		} else {
			throw new TypeError('Untrusted HTML');
		}
	};

	Element.prototype.setAttribute = function(name, value) {
		switch(trustedTypes.getAttributeType(this.tagName, name)) {
			case TrustedHTML.name: {
				if (trustedTypes.isHTML(value)) {
					this[aliases.element.setAttribute].call(this, name, value.toString());
				} else {
					throw new DOMException('Untrusted HTML');
				}

				break;
			}

			case TrustedScript.name: {
				if (trustedTypes.isScript(value)) {
					this[aliases.element.setAttribute].call(this, name, value.toString());
				} else {
					throw new DOMException('Untrusted script');
				}

				break;
			}

			case TrustedScriptURL.name: {
				if (trustedTypes.isScriptURL(value)) {
					this[aliases.element.setAttribute].call(this, name, value.toString());
				} else {
					throw new DOMException('Untrusted script url');
				}

				break;
			}

			default:
				this[aliases.element.setAttribute].call(this, name, value.toString());
		}
	};

	Element.prototype.setAttributeNode = function(attribute) {
		switch(trustedTypes.getAttributeType(this.tagName, attribute.namename)) {
			case TrustedHTML.name: {
				if (trustedTypes.isHTML(value)) {
					return this[aliases.element.setAttributeNode].call(this, attribute);
				} else {
					throw new DOMException('Untrusted HTML');
				}

				break;
			}

			case TrustedScript.name: {
				if (trustedTypes.isScript(value)) {
					return this[aliases.element.setAttributeNode].call(this, attribute);
				} else {
					throw new DOMException('Untrusted script');
				}

				break;
			}

			case TrustedScriptURL.name: {
				if (trustedTypes.isScriptURL(value)) {
					return this[aliases.element.setAttributeNode].call(this, attribute);
				} else {
					throw new DOMException('Untrusted script url');
				}

				break;
			}

			default:
				return this[aliases.element.setAttributeNode].call(this, attribute);
		}
	}

	Element.prototype.setAttributeNS = function(namespace, name, value) {
		switch(trustedTypes.getAttributeType(this.tagName, name, namespace)) {
			case TrustedHTML.name: {
				if (trustedTypes.isHTML(value)) {
					this[aliases.element.setAttributeNS].call(this, namespace, name, value.toString());
				} else {
					throw new DOMException('Untrusted HTML');
				}

				break;
			}

			case TrustedScript.name: {
				if (trustedTypes.isScript(value)) {
					this[aliases.setAttributeNS].call(this, namespace, name, value.toString());
				} else {
					throw new DOMException('Untrusted script');
				}

				break;
			}

			case TrustedScriptURL.name: {
				if (trustedTypes.isScriptURL(value)) {
					this[aliases.element.setAttributeNS].call(this, namespace, name, value.toString());
				} else {
					throw new DOMException('Untrusted script url');
				}

				break;
			}

			default:
				this[aliases.element.setAttributeNS].call(this, namespace, name, value.toString());
		}
	};

	Element.prototype.setAttributeNodeNS = function(attribute) {
		switch(trustedTypes.getAttributeType(this.tagName, attribute.localName, attribute.prefix)) {
			case TrustedHTML.name: {
				if (trustedTypes.isHTML(value)) {
					this[aliases.element.setAttributeNodeNS].call(this, attribute);
				} else {
					throw new DOMException('Untrusted HTML');
				}

				break;
			}

			case TrustedScript.name: {
				if (trustedTypes.isScript(value)) {
					this[aliases.element.setAttributeNodeNS].call(this, attribute);
				} else {
					throw new DOMException('Untrusted script');
				}

				break;
			}

			case TrustedScriptURL.name: {
				if (trustedTypes.isScriptURL(value)) {
					this[aliases.element.setAttributeNodeNS].call(this, attribute);
				} else {
					throw new DOMException('Untrusted script url');
				}

				break;
			}

			default:
				this[aliases.element.setAttributeNodeNS].call(this, attribute);
		}
	};
}

/**
 * [trustedTypes description]
 * @type {TrustedTypeFactory}
 */
export const trustedTypes = new TrustedTypeFactory(symbols.trustedKey);

/**
 * [polyfill description]
 * @param  {Boolean} [enableHarden=false]               [description]
 * @return {[type]}                       [description]
 */
export function polyfill(enableHarden = false) {
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
	}

	if (enableHarden) {
		harden();
	}
}

/**
 * [getInsecurePolicy description]
 * @param  {String} [name='no-op']               [description]
 * @return {TrustedTypesPolicy}                [description]
 */
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

/**
 * [getStrictPolicy description]
 * @param  {String} [name='lock-down']               [description]
 * @return {TrustedTypesPolicy}                    [description]
 */
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

/**
 * [getDefaultPolicy description]
 * @param  {String} [name='default']                                [description]
 * @param  {Array}  [allowedOrigins=[location.origin, 'https:}      =             {}]  [description]
 * @return {TrustedTypesPolicy}                                   [description]
 */
export function getDefaultPolicy(name = 'default', {
	allowedOrigins = [location.origin, 'https://cdn.kernvalley.us', 'https://unpkg.com'],
} = {}) {
	const config = {
		createHTML: input => {
			const sanitized = new Sanitizer().sanitizeFor('div', input);

			sanitized.querySelectorAll('a[href]:not([rel])').forEach(a => {
				if (new URL(a.href).origin !== location.origin) {
					a.relList.add('external', 'noopener', 'noreferrer');
				}
			});

			return sanitized.innerHTML;
		},
		createScript: () => {
			throw new DOMException('Untrusted script');
		},
		createScriptURL: url => {
			if (! allowedOrigins.includes(new URL(url, location.origin).origin)) {
				throw new DOMException('Untrusted script origin');
			} else {
				return url;
			}
		},
	};

	if (isSupported()) {
		return globalThis.trustedTypes.createPolicy(name, config);
	} else {
		return trustedTypes.createPolicy(name, config);
	}
}
