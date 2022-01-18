/**
 *
 * Array of supported encodings
 * @Todo: At least add utf-16
 * @type {Array}
 */
const supportedEncodings = ['utf-8', 'utf8'];

export const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);

export class TextDecoder {
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
		const { encoding, fatal } = this;
		switch(encoding) {
			case 'utf-8':
			case 'utf8': {
				let prev = NaN;
				// debugger;
				return data.reduce((str, i) => {
					console.log({ i, prev });
					if (i < 128 && Number.isNaN(prev)) {
						return str + String.fromCharCode(i);
					} else if (Number.isNaN(prev)) {
						prev = i;
						return str;
					} else if (i > 127 && ! Number.isNaN(prev)) {
						/**
						* const prev = 194 + Math.floor((i - 128) / 64);
						* return [prev, (code % 64) + 128];
						*/
						const mod = Math.min(0, prev - 194) * 64;
						const char = String.fromCharCode(mod + i + 128);
						const encoded = new TextEncoder().encode(char);
						console.log({ mod, i, char, encoded: `[${encoded.join(', ')}]` });
						prev = NaN;
						return str + char;
					} else if (fatal) {
						throw new DOMException(`Invalid char index: ${i}`)
					}
				}, '');

			}

			default:
				throw new TypeError(`Unsupported encoding '${this.encoding}'`);
		}
	}
};
