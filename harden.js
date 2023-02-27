/*eslint strict: ["error", "never"]*/
(function harden() {
	function isStrict() {
		return typeof this === 'undefined';
	}

	function supported() {
		return 'trustedTypes' in globalThis;
	}

	function hasDefaultPolicy() {
		return supported() && ! Object.is(trustedTypes.defaultPolicy, null);
	}

	function isHTML(input) {
		return supported() && trustedTypes.isHTML(input);
	}

	function isScript(input) {
		return supported() && trustedTypes.isScript(input);
	}

	function isScriptURL(input) {
		return supported() && trustedTypes.isScriptURL(input);
	}

	function createHTML(input) {
		if (isHTML(input)) {
			return input;
		} else if (hasDefaultPolicy()) {
			return trustedTypes.defaultPolicy.createHTML(input);
		} else {
			return input;
		}
	}

	function getAttributeType(tag, attr, elementNs) {
		if (supported()) {
			return trustedTypes.getAttributeType(tag, attr, elementNs);
		} else {
			return null;
		}
	}

	function getPropertyType(tag, prop, elementNs) {
		if (supported()) {
			return trustedTypes.getPropertyType(tag, prop, elementNs);
		} else {
			return null;
		}
	}

	function createScript(input) {
		if (isScript(input)) {
			return input;
		} else if (hasDefaultPolicy()) {
			return trustedTypes.defaultPolicy.createScript(input);
		} else {
			return input;
		}
	}

	function createScriptURL(input) {
		if (isScriptURL(input)) {
			return input;
		} else if (hasDefaultPolicy()) {
			return trustedTypes.defaultPolicy.createScriptURL(input);
		} else {
			return input;
		}
	}

	try {
		const { write, writeln } = Object.getOwnPropertyDescriptors(Document.prototype);

		Object.defineProperties(Document.prototype, {
			write: {
				value: function(html) {
					write.value.call(this, createHTML(html));
				},
				enumerable: write.enumerable,
				configurable: write.configurable,
				writable: write.writable,
			},
			writeln: {
				value: function(html) {
					writeln.value.call(this, createHTML(html));
				},
				enumerable: writeln.enumerable,
				configurable: writeln.configurable,
				writable: writeln.writable,
			}
		});
	} catch(err) {
		console.error(err);
	}

	try {
		const { parseFromString } = Object.getOwnPropertyDescriptors(DOMParser.prototype);

		Object.defineProperties(DOMParser.prototype, {
			parseFromString: {
				value: function(text, type) {
					if (type === 'text/html') {
						return parseFromString.value.call(this, createHTML(text), type);
					} else {
						return parseFromString.value.call(this, text, type);
					}
				},
				enumerable: parseFromString.enumerable,
				configurable: parseFromString.configurable,
				writable: parseFromString.writable,
			}
		});
	} catch(err) {
		console.error(err);
	}

	try {
		const { src, text } = Object.getOwnPropertyDescriptors(HTMLScriptElement.prototype);

		Object.defineProperties(HTMLScriptElement.prototype, {
			text: {
				get: function() {
					return text.get.call(this);
				},
				set: function(value) {
					text.set.call(this, createScript(value));
				},
				enumerable: text.enumerable,
				configurable: text.configurable,
			},
			src: {
				get: function() {
					return src.get.call(this);
				},
				set: function(value) {
					src.set.call(this, createScriptURL(value));
				},
				enumerable: src.enumerable,
				configurable: src.configurable,
			}
		});
	} catch(err) {
		console.error(err);
	}

	try {
		const { setAttribute, setAttributeNS, innerHTML, outerHTML } = Object.getOwnPropertyDescriptors(Element.prototype);

		Object.defineProperties(Element.prototype, {
			setAttribute: {
				value: function(name, value) {
					switch(getAttributeType(this.tagName, name)) {
						case 'TrustedHTML':
							setAttribute.value.call(this, name, createHTML(value));
							break;

						case 'TrustedScript':
							setAttribute.value.call(this, name, createScript(value));
							break;

						case 'TrustedScriptURL':
							setAttribute.value.call(this, name, createScriptURL(value));
							break;

						default:
							setAttribute.value.call(this, name, value);
					}
				},
				enumerable: setAttribute.enumerable,
				configurable: setAttribute.configurable,
			},
			setAttributeNS: {
				value: function (elementNs, name, value) {
					switch(getAttributeType(this.tagName, name, elementNs)) {
						case 'TrustedHTML':
							setAttributeNS.value.call(this, elementNs, name, createHTML(value));
							break;

						case 'TrustedScript':
							setAttributeNS.value.call(this, elementNs, name, createScript(value));
							break;

						case 'TrustedScriptURL':
							setAttributeNS.value.call(this, elementNs, name, createScriptURL(value));
							break;

						default:
							setAttributeNS.value.call(this, elementNs, name, value);
					}
				},
				enumerable: setAttributeNS.enumerable,
				configurable: setAttributeNS.configurable,
			},
			innerHTML: {
				get: function() {
					return innerHTML.get.call(this);
				},
				set: function(value) {
					innerHTML.set.call(this, createHTML(value));
				},
				enumerable: innerHTML.enumerable,
				configurable: innerHTML.configurable,
			},
			outerHTML: {
				get: function() {
					return outerHTML.get.call(this);
				},
				set: function(value) {
					outerHTML.set.call(this, createHTML(value));
				},
				enumerable: outerHTML.enumerable,
				configurable: outerHTML.configurable,
			}
		});
	} catch(err) {
		console.error(err);
	}

	try {
		const { srcdoc } = Object.getOwnPropertyDescriptors(HTMLIFrameElement.prototype);

		Object.defineProperties(HTMLIFrameElement.prototype, {
			srcdoc: {
				get: function() {
					return srcdoc.get.call(this);
				},
				set: function(value) {
					srcdoc.set.call(this, createHTML(value));
				},
				enumerable: srcdoc.enumerable,
				configurable: srcdoc.configurable,
			}
		});
	} catch(err) {
		console.error(err);
	}

	if (! isStrict()) {
		try {
			const { eval } = globalThis;
			globalThis.eval = function(input) {
				return eval.call(this, createScript(input).toString());
			}
		} catch(err) {
			console.error(err);
		}
	}
})();