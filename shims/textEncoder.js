import { TextEncoder } from '../TextEncoder.js';
import { TextDecoder } from '../TextDecoder.js';

if (! ('TextEncoder' in globalThis)) {
	globalThis.TextEncoder = TextEncoder;
}

if (! ('TextDecoder' in globalThis)) {
	globalThis.TextDecoder = TextDecoder;
}

if (! (globalThis.TextEncoder.prototype.encodeInto instanceof Function)) {
	globalThis.TextEncoder.prototype.encodeInto = function(str, ui8arr) {
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
	};
}
