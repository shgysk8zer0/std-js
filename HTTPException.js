const symbols = { resp: Symbol('resp') };

export class HTTPException extends Error {
	constructor(resp = Resp.error(), { message, cause } = {}) {
		super(
			typeof message === 'string' ? message :`<${resp.url}> [${resp.status} ${resp.statusText}]`,
			{ cause }
		);

		Object.defineProperty(this, symbols.resp, {
			value: resp,
			configurable: false,
			writable: false,
			enumerable: false,
		});
	}

	async json() {
		return await this[symbols.resp].json();
	}

	async text() {
		return await this[symbols.resp].text();
	}

	get body() {
		return this[symbols.resp].body;
	}

	get bodyUsed() {
		return this[symbols.resp].bodyUsed;
	}

	get headers() {
		return this[symbols.resp].headers;
	}

	get ok() {
		return this[symbols.resp].ok;
	}

	get redirected() {
		return this[symbols.resp].redirected;
	}

	get status() {
		return this[symbols.resp].status;
	}

	get statusText() {
		return this[symbols.resp].statusText;
	}

	get type() {
		return this[symbols.resp].type;
	}

	get url() {
		return this[symbols.resp].url;
	}

	toJSON() {
		const { status, statusText, ok, url, message, type, redirected } = this;
		return { status, ok, statusText, url, message, type, redirected };
	}
}
