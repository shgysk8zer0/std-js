import { supported as isSupported } from './trust.js';
import { events } from './attributes.js';
import { getMetaCSP, getHTTPCSP } from './http.js';
/**
 * @See https://github.com/w3c/webappsec-trusted-types/blob/main/src/trustedtypes.js
 * @See https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
 */

// `<html data-fetch-trust-csp="1">` will enable using actual CSP
const fetchCSP = document.documentElement.dataset.fetchTrustCsp === '1';

function parseCSP({ 'trusted-types': trustedTypes = null } = {}) {
	if (Array.isArray(trustedTypes)) {
		const policies = new Set(trustedTypes);
		const allowDuplicates = policies.has('\'allow-duplicates\'');
		const hasNone = policies.has('\'none\'');

		if (allowDuplicates) {
			policies.delete('\'allow-duplicates\'');
		}

		if (hasNone) {
			policies.clear();
		}

		policies.add('empty#html');
		policies.add('empty#script');

		return { policies, allowDuplicates, hasNone };
	} else {
		return {};
	}
}

async function getActualCSP() {
	const { policies, allowDuplicates = false, hasNone = false } = await getHTTPCSP().then(parseCSP);

	if (policies instanceof Set) {
		return { policies, allowDuplicates, hasNone };
	} else {
		return {};
	}
}

function init() {
	// Temporary config if/while fetching actual CSP
	// Maps to `trusted-types 'allow-duplicates'`
	const getAllowDuplicates = () => {
		const csp = parseCSP(getMetaCSP());

		if (typeof csp === 'object' && 'allowDuplicates' in csp) {
			return csp.allowDuplicates;
		} else {
			return document.documentElement.dataset.allowTrustDuplicates === '1';
		}
	};

	const getAllowedPolicies = () => {
		if (document.documentElement.dataset.hasOwnProperty('trustedPolicies')) {
			return new Set([
				'empty#html', 'empty#script',
				...document.documentElement.dataset.trustedPolicies.split(' '),
			]);
		} else {
			const { policies } = parseCSP(getMetaCSP());

			if (policies instanceof Set) {
				return policies;
			} else {
				return new Set(['empty#html', 'empty#script']);
			}
		}
	};

	const fromCSP = parseCSP(getMetaCSP());

	if (typeof fromCSP === 'object' && fromCSP.policies instanceof Set) {
		const { policies: allowedPolicies, allowDuplicates } = fromCSP;
		return { allowDuplicates, allowedPolicies };
	} else {
		const allowDuplicates = getAllowDuplicates();
		const allowedPolicies = getAllowedPolicies();

		if (allowedPolicies.has('\'none\'')) {
			allowedPolicies.clear();
		}

		allowedPolicies.add('empty#html');
		allowedPolicies.add('empty#script');

		return { allowDuplicates, allowedPolicies };
	}
}

const { allowDuplicates, allowedPolicies } = init();

/**
 * [supported description]
 */
export const supported = isSupported();

/**
 * [symbols description]
 * @type {Object}
 */
const symbols = {
	trustedValue: Symbol('[[Data]]'),
	trustedKey: Symbol('trusted-key'),
	emptyHTML: Symbol('policy-empty#html'),
	emptyScript: Symbol('policy-empty#script'),
	policy: Symbol.for('trust-policy'),
	defaultPolicy: Symbol('default-policy'),
	trustedTypesCSP: Symbol('trusted-types-csp'),
};

if (! Symbol.hasOwnProperty('toStringTag')) {
	Symbol.toStringTag = Symbol('Symbol.toStringTag');
}

const policies = [];

function getPolicy(name) {
	return policies.find(policy => policy.name === name) || null;
}

function hasPolicy(name) {
	return getPolicy(name) !== null;
}

/**
 * [getUnsetPolicyException description]
 * @param {TrustedTypePolicy} policy  [description]
 * @param {String} method  [description]
 */
