import {
	isHTML, isScript, isScriptURL, supported, hasDefaultPolicy, createHTML,
	createScript, createScriptURL,
} from './trust.js';

const policySymbol = Symbol.for('trust-policy');
const nativeSupport = supported();
/**
 * Store `Symbol`s
 * @type {Object}
 */
const methods = {
	element: {
		setAttribute: Symbol('element.setAttribute'),
		// setAttributeNS: Symbol('element.setAttributeNS'),
		setAttributeNode: Symbol('element.setAttributeNode'),
		// setAttributeNodeNS: Symbol('element.setAttributeNodeNS'),
		insertAdjacentHTML: Symbol('element.insertAdjacentHTML'),
	},
	// events: Object.fromEntries(events.map(event => [event, Symbol(`event:${event}`)])),
	document: {
		write: Symbol('document.write'),
		writeln: Symbol('document.writeln'),
	},
	global: {
		eval: Symbol('window.eval'),
	},
	parser: {
		parseFromString: Symbol('parser.parseFromString'),
	},
	location: {
		assign: Symbol('location.assign'),
		replace: Symbol('location.replace'),
	},
};

/**
 * Replaces potentially dangerous DOM methods with ones requiring TrustedTypes
 * If any allowed policies are set, `'empty#html`' & `'empty#script`' are automatically
 * added if missing, as they are neccesary for `trustedTypes.emptyHTML()` and `trustedTypes.emptyScript()`.
 * @param  {Array}   [allowedPolicies=[]]               List of allowed TrustedTypePolicy names
 * @param  {Boolean} [force=false]                      Set to true to enable custom enforcement even when natively supported
 * @return {void}
 * @Todo: Handle new Function()
 * @Todo: Handle location.* setters
 */
