import { on, off } from './dom.js';
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
		this.reset();

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

	get signal() {
		return getData(this, 'signal');
	}

	set signal(signal) {
		if (signal instanceof AbortSignal) {
			const abortCallback = () => this.reject(new DOMException('The operation was aborted.'));
			setData(this, { signal });
			signal.addEventListener('abort', abortCallback);
			this.signal = null;
		} else {
			const { signal, abortCallback } = getData(this);
			setData(this, { signal: undefined, abortCallback: undefined });

			if (signal instanceof AbortSignal && abortCallback instanceof Function) {
				signal.removeEventListener('abort', abortCallback);
			}
		}
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
			return this.whenStatusChanged;
		} else {
			return Promise.resolve(this);
		}
	}

	get whenStatusChanged() {
		return this.when('statechange').then(() => this);
	}

	reset() {
		const obj = {
			result: undefined,
			error: undefined,
			signal: undefined,
			abortCallback: undefined,
			resolveEvent: { target: null, event: null, opts: {}},
			rejectEvent: { target: null, event: null, opts: {}},
		};

		obj.promise = new Promise((resolve, reject) => {
			obj.resolve = resolve;
			obj.reject = reject;
		});

		setData(this, obj);
		this.dispatchEvent(new CustomEvent('statuschange', { detail: 'pending' }));
		return this;
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
			return this;
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
			return this;
		}
	}

	resolveOn(target, event, { passive, capture, signal } = {}) {
		const opts = { once: true, passive, capture, signal };

		Promise.resolve(getData(this, 'resolveEvent')).then(({ target, event, callback, opts }) => {
			if (target instanceof EventTarget) {
				target.removeEventListener(event, callback, opts);
			}
		});

		if (target instanceof EventTarget && typeof event === 'string') {
			const callback = event => {
				target.removeEventListener(event, callback, opts);
				this.resolve(event);
			};
			target.addEventListener(event, callback, opts);
			setData(this, { resolveEvent: { target, event, callback, opts }});
		}
	}

	rejectOn(target, event, { passive, capture, signal } = {}) {
		const opts = { once: true, passive, capture, signal };

		Promise.resolve(getData(this, 'rejectEvent')).then(({ target, event, callback, opts }) => {
			if (target instanceof EventTarget) {
				target.removeEventListener(event, callback, opts);
			}
		});

		if (target instanceof EventTarget && typeof event === 'string') {
			const callback = event => {
				target.removeEventListener(event, callback, opts);
				this.reject(event);
			};
			target.addEventListener(event, callback, opts);
			setData(this, { rejectEvent: { target, event, callback, opts }});
		}
	}
	async onEvent(targets, successEvent, { errorEvent = 'error', capture, passive, signal } = {}) {
		const handlers = {};
		const once = true;
		if (! Array.isArray(targets)) {
			targets = Array.of(targets);
		}

		handlers[successEvent] = event => {
			this.resolve(event);
			off(targets, handlers, { capture, passive, signal, once });
		};

		handlers[errorEvent] = event => {
			this.reject(event);
			off(targets, handlers, { capture, passive, signal, once });
		};

		on(targets, handlers, { capture, passive, signal, once });
		return await this.promise;
	}

	async *yieldEvents(targets, successEvent, errorEvent = 'error', { capture, passive, signal } = {}) {
		const successQueue = [];
		const errorQueue = [];

		on(targets, successEvent, event => {
			if (this.pending) {
				this.resolve(event);
			} else {
				successQueue.push(event);
			}
		}, { capture, passive, signal });

		on(targets, errorEvent, event => {
			if (this.pending) {
				this.reject(event);
			} else {
				errorQueue.push(event);
			}
		}, { capture, passive, signal });

		while(! (signal instanceof AbortSignal) || ! signal.aborted) {
			if (successQueue.length !== 0) {
				yield successQueue.shift();
			} else if (errorQueue.length !== 0) {
				yield errorQueue.shift();
			} else if (this.fullfilled) {
				const { result, error } = getData(this);
				this.reset();
				yield error || result;
			} else {
				await this.whenFullfilled;
				const { result, error } = getData(this);
				this.reset();
				yield error || result;
			}
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

	on(...args) {
		on([this], ...args);
		return this;
	}

	off(...args) {
		off([this], ...args);
		return this;
	}

	once(event, callback, { signal, capture, passive } = {}) {
		this.on(event, callback, { once: true, signal, capture, passive });
		return this;
	}

	async when(event, { signal, capture, passive } = {}) {
		return new Promise(resolve => this.once(event, ({ detail }) => resolve(detail), { signal, capture, passive }));
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
