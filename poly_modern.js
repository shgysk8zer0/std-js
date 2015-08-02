if (typeof Object.create != 'function') {
	Object.create = (function() {
		function Temp() {}
		var hasOwn = Object.prototype.hasOwnProperty;
		return function (O) {
			if (typeof O != 'object') {
				throw TypeError('Object prototype may only be an Object or null');
			}
			Temp.prototype = O;
			var obj = new Temp();
			Temp.prototype = null;
			if (arguments.length > 1) {
				var Properties = Object(arguments[1]);
				for (var prop in Properties) {
					if (hasOwn.call(Properties, prop)) {
						obj[prop] = Properties[prop];
					}
				}
			}
			return obj;
		};
	})();
}
if (!('Element' in window)) {
	/*Fix IE not allowing Element.prototype*/
	window.Element = function () {};
	Element.prototype = Object.create(Object.prototype);
}
if (!('CSS' in window)) {
	window.CSS = {};
	CSS.prototype = object.create(Object.prototype);
}
if (!('show' in Element.prototype)) {
	Element.prototype.show = function() {
		'use strict';
		this.setAttribute('open', '');
	};
}
if (!('showModal' in Element.prototype)) {
	Element.prototype.showModal = function() {
		var backdrop = document.createElement('div');
		backdrop.classList.add('backdrop');
		$('dialog[open]').each(function(dialog) {
			dialog.close();
		});
		this.after(backdrop);
		this.classList.add('modal');
		this.show();
	};
}
if (!('close' in Element.prototype)) {
	Element.prototype.close = function() {
		this.removeAttribute('open');
		this.classList.remove('modal');
		if (this.nextElementSibling.classList.contains('backdrop')) {
			this.nextElementSibling.parentElement.removeChild(this.nextElementSibling);
		}
	};
}
if (!('HTMLimport' in Element.prototype)) {
	Element.prototype.HTMLimport = function() {
		if (supports('HTMLimports')) {
			var imported = document.querySelector(
				'link[rel=import][name="' + this.dataset.import + '"]'
			);

			if (this.hasAttribute('data-selector')) {
				this.appendChild(imported.import.querySelector(this.dataset.selector));
			} else {
				this.appendChild(imported.import.body.firstChild);
			}
		}
	};
}
if (!('matches' in Element.prototype)) {
	/*Check if Element matches a given CSS selector*/
	if ('mozMatchesSelector' in Element.prototype) {
		Element.prototype.matches = Element.prototype.mozMatchesSelector;
	} else if ('webkitMatchesSelector' in Element.prototype) {
		Element.prototype.matches = Element.prototype.webkitMatchesSelector;
	} else if ('oMatchesSelector' in Element.prototype) {
		Element.prototype.matches = Element.prototype.oMatchesSelector;
	} else if ('msMatchesSelector' in Element.prototype) {
		Element.prototype.matches = Element.prototype.msMatchesSelector;
	} else {
		Element.prototype.matches = function (selector) {
			var element = this;
			var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
			var i = 0;
			while (matches[i] && matches[i] !== element) {
				i++;
			}
			return matches[i] ? true : false;
		};
	}
}
if(!('closest' in Element.prototype)) {
	Element.prototype.closest = function(selector) {
		if (this.parentElement.matches(selector)) {
			return this.parentElement;
		} else if (this === document.body) {
			return null;
		} else {
			return this.parentElement.closest(selector);
		}
	};
}
if(!('remove' in Element.prototype)) {
	Element.prototype.remove = function() {
		this.parentElement.removeChild(this);
	};
}
if (!('includes' in String.prototype)) {
	String.prototype.includes = function() {
		return String.prototype.indexOf.apply(this, arguments) !== -1;
	};
}
if (!('startsWith' in String.prototype)) {
	Object.defineProperty(String.prototype, 'startsWith', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function (searchString, position) {
			position = position || 0;
			return this.lastIndexOf(searchString, position) === position;
		}
	});
}
if (!('endsWith' in String.prototype)) {
	Object.defineProperty(String.prototype, 'endsWith', {
		value: function (searchString, position) {
			var subjectString = this.toString();
			if (position === undefined || position > subjectString.length) {
				position = subjectString.length;
			}
			position -= searchString.length;
			var lastIndex = subjectString.indexOf(searchString, position);
			return lastIndex !== -1 && lastIndex === position;
		}
	});
}
if (!('supports' in CSS)) {
	CSS.supports = function (prop, value) {
		var el = document.createElement('div');
		el.style = prop + ':' + value;
		return (getComputedStyle(el)[prop] === value);
	};
}
(function(root) {
	var CSS = root.CSS;
	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = Object.create(Error.prototype);
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';
	if (!('escape' in CSS)) {
		CSS.escape = function(value) {
			var string = String(value), length = string.length, index = -1, codeUnit, result = '', firstCodeUnit = string.charCodeAt(0);
			while (++index < length) {
				codeUnit = string.charCodeAt(index);
				if (codeUnit == 0x0000) {
					throw new InvalidCharacterError('Invalid character: the input contains U+0000.');
				}
				if (
					(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
					(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
					(
						index == 1 &&
						codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
						firstCodeUnit == 0x002D
					)
				) {
					result += '\\' + codeUnit.toString(16) + ' ';
					continue;
				}
				if (
					codeUnit >= 0x0080 ||
					codeUnit == 0x002D ||
					codeUnit == 0x005F ||
					codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
					codeUnit >= 0x0041 && codeUnit <= 0x005A ||
					codeUnit >= 0x0061 && codeUnit <= 0x007A
				) {
					result += string.charAt(index);
					continue;
				}
				result += '\\' + string.charAt(index);
			}
			return result;
		};
	}
}(typeof global !== 'undefined' ? global : this));