function getUnsetPolicyException(policy, method) {
	return function() {
		throw new TypeError(`Failed to execute '${method}' on 'TrustedTypePolicy': Policy ${policy.name}'s TrustedTypePolicyOptions did not specify a '${method}' member.`);
	};
}

/**
 * [TrustedType description]
 * @type {TrustedType}
 */
export class TrustedType {
	/**
	 * [constructor description]
	 * @param {String} value  [description]
	 * @param {Symbol} key    [description]
	 */
	constructor(value, { key, policy }) {
		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		} else {
			Object.defineProperties(this, {
				[symbols.trustedValue]: {
					enumerable: false,
					configurable: false,
					writable: false,
					value: value.toString(),
				},
				[symbols.policy]: {
					enumerable: false,
					configurable: false,
					writable: false,
					value: policy.name,
				},
			});

			Object.freeze(this);
		}
	}

	/**
	 * [toString description]
	 * @return {String} [description]
	 */
	toString() {
		return this.valueOf();
	}

	/**
	 * [toJSON description]
	 * @return {String} [description]
	 */
	toJSON() {
		return this.valueOf();
	}

	valueOf() {
		return this[symbols.trustedValue];
	}
}

/**
 * [description]
 * @type {TrustedHTML}
 */
export class TrustedHTML extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedHTML';
	}
}

/**
 * [description]
 * @type {TrustedScript}
 */
export class TrustedScript extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedScript';
	}
}

/**
 * [name description]
 * @type {TrustedScriptURL}
 */
export class TrustedScriptURL extends TrustedType {
	[Symbol.toStringTag]() {
		return 'TrustedScriptURL';
	}
}

/**
 * [name description]
 * @type {TrustedTypePolicy}
 */
export class TrustedTypePolicy {
	/**
	 * [constructor description]
	 * @param {String} name             [description]
	 * @param {Function} createHTML       [description]
	 * @param {Function} createScript     [description]
	 * @param {Function} createScriptURL  [description]
	 * @param {String} key              [description]
	 */
	constructor(name, { createHTML, createScript, createScriptURL } = {}, { key }) {
		// @TODO: Chrome seems to allow any same-origin scripts creating policies
		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		} else {
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
						? (input, ...args) => new TrustedHTML(
							createHTML(input.toString(), ...args),
							{ key: symbols.trustedKey, policy: this }
						)
						: getUnsetPolicyException(this, 'createHTML'),
				},
				createScript: {
					enumerable: true,
					configurable: false,
					writable: false,
					value: createScript instanceof Function
						? (input, ...args) => new TrustedScript(
							createScript(input.toString(), ...args),
							{ key: symbols.trustedKey, policy: this }
						)
						: getUnsetPolicyException(this, 'createScript'),
				},
				createScriptURL: {
					enumerable: true,
					configurable: false,
					writable: false,
					value: createScriptURL instanceof Function
						? (input, ...args) => new TrustedScriptURL(
							createScriptURL(input.toString(), ...args),
							{ key: symbols.trustedKey, policy: this }
						)
						: getUnsetPolicyException(this, 'createScriptURL'),
				},
			});
		}
	}
}

/**
 * [policyName description]
 * @type {[BeforeCreatePolicyEvent]}
 */
export class BeforeCreatePolicyEvent extends Event {
	constructor(type, { policy, key }) {
		super(type);

		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		} else if (! (policy instanceof TrustedTypePolicy)) {
			throw new TypeError('Not a TrustedTypePolicy');
		}

		this.policyName = policy.name;
	}
}

/**
 * [enumerable description]
 * @type {TrustedTypePolicyFactory}
 */
