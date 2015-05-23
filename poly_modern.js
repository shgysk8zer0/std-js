if (! 'Element' in window) {
	/*Fix IE not allowing Element.prototype*/
	Element = function () {};
}
if (! 'CSS' in window) {
	CSS = {};
}
(function(root) {
	if(! 'show' in Element.prototype) {
		Element.prototype.show = function() {
			this.setAttribute('open', '');
		};
	}
	if(! 'showModal' in Element.prototype) {
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
	if(! 'close' in Element.prototype) {
		Element.prototype.close = function() {
			this.removeAttribute('open');
			this.classList.remove('modal');
			if(this.nextElementSibling.classList.contains('backdrop')) {
				this.nextElementSibling.parentElement.removeChild(this.nextElementSibling);
			}
		};
	}
	if (! 'HTMLimport' in Element.prototype) {
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
	if (! 'matches' in Element.prototype) {
		/*Check if Element matches a given CSS selector*/
		Element.prototype.matches = function (sel) {
			try {
				if ('mozMatchesSelector' in Element.prototype) {
					return this.mozMatchesSelector(sel);
				} else if ('webkitMatchesSelector' in Element.prototype) {
					return this.webkitMatchesSelector(sel);
				} else if ('oMatchesSelector' in Element.prototype) {
					return this.oMatchesSelector(sel);
				} else if ('msMatchesSelector' in Element.prototype) {
					return this.msMatchesSelector(sel);
				} else {
					return ($(sel) .indexOf(this) !== -1);
				}
			} catch(e) {
				return ($(sel) .indexOf(this) !== -1);
			}
		};
	}
	if (! 'contains' in String.prototype) {
		String.prototype.contains = function() {
			return String.prototype.indexOf.apply( this, arguments ) !== -1;
		};
	}
	if (! 'startsWith' in String.prototype) {
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
	if (! 'endsWith' in String.prototype) {
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
	var CSS = ('CSS' in root) ? root.CSS : {};
	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';
	if(! 'supports' in CSS) {
		CSS.supports = function (prop, value) {
			var el = document.createElement('div');
			el.style = prop + ":" + value;
			return (getComputedStyle(el)[prop] === value);
		};
	}
	if (! 'escape' in CSS) {
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
