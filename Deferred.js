const protectedData = new WeakMap();

function getData(def, key) {
	const data = protectedData.get(def);

	if (typeof key === 'string') {
		return data[key];
	} else {
		return data;
	}
}

function setData(def, data) {
	if (protectedData.has(def)) {
		protectedData.set(def, {...protectedData.get(def), ...data });
	} else {
		protectedData.set(def, data);
	}
}

export class Deferred extends EventTarget {
	constructor(success, fail) {
		super();
		const obj = {};

		obj.promise = new Promise((resolve, reject) => {
			obj.resolve = resolve;
			obj.reject = reject;
		});

		setData(this, obj);

		if (success instanceof Function) {
			this.then(success);
		}

		if (fail instanceof Function) {
			this.catch(fail);
		}
	}

	get fullfilled() {
		return this.state !== 'pending';
	}

	get error() {
		return getData(this, 'error');
	}

	get pending() {
		return this.state === 'pending';
	}

	get promise() {
		switch(this.state) {
			case 'done':
				return Promise.resolve(this.result);

			case 'error':
				return Promise.reject(this.error);

			default:
				return getData(this, 'promise');
		}
	}

	get result() {
		return getData(this, 'result');
	}

	get state() {
		const { result, error } = getData(this);

		if (typeof result !== 'undefined') {
			return 'done';
		} else if (typeof error !== 'undefined') {
			return 'error';
		} else {
			return 'pending';
		}
	}

	get whenFullfilled() {
		if (this.pending) {
			return this.when('statechange').then(() => this);
		} else {
			return Promise.resolve(this);
		}
	}

	resolve(result) {
		if (this.state !== 'pending') {
			throw new DOMException('Already resolved');
		} else if (typeof result === 'undefined') {
			throw new TypeError('Cannot resolve with undefined');
		} else {
			const resolve = getData(this, 'resolve');
			setData(this, { result });
			resolve(result);
			this.dispatchEvent(new CustomEvent('statechange', { detail: 'done' }));
			this.dispatchEvent(new CustomEvent('done', { detail: result }));
		}
	}

	reject(error) {
		if (this.state !== 'pending') {
			throw new DOMException('Already resolved');
		} else if (typeof error === 'undefined') {
			throw new TypeError('Cannot reject with undefined');
		} else {
			const reject = getData(this, 'reject');
			setData(this, { error });
			reject(error);
			this.dispatchEvent(new CustomEvent('statechange', { detail: 'error' }));
			this.dispatchEvent(new CustomEvent('error', { detail: error }));
		}
	}

	async then(success, fail) {
		return this.promise.then(success, fail);
	}

	async catch(fail) {
		return this.promise.catch(fail);
	}

	async finally(callback) {
		return this.promise.finally(callback);
	}

	on(event, callback, opts) {
		this.addEventListener(event, callback, opts);
	}

	off(event, callback, opts) {
		this.removeEventListener(event, callback, opts);
	}

	once(event, callback, { signal } = {}) {
		this.on(event, callback, { once: true, signal });
	}

	async when(event, { signal } = {}) {
		return new Promise(resolve => this.once(event, ({ detail }) => resolve(detail), { signal }));
	}

	static fromPromise(promise) {
		if (! (promise instanceof Promise)) {
			throw new TypeError('Must be a Promise');
		} else {
			const def = new Deferred();
			promise.then(result => def.resolve(result));
			promise.catch(err => def.reject(err));
			return def;
		}
	}

	static async resolve(result) {
		const def = new Deferred();
		def.resolve(result);
		return def;
	}

	static async reject(err) {
		const def = new Deferred();
		def.reject(err);
		return def;
	}

	static async race(defs) {
		if (Array.isArray(defs)) {
			return await Promise.race(defs.map(def => {
				if (def instanceof Deferred) {
					return def.whenFullfilled;
				} else if (def instanceof Promise) {
					return Deferred.fromPromise(def).whenFullfilled;
				} else {
					return Deferred.resolve(def);
				}
			}));
		}
	}

	static async all(defs) {
		if (Array.isArray(defs)) {
			return await Promise.all(defs.map(def => {
				if (def instanceof Deferred) {
					return def.whenFullfilled;
				} else if (def instanceof Promise) {
					return Deferred.fromPromise(def).whenFullfilled;
				} else {
					return Deferred.resolve(def);
				}
			}));
		}
	}

	static async allSettled(defs) {
		if (Array.isArray(defs)) {
			return await Promise.allSettled(defs.map(def => {
				if (def instanceof Deferred) {
					return def.whenFullfilled;
				} else if (def instanceof Promise) {
					return Deferred.fromPromise(def).whenFullfilled;
				} else {
					return Deferred.resolve(def);
				}
			}));
		}
	}

	static async any(defs) {
		if (Array.isArray(defs)) {
			return await Promise.any(defs.map(def => {
				if (def instanceof Deferred) {
					return def.whenFullfilled;
				} else if (def instanceof Promise) {
					return Deferred.fromPromise(def).whenFullfilled;
				} else {
					return Deferred.resolve(def);
				}
			}));
		}
	}
}
