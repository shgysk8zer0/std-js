if (! ('TextEncoder' in globalThis)) {
	globalThis.TextEncoder = class TextEncoder {
		get encoding() {
			return 'utf-8';
		}

		encode(str) {
			return new Uint8Array(str.split('').map(char => char.charCodeAt(0)));
		}
	};
}

if (! ('TextDecoder' in globalThis)) {
	/**
	 * Array of supported encodings
	 * @Todo: At least add utf-16
	 * @type {Array}
	 */
	const supportedEncodings = ['utf-8', 'utf8'];

	globalThis.TextDecoder = class TextDecoder {
		constructor(encoding = 'utf-8', { fatal = false, ignoreBOM = false } = {}) {
			if (typeof encoding !== 'string') {
				encoding = encoding.toString().toLowerCase();
			} else {
				encoding = encoding.toLowerCase();
			}

			if (! supportedEncodings.includes(encoding)) {
				throw new RangeError(`TextDecoder constructor: The given encoding '${encoding}' is not supported.`);
			}

			Object.defineProperties(this, {
				encoding: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: encoding,
				},
				fatal: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: fatal,
				},
				ignoreBOM: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: ignoreBOM,
				},
			});
		}

		decode(data) {
			switch(this.encoding) {
				case 'utf-8':
				case 'utf8':
					return String.fromCharCode(...data);

				default:
					throw new TypeError(`Unsupported encoding '${this.encoding}'`);
			}
		}
	};
}

if (! (TextEncoder.prototype.encodeInto instanceof Function)) {
	TextEncoder.prototype.encodeInto = function(str, ui8arr) {
		if (! (ui8arr instanceof Uint8Array)) {
			throw new TypeError('TextEncoder.encodeInto: Argument 2 does not implement interface Uint8Array.');
		} else {
			const encoded = this.encode(str);
			const len = Math.min(ui8arr.length, encoded.length);

			if (encoded.length > ui8arr.length) {
				ui8arr.set(encoded.slice(0, len));
			} else {
				ui8arr.set(encoded);
			}

			return { read: len, written: len };
		}
	}
}
