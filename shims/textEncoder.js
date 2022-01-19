import { TextEncoder } from '../TextEncoder.js';
import { TextDecoder } from '../TextDecoder.js';

if (! ('TextEncoder' in globalThis)) {
	globalThis.TextEncoder = TextEncoder;
}

if (! ('TextDecoder' in globalThis)) {
	globalThis.TextDecoder = TextDecoder;
}

if (! (globalThis.TextEncoder.prototype.encodeInto instanceof Function)) {
	globalThis.TextEncoder.prototype.encodeInto = function(...args) {
		return TextEncoder.prototype.encodeInto.apply(this, args);
	};
}
