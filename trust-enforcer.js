/**
 * @Todo: Handle Element.prototype.innerHTML & ELement.prototype.outerHTML
 * @Todo: HAndle HTMLScriptElement.prototype.text & HTMLScriptElement.prototype.textContent
 * @Todo: Handle new Function()
 */
import { isHTML, isScript, isScriptURL } from './trust.js';
/**
 * Store `Symbol`s
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
	parser: {
		parseFromString: Symbol('parser.parseFromString'),
	}
};

/**
 * WIP to enforce TrustedTypePolicy.
 * Replaces potentially dangerous DOM methods with ones requiring TrustedTypes
 */
export function enforce() {
	Object.entries(aliases.element).forEach(([name, symbol]) => {
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

	Object.entries(aliases.document).forEach(([name, symbol]) => {
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

	Object.entries(aliases.global).forEach(([name, symbol]) => {
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
				this.setAttribute('src', value);
			} else {
				throw new TypeError('Untrusted script src');
			}
		}
	});

	Object.defineProperty(HTMLIFrameElement.prototype, 'srcdoc', {
		get: function() {
			return this.getAttribute('srcdoc');
		},
		set: function(value) {
			if (isHTML(value)) {
				this.setAttribute('srcdoc', value);
			} else {
				throw new TypeError('Untrusted HTML');
			}
		}
	});

	Object.entries(aliases.parser).forEach(([name, symbol]) => {
		DOMParser.prototype[symbol] = DOMParser.prototype[name];
		delete DOMParser.prototype[name];
	});

	DOMParser.prototype.parseFromString = function(input, type) {
		if (['text/html', 'application/xhtml+xml'].includes(type)) {
			if (isHTML(input)) {
				return this[aliases.parser.parseFromString].call(this, input.toString(), type);
			} else {
				throw new TypeError('Untrusted HTML');
			}
		} else {
			return this[aliases.parser.parseFromString].call(this, input, type);
		}
	};

	Document.prototype.write = function(text) {
		if (isHTML(text)) {
			this[aliases.document.write].call(this, text.toString());
		} else {
			throw new TypeError('Untrusted HTML');
		}
	};

	Document.prototype.writeln = function(line) {
		if (isHTML(line)) {
			this[aliases.document.writeln].call(this, line.toString());
		} else {
			throw new TypeError('Untrusted HTML');
		}
	};

	globalThis.eval = function(code) {
		if (isScript(code)) {
			globalThis[aliases.global.eval].call(this, code.toString());
		} else {
			throw new TypeError('Untrusted script');
		}
	};

	Element.prototype.insertAdjacentHTML = function(position, text) {
		if (isHTML(text)) {
			this[aliases.element.insertAdjacentHTML].call(this, position, text.toString());
		} else {
			throw new TypeError('Untrusted HTML');
		}
	};

	Element.prototype.setAttribute = function(name, value) {
		switch(trustedTypes.getAttributeType(this.tagName, name)) {
			case TrustedHTML.name: {
				if (isHTML(value)) {
					this[aliases.element.setAttribute].call(this, name, value.toString());
				} else {
					throw new DOMException('Untrusted HTML');
				}

				break;
			}

			case TrustedScript.name: {
				if (isScript(value)) {
					this[aliases.element.setAttribute].call(this, name, value.toString());
				} else {
					throw new DOMException('Untrusted script');
				}

				break;
			}

			case TrustedScriptURL.name: {
				if (isScriptURL(value)) {
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
				if (isHTML(attribute.value)) {
					return this[aliases.element.setAttributeNode].call(this, attribute);
				} else {
					throw new DOMException('Untrusted HTML');
				}
			}

			case TrustedScript.name: {
				if (isScript(attribute.value)) {
					return this[aliases.element.setAttributeNode].call(this, attribute);
				} else {
					throw new DOMException('Untrusted script');
				}
			}

			case TrustedScriptURL.name: {
				if (isScriptURL(attribute.value)) {
					return this[aliases.element.setAttributeNode].call(this, attribute);
				} else {
					throw new DOMException('Untrusted script url');
				}
			}

			default:
				return this[aliases.element.setAttributeNode].call(this, attribute);
		}
	};

	Element.prototype.setAttributeNS = function(namespace, name, value) {
		switch(trustedTypes.getAttributeType(this.tagName, name, namespace)) {
			case TrustedHTML.name: {
				if (isHTML(value)) {
					return this[aliases.element.setAttributeNS].call(this, namespace, name, value.toString());
				} else {
					throw new DOMException('Untrusted HTML');
				}
			}

			case TrustedScript.name: {
				if (isScript(value)) {
					return this[aliases.setAttributeNS].call(this, namespace, name, value.toString());
				} else {
					throw new DOMException('Untrusted script');
				}
			}

			case TrustedScriptURL.name: {
				if (isScriptURL(value)) {
					return this[aliases.element.setAttributeNS].call(this, namespace, name, value.toString());
				} else {
					throw new DOMException('Untrusted script url');
				}
			}

			default:
				return this[aliases.element.setAttributeNS].call(this, namespace, name, value.toString());
		}
	};

	Element.prototype.setAttributeNodeNS = function(attribute) {
		switch(trustedTypes.getAttributeType(this.tagName, attribute.localName, attribute.prefix)) {
			case TrustedHTML.name: {
				if (isHTML(attribute.value)) {
					return this[aliases.element.setAttributeNodeNS].call(this, attribute);
				} else {
					throw new DOMException('Untrusted HTML');
				}
			}

			case TrustedScript.name: {
				if (isScript(attribute.value)) {
					return this[aliases.element.setAttributeNodeNS].call(this, attribute);
				} else {
					throw new DOMException('Untrusted script');
				}
			}

			case TrustedScriptURL.name: {
				if (isScriptURL(attribute.value)) {
					return this[aliases.element.setAttributeNodeNS].call(this, attribute);
				} else {
					throw new DOMException('Untrusted script url');
				}
			}

			default:
				return this[aliases.element.setAttributeNodeNS].call(this, attribute);
		}
	};
}
