import './abort-shims.js';
import { on, off } from './dom.js';
import { getDeferred } from './promises.js';

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
	constructor({ success, fail, signal, timeout } = {}) {
		super();
		this.reset();

		if (success instanceof Function) {
			this.then(success);
		}

		if (fail instanceof Function) {
			this.catch(fail);
		}

		if (signal instanceof AbortSignal) {
			this.signal = signal;
		}

		if (Number.isInteger(timeout)) {
			this.rejectIn(timeout);
		}
	}

	get fulfilled() {
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
		if (! (signal instanceof AbortSignal)) {
			const { signal, abortCallback } = getData(this);
			setData(this, { signal: undefined, abortCallback: undefined });

			if (signal instanceof AbortSignal && abortCallback instanceof Function) {
				signal.removeEventListener('abort', abortCallback);
			}
		} else if (signal.aborted) {
			this.reject(new DOMException('The operation was aborted.'));
			this.signal = null;
		} else {
			const abortCallback = () => this.reject(new DOMException('The operation was aborted.'));
			setData(this, { signal });
			signal.addEventListener('abort', abortCallback);
			this.signal = null;
		}
	}

	get state() {
		const { result, error, signal } = getData(this);

		if (signal instanceof AbortSignal && signal.aborted === true) {
			return 'aborted';
		} else if (typeof result !== 'undefined') {
			return 'done';
		} else if (typeof error !== 'undefined') {
			return 'error';
		} else {
			return 'pending';
		}
	}

	get whenfulfilled() {
		if (this.pending) {
			return this.whenStatusChanged;
		} else {
			return Promise.resolve(this);
		}
	}

	get whenStatusChanged() {
		return this.when('statechange').then(() => this);
	}

	get aborted() {
		const { aborted = false } = this.signal || {};
		return aborted;
	}

	clearHandlers() {
		if (protectedData.has(this)) {
			const { timeout, resolveEvent, rejectEvent } = getData(this);

			if (Number.isInteger(timeout)) {
				clearTimeout(timeout);
			}

			if (typeof resolveEvent !== 'undefined' && resolveEvent.target instanceof EventTarget) {
				const { target, event, callback, opts } = resolveEvent;
				target.removeEventListener(event, callback, opts);
			}

			if (typeof rejectEvent !== 'undefined' && rejectEvent.target instanceof EventTarget) {
				const { target, event, callback, opts } = rejectEvent;
				target.removeEventListener(event, callback, opts);
			}
		}
	}

	reset() {
		const { promise, resolve, reject } = getDeferred();

		setData(this, {
			resolve,
			reject,
			promise,
			result: undefined,
			error: undefined,
			signal: undefined,
			abortCallback: undefined,
			resolveEvent: { target: null, event: null, opts: {}},
			rejectEvent: { target: null, event: null, opts: {}},
		});

		this.dispatchEvent(new CustomEvent('statuschange', { detail: 'pending' }));
		return this;
	}

	resolve(value) {
		if (this.state !== 'pending') {
			throw new DOMException('Already fulfilled');
		} else if (typeof value === 'undefined') {
			throw new TypeError('Cannot resolve with undefined');
		} else {
			const resolve = getData(this, 'resolve');
			setData(this, { value });
			resolve(value);
			this.dispatchEvent(new CustomEvent('statechange', { detail: 'done' }));
			this.dispatchEvent(new CustomEvent('done', { detail: value }));
			return this;
		}
	}

	reject(reason) {
		if (this.state !== 'pending') {
			throw new DOMException('Already fulfilled');
		} else if (typeof reason === 'undefined') {
			throw new TypeError('Cannot reject with undefined');
		} else {
			const reject = getData(this, 'reject');
			setData(this, { reason });
			reject(reason);
			this.dispatchEvent(new CustomEvent('statechange', { detail: 'error' }));
			this.dispatchEvent(new CustomEvent('error', { detail: reason }));
			return this;
		}
	}

	resolveOn(target, event, { passive, capture, signal } = {}) {
		{
			const { target, event, callback, opts } = getData(this, 'resolveEvent');

			if (target instanceof EventTarget) {
				target.removeEventListener(event, callback, opts);
			}
		}

		const opts = { once: true, passive, capture, signal };

		if (target instanceof EventTarget && typeof event === 'string') {
			const callback = event => {
				target.removeEventListener(event, callback, opts);
				this.rejectOn(null);
				this.resolve(event);
			};

			target.addEventListener(event, callback, opts);
			setData(this, { resolveEvent: { target, event, callback, opts }});
		}

		return this;
	}

	rejectOn(target, event, { passive, capture, signal } = {}) {
		{
			const { target, event, callback, opts } = getData(this, 'rejectEvent');
			if (target instanceof EventTarget) {
				target.removeEventListener(event, callback, opts);
			}
		}

		const opts = { once: true, passive, capture, signal };

		if (target instanceof EventTarget && typeof event === 'string') {
			const callback = event => {
				target.removeEventListener(event, callback, opts);
				this.resolveOn(null);
				this.reject(event);
			};

			target.addEventListener(event, callback, opts);
			setData(this, { rejectEvent: { target, event, callback, opts }});
		}

		return this;
	}

	rejectIn(timeout) {
		{
			const timeout = getData(this, 'timeout');

			if (Number.isInteger(timeout)) {
				clearTimeout(timeout);
			}
		}

		if (Number.isInteger(timeout) && timeout > -1) {
			setData(this, { timeout: setTimeout(() => this.reject(new DOMException('Operation timed-out')), timeout) });
		}
	}

	async *yieldEvents(targets, successEvent, { errorEvent = 'error', capture, passive, signal } = {}) {
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

		const abortPromise = new Promise((_, reject) => {
			if (signal instanceof AbortSignal) {
				signal.addEventListener('abort', () => reject(new DOMException('Operation aborted.')), { once: true });
			}
		});

		while(! (signal instanceof AbortSignal) || ! signal.aborted) {
			if (successQueue.length !== 0) {
				yield successQueue.shift();
			} else if (errorQueue.length !== 0) {
				yield errorQueue.shift();
			} else if (this.fulfilled) {
				const { result, error } = getData(this);
				this.reset();

				if (typeof error !== 'undefined') {
					yield Promise.reject(error);
				} else {
					yield result;
				}
			} else {
				try {
					await Promise.race([this.whenfulfilled, abortPromise]);
					const { result, error } = getData(this);
					this.reset();
					if (typeof error !== 'undefined') {
						yield Promise.reject(error);
					} else {
						yield result;
					}
				} catch(err) {
					yield Promise.reject(err);
				}
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

	static fromEvent(target, successEvent, { errorEvent = 'error', signal, capture, passive } = {}) {
		const opts = { once: true, signal, capture, passive };

		if (target instanceof EventTarget) {
			const def = new Deferred();

			def.resolveOn(target, successEvent, opts);

			if (typeof errorEvent === 'string') {
				def.rejectOn(target, errorEvent, opts);
			}

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
}
