import { SHA_512, SHA_384, SHA_256, SHA_1, bufferToHex, hexToBuffer } from './hash.js';
export const ALGOS = [SHA_512, SHA_384, SHA_256, SHA_1];
export const DEFAULT_ALGO = SHA_512;

const symbols = {
	key: Symbol('key'),
	encoder: Symbol('encoder'),
	algorithm: Symbol('algorithm'),
};

export class HMAC {
	constructor(password, { algorithm = DEFAULT_ALGO } = {}) {
		const encoder = new TextEncoder();
		Object.defineProperties(this, {
			[symbols.algorithm]: {
				configurable: false,
				enumerable: false,
				writable: false,
				value: algorithm,
			},
			[symbols.encoder]: {
				configurable: false,
				enumerable: false,
				writable: false,
				value: encoder,
			},
			[symbols.key]: {
				configurable: false,
				enumerable: false,
				writable: false,
				value: HMAC.generateKey(password, { algorithm, encoder }),
			},
		});
	}

	get algorithm() {
		return this[symbols.algorithm];
	}

	get encoding() {
		return this[symbols.encoder].encoding;
	}

	async sign(data) {
		if (! (data instanceof ArrayBuffer)) {
			throw new TypeError('`sign()` accepts an ArrayBuffer');
		} else {
				const key = await this[symbols.key];
				const buffer = await crypto.subtle.sign({ name: key.algorithm.name }, key, data);
				return bufferToHex(buffer);
		}
	}

	async signText(str) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected a string');
		} else {
			return this.sign(this[symbols.encoder].encode(str).buffer);
		}
	}

	async signFile(file) {
		if (! (file instanceof File)) {
			throw new TypeError('Expected a file');
		} else {
			return this.sign(await file.arrayBuffer());
		}
	}

	async verify(data, signature) {
		if (typeof signature !== 'string') {
			throw new DOMException('Missing signture to verify');
		} else if (! (data instanceof ArrayBuffer)) {
			throw new TypeError('`verify()` requires an ArrayBuffer and hex signature');
		} else {
			const key = await this[symbols.key];
			return await crypto.subtle.verify({ name: key.algorithm.name }, key, hexToBuffer(signature), data);
		}
	}

	async verifyText(str, signature) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected a string');
		} else {
			return this.verify(this[symbols.encoder].encode(str).buffer, signature);
		}
	}

	async verifyFile(file, signature) {
		if (! (file instanceof File)) {
			throw new TypeError('Expected a file');
		} else {
			return this.verify(await file.arrayBuffer(), signature);
		}
	}

	static async generateKey(password, { algorithm: hash = DEFAULT_ALGO, encoder = new TextEncoder() } = {}) {
		return await crypto.subtle.importKey(
			'raw',
			encoder.encode(password),
			{ name: 'HMAC', hash },
			true,
			['sign', 'verify']
		);
	}
}
