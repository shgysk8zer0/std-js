import { getDeferred } from './promises.js';
import { Lock } from './Lock.js';
const locks = new Map();
export const nativeSupport = 'locks' in navigator;

export function polyfill() {
	if (! nativeSupport) {
		globalThis.Lock = Lock;
		globalThis.LockManager = LockManager;
		navigator.locks = LockManager;
		return true;
	} else {
		return false;
	}
}

function shouldPend({ name, mode }) {
	switch(mode) {
		case 'exclusive': return [...locks.keys()].some(lock => lock.name === name);
		case 'shared': return [...locks.keys()].some(lock => lock.name === name && lock.mode === 'exclusive');
	}
}

function stealLocks(name) {
	[...locks.entries()].filter(([lock]) => lock.name === name).forEach(([lock, { reject, controller }]) => {
		locks.delete(lock);
		controller.abort();
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

function getLocks() {
	return [...locks.keys()];
}

function getHeldLocks() {
	return getLocks().filter(lock => ! isPending(lock));
}

function getPendingLocks() {
	return getLocks().filter(lock => isPending(lock));
}

function getLockSignal(lock) {
	if (locks.has(lock)) {
		return locks.get(lock).controller.signal;
	}
}

async function executeLock(lock) {
	if (locks.has(lock)) {
		const { resolve, reject, promise, callback, pending, controller } = locks.get(lock);
		queueMicrotask(async () => {
			if (pending) {
				setPending(lock, false);
			}
			try {
				const result = await callback(lock);
				resolve(result);
			} catch(err) {
				reject(err);
			} finally {
				locks.delete(lock);
				controller.abort();
			}
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

		const { mode = 'exclusive', ifAvailable = false, steal = false, signal } = opts;

		if (! ['exclusive', 'shared'].includes(mode)) {
			throw new TypeError(`LockManager.request: '${mode}' (value of 'mode' member of LockOptions) is not a valid value for enumeration LockMode.`);
		} else if (signal instanceof AbortSignal && signal.aborted) {
			throw new DOMException('LockManager.request: The lock request is aborted');
		} else if (mode === 'shared' && steal) {
			throw new DOMException('LockManager.request: `steal` is only supported for exclusive lock requests');
		}

		const held = getHeldLocks().filter(lock => lock.name === name);
		const pending = getPendingLocks().filter(lock => lock.name === name);
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
			signal.addEventListner('abort', () => {
				const { reject, controller } = locks.get(lock);
				locks.delete(lock);
				reject(new DOMException('The lock request is aborted'));
				controller.abort();
			}, { once: true, signal: getLockSignal(lock) });
		}

		switch(mode) {
			case 'exclusive': {
				if (ifAvailable && held.length !== 0 || pending.length !== 0) {
					locks.delete(lock);
					return new Promise((resolve, reject) => {
						queueMicrotask(async () => {
							try {
								const result = await callback(null);
								resolve(result);
							} catch(err) {
								reject(err);
							}
						});
					});
				} else {
					await Promise.allSettled([...held, ...pending].map(lock => whenReleased(lock)));
					return await executeLock(lock);
				}
			}

			case 'shared': {
				await Promise.allSettled(held.map(lock => whenReleased(lock)));
				return await executeLock(lock);
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
