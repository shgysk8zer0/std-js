import { between } from './math.js';
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
		switch(this.encoding) {
			case 'utf-8':
			case 'utf8': {
				let prev = NaN;
				/**
				 * For (0,127) we just take the charCode
				 * For charCode 128+this will be in the form [n=194+, m=(128-191)]
				 * where n increments after m reaches 191, increments, and rolls back to 128
				 */
				return data.reduce((str, i, n) => {
					if (Number.isNaN(prev) && i < 128) {
						return str + String.fromCharCode(i);
					} else if (Number.isNaN(prev) && i > 193) {
						prev = i;
						return str;
					} else if (prev > 193 && between(128, i, 194)) {
						const offset = (prev - 194) * 64;
						prev = NaN;
						return str + String.fromCharCode(offset + i);
					} else if (this.fatal) {
						throw new RangeError(`Unhandled character at postion ${n}`);
					} else {
						prev = NaN;
						return str;
					}
				}, '');

			}

			default:
				throw new TypeError(`Unsupported encoding '${this.encoding}'`);
		}
	}
};
