export class TextEncoder {
	get encoding() {
		return 'utf-8';
	}

	encode(str) {
		// Identical to char up to 127, then [194, (n)] for n=(128-191),
		// then [194, (128-191)] for n=(192-255)
		// and it looks like this holds in intervals of 64
		return new Uint8Array(str.split('').flatMap(char => {
			const code = char.charCodeAt(0);

			if (code < 128) {
				return [code];
			} else {
				const pt = 194 + Math.floor((code - 128) / 64);
				return [pt, (code % 64) + 128];
			}
		}));
	}

	encodeInto(str, ui8arr) {
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