export class TrustedTypePolicyFactory extends EventTarget {
	/**
	 * [constructor description]
	 * @param {Symbol} key  [description]
	 */
	constructor(key) {
		super();

		if (key !== symbols.trustedKey) {
			throw new TypeError('Invalid constructor');
		}

		if (fetchCSP) {
			getActualCSP().then(({ policies, allowDuplicates = false, hasNone = false }) => {
				if (typeof policies !== 'undefined') {
					Object.defineProperty(TrustedTypePolicyFactory, symbols.trustedTypesCSP, {
						value: { policies, allowDuplicates, hasNone },
						enumberable: false,
						writable: false,
						configurable: false,
					});
				}
			}).catch(err => console.error(err));
		}

		Object.defineProperties(this, {
			[symbols.defaultPolicy]: {
				enumerable: false,
				configurable: false,
				writable: true,
				value: null,
			},
			[symbols.emptyHTML]: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: this.createPolicy('empty#html', { createHTML: () => '' }),
			},
			[symbols.emptyScript]: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: this.createPolicy('empty#script', { createScript: () => '' }),
			},
		});
	}

	/**
	 * [isHTML description]
	 * @param  {String}  value               [description]
	 * @return {Boolean}       [description]
	 */
	isHTML(value) {
		return value instanceof globalThis.TrustedHTML;
	}

	/**
	 * [isScript description]
	 * @param  {String}  value               [description]
	 * @return {Boolean}       [description]
	 */
	isScript(value) {
		return value instanceof globalThis.TrustedScript;
	}

	/**
	 * [isScriptURL description]
	 * @param  {String}  value               [description]
	 * @return {Boolean}       [description]
	 */
	isScriptURL(value) {
		return value instanceof globalThis.TrustedScriptURL;
	}

	/**
	 * [createPolicy description]
	 * @param  {String} name                          [description]
	 * @param  {Function} createHTML                    [description]
	 * @param  {Function} createScript                  [description]
	 * @param  {Function} createScriptURL               [description]
	 */
	createPolicy(name, { createHTML, createScript, createScriptURL } = {}) {
		const policy = new TrustedTypePolicy(name, { createHTML, createScript, createScriptURL }, { key: symbols.trustedKey });
		this.dispatchEvent(new BeforeCreatePolicyEvent('beforecreatepolicy', { policy, key: symbols.trustedKey }));

		if (! name.toString().match(/^[-#a-zA-Z0-9=_/@.%]+$/g)) {
			throw new TypeError(`Failed to execute 'createPolicy' on 'TrustedTypePolicyFactory': Policy: "${name}" contains invalid characters.`);
		} else if (TrustedTypePolicyFactory.hasOwnProperty(symbols.trustedTypesCSP)) {
			// This requires `fetch()` and parsing response headers, so will not be immediately available
			const { policies, allowDuplicates, hasNone } = TrustedTypePolicyFactory[symbols.trustedTypesCSP];

			// Will always allow `empty#html` and `empty#script`
			if (hasNone && name !== 'empty#html' && name !== 'empty#script') {
				throw new TypeError(`Failed to execute 'createPolicy' on 'TrustedTypePolicyFactory': Policy: "${name}" disallowed.`);
			} else if (! policies.has(name)) {
				throw new TypeError(`Failed to execute 'createPolicy' on 'TrustedTypePolicyFactory': Policy: "${name}" disallowed.`);
			} else if(! allowDuplicates && hasPolicy(name)) {
				throw new TypeError(`Failed to execute 'createPolicy' on 'TrustedTypePolicyFactory': Policy: "${name}" already exists.`);
			}
		} else {
			// This is the fallback for before CSP headers are fetched and uses `document.documentElement.dataset`
			if (allowedPolicies.size > 2 && ! allowedPolicies.has(name)) {
				throw new TypeError(`Failed to execute 'createPolicy' on 'TrustedTypePolicyFactory': Policy: "${name}" disallowed.`);
			} else if(! allowDuplicates && hasPolicy(name)) {
				throw new TypeError(`Failed to execute 'createPolicy' on 'TrustedTypePolicyFactory': Policy: "${name}" already exists.`);
			}
		}

		if (policy.name === 'default') {
			this[symbols.defaultPolicy] = policy;
		}

		policies.push(policy);

		return policy;
	}

	/**
	 * [getAttributeType description]
	 * @param  {String} tagName                 [description]
	 * @param  {String} attribute               [description]
	 * @param  {String} elementNs               [description]
	 * @return {String}           [description]
	 */
	getAttributeType(tagName, attribute, elementNs/*, attrNs*/) {
		tagName = tagName.toLowerCase();
		attribute = attribute.toLowerCase();

		/**
		 * @Todo handle namespaced attributes
		 */
		if (typeof elementNS === 'string' && elementNs.length !== 0) {
			return events.includes(attribute) ? 'TrustedScript' : null;
		}

		/**
		 * This is an `on*` attribute
		 */
		if (events.includes(attribute)) {
			return 'TrustedScript';
		}

		switch(tagName) {
			case 'script': {
				if (attribute === 'src') {
					return 'TrustedScriptURL';
				} else {
					return null;
				}
			}

			case 'iframe': {
				if (attribute === 'srcdoc') {
					return 'TrustedHTML';
				} else if (attribute === 'src') {
					return 'TrustedScriptURL';
				} else {
					return null;
				}
			}

			default:
				return null;
		}
	}

	/**
	 * [getPropertyType description]
	 * @param  {String} tagName                [description]
	 * @param  {String} property               [description]
	 * @return {String}          [description]
	 */
	getPropertyType(tagName, property/*, elementNS*/) {
		tagName = tagName.toLowerCase();

		if (events.includes(property.toLowerCase())) {
			return 'TrustedScript';
		}

		switch(tagName) {
			case 'embed':
			case 'iframe': {
				if (property === 'src') {
					return 'TrustedScriptURL';
				} else {
					return null;
				}
			}

			case 'script': {
				if (property === 'src') {
					return 'TrustedScriptURL';
				} else if (['text', 'innerText', 'textContent', 'innerHTML'].includes(property)) {
					return 'TrustedScript';
				} else if (['outerHTML'].includes(property)) {
					return 'TrustedHTML';
				} else {
					return null;
				}
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
		return this[symbols.emptyHTML].createHTML('');
	}

	/**
	 * [emptyScript description]
	 * @return {TrustedScript}
	 */
	get emptyScript() {
		return this[symbols.emptyScript].createScript('');
	}

	/**
	 * [defaultPolicy description]
	 * @return {TrustedTypePolicy} [description]
	 */
	get defaultPolicy() {
		return this[symbols.defaultPolicy];
	}

	/**
	 * For consistency with existing polyfill
	 * @return {Boolean} [description]
	 */
	get _isPolyfill_() {
		return true;
	}

	static get allowDuplicates() {
		return allowDuplicates;
	}
}

/**
 * [trustedTypes description]
 * @type {TrustedTypeFactory}
 */
export const trustedTypes = new TrustedTypePolicyFactory(symbols.trustedKey);

/**
 * [polyfill description]
 * @return {[type]}                       [description]
 */
export function polyfill() {
	if (! ('TrustedTypePolicyFactory' in globalThis)) {
		globalThis.TrustedTypePolicyFactory = TrustedTypePolicyFactory;
	}

	if (! ('TrustedTypePolicy' in globalThis)) {
		globalThis.TrustedTypePolicy = TrustedTypePolicy;
	}

	if (! ('TrustedType' in globalThis)) {
		globalThis.TrustedType = TrustedType;
	}

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
	} else {
		try {
			/**
			 * Create these policies even if not needed to prevent
			 * their use elsewhere. Not creating them but allowing them via CSP
			 * would allow creating them as arbitrary policies.
			 * @type {[type]}
			 */
			globalThis.trustedTypes.createPolicy('empty#html', { createHTML: () => '' });
			globalThis.trustedTypes.createPolicy('empty#script', { createScript: () => '' });
		} catch(err) {
			console.error(err);
		}
	}
}

export const trustPolicies = [...allowedPolicies];
