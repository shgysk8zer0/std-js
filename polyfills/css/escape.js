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
