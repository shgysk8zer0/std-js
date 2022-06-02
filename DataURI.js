const protectedData = new WeakMap();
const supportedEncodings = ['utf8', 'base64'];

export class DataURI {
	constructor(content, { encoding = 'utf8', contentType = 'text/plain' } = {}) {
		if (typeof content !== 'string') {
			throw new TypeError('Content must be a string');
		} else if (! supportedEncodings.includes(encoding)) {
			throw new TypeError(`Invalid encoding: ${encoding}`);
		} else if (! (typeof contentType === 'string' && contentType.includes('/'))) {
			throw new TypeError('Invalid Content-Type.');
		} else {
			protectedData.set(this, { content, contentType, encoding });
		}
	}

	get content() {
		return protectedData.get(this).content;
	}

	set content(val) {
		if (typeof val === 'string') {
			protectedData.set(this, { ...protectedData.get(this), content: val });
		} else {
			throw new TypeError('Content must be a string.');
		}
	}

	get contentType() {
		return protectedData.get(this).contentType;
	}

	set contentType(val) {
		if (typeof val === 'string' && val.includes('/')) {
			protectedData.set(this, { ...protectedData.get(this), contentType: val });
		} else {
			throw new TypeError('Content-Type must be a valid string.');
		}
	}

	get encoding() {
		return protectedData.get(this).encoding;
	}

	set encoding(val) {
		if (supportedEncodings.includes(val)) {
			protectedData.set(this, { ...protectedData.get(this), encoding: val });
		} else {
			throw new TypeError('Unsupported encoding.');
		}
	}

	toString() {
		const { content, contentType, encoding } = protectedData.get(this);
		switch(encoding) {
			case 'utf8':
				return `data:${contentType},${encodeURIComponent(content)}`;

			case 'base64':
				return `data:${contentType};base64,${btoa(content)}`;

			default:
				throw new TypeError(`Unsupported Content-Type: ${contentType}`);
		}
	}

	static async fromFile(file, { encoding = 'base64' } = {}) {
		if (! (file instanceof File)) {
			throw new TypeError('Expected a File.');
		} else {
			return new DataURI(await file.text(), { encoding, contentType: file.type });
		}
	}
}