export function enforce({ allowedPolicies = [], force = false } = {}) {
	if (force || ! nativeSupport) {
		if (allowedPolicies.length !== 0) {
			/**
			 * Trust `trustedTypes.emptyHTML` (empty#html) & `trustedTypes.emptyScript` (empty#script),
			 */
			['empty#html', 'empty#script'].forEach(policy => {
				if (! allowedPolicies.includes(policy)) {
					allowedPolicies.push(policy);
				}
			});
		}

		allowedPolicies = [...new Set(allowedPolicies)];

		const allowedType = function allowedType(trustedType) {
			return nativeSupport || allowedPolicies.length === 0 || allowedPolicies.includes(trustedType[policySymbol]);
		};

		['innerHTML', 'outerHTML'].forEach(prop => {
			const { get, set } = Object.getOwnPropertyDescriptor(Element.prototype, prop);
			Object.defineProperty(Element.prototype, prop, {
				get: function() {
					return get.call(this);
				},
				set: function(value) {
					if (isHTML(value)) {
						if (allowedType(value)) {
							set.call(this, value.toString());
						} else {
							throw new TypeError('Untrusted HTML');
						}
					} else if (hasDefaultPolicy()) {
						set.call(this, createHTML(value).toString());
					} else {
						throw new TypeError('Untrusted HTML');
					}
				}
			});
		});

		['text', 'innerText'].forEach(prop => {
			if (Object.hasOwn(HTMLScriptElement.prototype, prop)) {
				const { get, set } = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, prop);

				Object.defineProperty(HTMLScriptElement.prototype, prop, {
					get: function() {
						return get.call(this);
					},
					set: function(value) {
						if (isScript(value)) {
							if (allowedType(value)) {
								set.call(this, value.toString());
							} else {
								throw new TypeError('Untrusted script');
							}
						} else if (hasDefaultPolicy()) {
							set.call(this, createHTML(value).toString());
						} else {
							throw new TypeError('Untrusted script');
						}
					}
				});
			}
		});

		['href', 'origin'].forEach(prop => {
			if (prop in Location.prototype) {
				const { get, set } = Object.getOwnPropertyDescriptor(Location.prototype, prop);

				Object.defineProperty(Location.prototype, prop, {
					enumerable: true,
					configurable: false,
					writable: false,
					get: function() {
						return get.call(this);
					},
					set: function(value) {
						if (isScriptURL(value) && ! value.toString().startsWith('javascript:')) {
							if (allowedType(value)) {
								set.call(this, value.toString());
							} else {
								throw new TypeError('Untrusted URL');
							}
						} else if (hasDefaultPolicy()) {
							set.call(this, createScriptURL(value).toString());
						} else {
							throw new TypeError('Untrusted URL');
						}
					}
				});
			}
		});

		Object.entries(methods.location).forEach(([name, symbol]) => {
			if (Location.prototype[name] instanceof Function) {
				Object.defineProperty(Location.prototype, symbol, {
					enumerable: false,
					configurable: false,
					writable: false,
					value: Location.prototype[name],
				});

				Location.prototype[name] = function(value) {
					if (isScriptURL(value)) {
						if (allowedType(value)) {
							return Location.prototype[symbol].call(this, value.toString());
						} else {
							throw new TypeError('Untrusted URL');
						}
					} else if (hasDefaultPolicy()) {
						return Location.prototype[symbol].call(this, createScriptURL(value).toString());
					} else {
						throw new TypeError('Untrusted URL');
					}
				};
			}
		});

		Object.entries(methods.parser).forEach(([name, symbol]) => {
			DOMParser.prototype[symbol] = DOMParser.prototype[name];
			delete DOMParser.prototype[name];
		});

		Object.entries(methods.element).forEach(([name, symbol]) => {
			if (Element.prototype[name] instanceof Function) {
				Object.defineProperty(Element.prototype, symbol, {
					enumerable: false,
					configurable: false,
					writable: false,
					value: Element.prototype[name],
				});

				delete Element.prototype[name];
			}
		});

		Object.entries(methods.document).forEach(([name, symbol]) => {
			if (Document.prototype[name] instanceof Function) {
				Object.defineProperty(Document.prototype, symbol, {
					enumerable: false,
					configurable: false,
					writable: false,
					value: Document.prototype[name],
				});

				delete Document.prototype[name];
			}
		});

		Object.entries(methods.global).forEach(([name, symbol]) => {
			if (globalThis[name] instanceof Function) {
				Object.defineProperty(globalThis, symbol, {
					enumerable: false,
					configurable: false,
					writable: false,
					value: globalThis[name],
				});

				delete globalThis[name];
			}
		});

		Object.defineProperty(HTMLScriptElement.prototype, 'src', {
			enumerable: true,
			configurable: false,
			get: function() {
				return new URL(this.getAttribute('src'), document.baseURI).href;
			},
			set: function(value) {
				if (isScriptURL(value)) {
					if (allowedType(value)) {
						this.setAttribute('src', value.toString());
					} else {
						throw new TypeError('Untrusted script URL');
					}
				} else if (hasDefaultPolicy()) {
					this.setAttribute('src', createScriptURL(value).toString());
				} else {
					throw new TypeError('Untrusted script URL');
				}
			}
		});

		Object.defineProperty(HTMLIFrameElement.prototype, 'srcdoc', {
			get: function() {
				return this.getAttribute('srcdoc');
			},
			set: function(value) {
				if (isHTML(value)) {
					if (allowedType(value)) {
						this.setAttribute('srcdoc', value.toString());
					} else {
						throw new TypeError('Untrusted HTML');
					}
				} else if (hasDefaultPolicy()) {
					this.setAttribute('srcdoc', createHTML(value).toString());
				} else {
					throw new TypeError('Untrusted HTML');
				}
			}
		});

		DOMParser.prototype.parseFromString = function(value, type) {
			if (['text/html', 'application/xhtml+xml'].includes(type)) {
				if (isHTML(value)) {
					if (allowedType(value)) {
						return this[methods.parser.parseFromString].call(this, value.toString(), type);
					} else {
						throw new TypeError('Untrusted HTML');
					}
				} else if (hasDefaultPolicy()) {
					return this[methods.parser.parseFromString].call(this, createHTML(value).toString(), type);
				} else {
					throw new TypeError('Untrusted HTML');
				}
			} else {
				return this[methods.parser.parseFromString].call(this, value, type);
			}
		};

		Document.prototype.write = function(value) {
			if (isHTML(value)) {
				if (allowedType(value)) {
					return this[methods.document.write].call(this, value.toString());
				} else {
					throw new TypeError('Untrusted HTML');
				}
			} else if (hasDefaultPolicy()) {
				return this[methods.document.writeln].call(this, createHTML(value).toString());
			} else {
				throw new TypeError('Untrusted HTML');
			}
		};

		Document.prototype.writeln = function(value) {
			if (isHTML(value)) {
				if (allowedType(value)) {
					return this[methods.document.writeln].call(this, value.toString());
				} else {
					throw new TypeError('Untrusted HTML');
				}
			} else if (hasDefaultPolicy()) {
				return this[methods.document.writeln].call(this, createHTML(value).toString());
			} else {
				throw new TypeError('Untrusted HTML');
			}
		};

		globalThis.eval = function(value) {
			if (isScript(value)) {
				if (allowedType(value)) {
					return this[methods.global.eval].call(this, value.toString());
				} else {
					throw new TypeError('Untrusted script');
				}
			} else if (hasDefaultPolicy()) {
				return this[methods.global.eval].call(this, createScript(value).toString());
			} else {
				throw new TypeError('Untrusted script');
			}
		};

		Element.prototype.insertAdjacentHTML = function(position, value) {
			if (isHTML(value)) {
				if (allowedType(value)) {
					return this[methods.element.insertAdjacentHTML].call(this, position, value.toString());
				} else {
					throw new TypeError('Untrusted HTML');
				}
			} else if (hasDefaultPolicy()) {
				return this[methods.element.insertAdjacentHTML].call(this, position, createHTML(value).toString());
			} else {
				throw new TypeError('Untrusted HTML');
			}
		};

		Element.prototype.setAttribute = function(name, value) {
			switch(globalThis.trustedTypes.getAttributeType(this.tagName, name)) {
				case globalThis.TrustedHTML.name: {
					if (isHTML(value)) {
						if (allowedType(value)) {
							return this[methods.element.setAttribute].call(this, name, value.toString());
						} else {
							throw new TypeError('Untrusted HTML');
						}
					} else if (hasDefaultPolicy()) {
						return this[methods.element.setAttribute].call(this, name, createHTML(value).toString());
					} else {
						throw new DOMException('Untrusted HTML');
					}
				}

				case globalThis.TrustedScript.name: {
					if (isScript(value)) {
						if (allowedType(value)) {
							return this[methods.element.setAttribute].call(this, name, value.toString());
						} else {
							throw new TypeError('Untrusted script');
						}
					} else if (hasDefaultPolicy()) {
						return this[methods.element.setAttribute].call(this, name, createScript(value).toString());
					} else {
						throw new DOMException('Untrusted script');
					}
				}

				case globalThis.TrustedScriptURL.name: {
					if (isScriptURL(value)) {
						if (allowedType(value)) {
							return this[methods.element.setAttribute].call(this, name, value.toString());
						} else {
							throw new TypeError('Untrusted script URL');
						}
					} else if (hasDefaultPolicy()) {
						return this[methods.element.setAttribute].call(this, name, createScriptURL(value).toString());
					} else {
						throw new DOMException('Untrusted script URL');
					}
				}

				default: {
					this[methods.element.setAttribute].call(this, name, value.toString());
				}
			}
		};

		Element.prototype.setAttributeNode = function(attribute) {
			this.setAttribute(attribute.name, attribute.value);
		};
	}
}
