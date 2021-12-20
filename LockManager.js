import { getDeferred, isAsync } from './promises.js';
import { Lock } from './Lock.js';
const locks = new Map();
export const nativeSupport = 'locks' in navigator && navigator.locks.request instanceof Function;

/**
 * Some browsing contexts (iframes) have `navigator.locks` but methods only throw
 */
export const actuallySupported = new Promise(resolve => {
	if (! nativeSupport) {
		resolve(false);
	} else {
		navigator.locks.query().then(() => resolve(true)).catch(() => resolve(false));
	}
});

async function callFunction(callback, arg = null) {
	return new Promise((resolve, reject) => {
		if (isAsync(callback)) {
			callback.call(globalThis, arg).then(resolve, reject);
		} else {
			queueMicrotask(() => {
				try {
					const result = callback.call(globalThis, arg);
					resolve(result);
				} catch(err) {
					reject(err);
				}
			});
		}
	});
}

function shouldPend({ name, mode }) {
	switch(mode) {
		case 'exclusive': return getLocks().some(lock => lock.name === name);
		case 'shared': return getLocks().some(lock => lock.name === name && lock.mode === 'exclusive');
	}
}

function stealLocks(name) {
	[...locks.entries()].filter(([lock]) => lock.name === name).forEach(([lock, { reject, controller }]) => {
		requestIdleCallback(() => {
			controller.abort();
			locks.delete(lock);
		});
		reject(new DOMException('The lock request is aborted'));
	});
}

async function whenReleased(lock) {
	if (locks.has(lock)) {
		await locks.get(lock).promise.catch(console.error);
	}
}

function queueTask(name, mode, callback) {
	const { resolve, reject, promise } = getDeferred();
	const controller = new AbortController();
	const lock = new Lock(name, mode);
	const pending = shouldPend(lock);
	locks.set(lock, { resolve, reject, promise, callback, pending, controller });
	return lock;
}

function setPending(lock, pending = true) {
	if (locks.has(lock)) {
		locks.set(lock, {...locks.get(lock), pending });
	}
}

function isPending(lock) {
	return lock instanceof Lock && locks.has(lock) && locks.get(lock).pending;
}

function getLocks(name) {
	if (typeof name === 'string') {
		return [...locks.keys()].filter(lock => lock.name === name);
	} else {
		return [...locks.keys()];
	}
}

function getHeldLocks(name) {
	return getLocks(name).filter(lock => ! isPending(lock));
}

function getPendingLocks(name) {
	return getLocks(name).filter(lock => isPending(lock));
}

async function whenNotBlocked(lock) {
	switch(lock.mode) {
		case 'exclusive':
			await Promise.allSettled(getLocks()
				.filter(l => l.name === lock.name && l !== lock).map(whenReleased));
			break;
		case 'shared':
			await Promise.allSettled(getLocks()
				.filter(l => l.name === lock.name && l.mode === 'exclusive' && l !== lock).map(whenReleased));
			break;
	}
}

function getLockSignal(lock) {
	if (locks.has(lock)) {
		return locks.get(lock).controller.signal;
	}
}

async function executeLock(lock) {
	if (locks.has(lock)) {
		const { resolve, reject, promise, callback, pending, controller } = locks.get(lock);
		if (pending) {
			setPending(lock, false);
		}

		callFunction(callback, lock).then(resolve, reject).finally(() => {
			locks.delete(lock);
			requestIdleCallback(() => controller.abort());
		});

		return promise;
	}
}

/**
 * @see https://w3c.github.io/web-locks/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/LockManager
 */
export class LockManager {
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
	 * @param  {[type]}  name               [description]
	 * @param  {[type]}  args               [description]
	 * @return {Promise}      [description]
	 * static async request(name, callback)
	 * static async request(name, { mode = 'exclusive', ifAvailable = false, steal = false, signal }, callback)
	 */
	static async request(name, ...args) {
		let opts = {}, callback;
		if (args[0] instanceof Function) {
			callback = args[0];
		} else if (args[1] instanceof Function) {
			[opts, callback] = args;
		}

		if (typeof name !== 'string') {
			name = name.toString();
		}

		const { mode = 'exclusive', ifAvailable = false, steal = false, signal } = opts;

		if (steal && ifAvailable) {
			throw new DOMException('LockManager.request: `steal` and `ifAvailable` cannot be used together');
		} else if (name.startsWith('-')) {
			throw new DOMException('LockManager.request: Names starting with `-` are reserved');
		} else if (! ['exclusive', 'shared'].includes(mode)) {
			throw new TypeError(`LockManager.request: '${mode}' (value of 'mode' member of LockOptions) is not a valid value for enumeration LockMode.`);
		} else if (signal instanceof AbortSignal && signal.aborted) {
			throw new DOMException('LockManager.request: The lock request is aborted');
		} else if (mode === 'shared' && steal) {
			throw new DOMException('LockManager.request: `steal` is only supported for exclusive lock requests');
		}

		const held = getHeldLocks(name);
		const pending = getPendingLocks(name);
		const alreadyLocked = [...held, ...pending].some(lock => lock.name === name);

		if (steal && alreadyLocked) {
			stealLocks(name);
		}

		/**
		 * If shared & held lock found (none exclusive), then this lock may be held as well
		 * If exclusive & held or pending lock found, this is pending
		 */
		const lock = queueTask(name, mode, callback);
		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', () => {
				if (locks.has(lock)) {
					const { reject, controller } = locks.get(lock);
					locks.delete(lock);
					reject(new DOMException('The lock request is aborted'));
					controller.abort();
				}
			}, { once: true, signal: getLockSignal(lock) });
		}

		switch(mode) {
			case 'exclusive': {
				if (ifAvailable && (held.length !== 0 || pending.length !== 0)) {
					const controller = locks.get(lock).controller;
					locks.delete(lock);
					return await callFunction(callback, null).then(result => {
						requestIdleCallback(() => controller.abort());
						return result;
					});
				} else {
					await whenNotBlocked(lock);
					return await executeLock(lock);
				}
			}

			case 'shared': {
				if (! ifAvailable) {
					await whenNotBlocked(lock);
					return await executeLock(lock);
				} else if ([...held, ...pending].some(lock => lock.mode === 'exclusive')) {
					const controller = locks.get(lock).controller;
					locks.delete(lock);
					return await callFunction(callback, null).then(result => {
						requestIdleCallback(() => controller.abort());
						return result;
					});
				} else {
					await whenNotBlocked(lock);
					return await executeLock(lock);
				}
			}

			default:
				throw new TypeError(`LockManager.request: '${mode}' (value of 'mode' member of LockOptions) is not a valid value for enumeration LockMode.`);
		}
	}

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/LockManager/query
	 * @return {Promise} { held: [], pending: [] }
	 */
	static async query() {
		return {
			held: getHeldLocks().map(({ name, mode }) => ({ name, mode, clientId: null })),
			pending: getPendingLocks().map(({ name, mode }) => ({ name, mode, clientId: null })),
		};
	}
}

export async function request(...args) {
	if (await actuallySupported) {
		return navigator.locks.request(...args);
	} else {
		return LockManager.request(...args);
	}
}

export async function query() {
	if (await actuallySupported) {
		return navigator.locks.query();
	} else {
		return LockManager.query();
	}
}

export async function polyfill() {
	if (! nativeSupport) {
		globalThis.Lock = Lock;
		globalThis.LockManager = LockManager;
		navigator.locks = LockManager;
	} else if (! await actuallySupported) {
		navigator.locks.request = (...args) => LockManager.request(...args);
		navigator.locks.query = () => LockManager.query();
	}
}
