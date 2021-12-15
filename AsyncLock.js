import { getDeferred, sleep } from './promises.js';
const locks = new WeakMap();

export class AsyncLock extends EventTarget {
	constructor(name, { mode = 'exclusive', steal = false, ifAvailable = false, signal } = {}) {
		super();

		if (typeof name === 'string') {
			this.lock(name, { mode, steal, ifAvailable, signal });
		}
	}

	get locked() {
		return locks.has(this);
	}

	get mode() {
		if (this.locked) {
			return locks.get(this).lock.mode;
		} else {
			return null;
		}
	}

	get name() {
		if (this.locked) {
			return locks.get(this).lock.name;
		} else {
			return null;
		}
	}

	get supported() {
		return 'locks' in navigator && navigator.locks.request instanceof Function
	}

	get whenLocked() {
		return new Promise(resolve => {
			if (this.locked) {
				resolve();
			} else {
				this.addEventListener('locked', () => resolve(), { once: true });
			}
		});
	}

	get whenUnlocked() {
		return new Promise(resolve => {
			if (! this.locked) {
				this.addEventListener('unlocked', () => resolve(), { once: true });
			} else {
				resolve();
			}
		});
	}

	expireIn(ms, { signal } = {}) {
		sleep(ms, { signal }).then(() => {
			if (this.locked) {
				this.unlock(new DOMException('Lock expired'));
			}
		});
	}

	async lock(name, { mode = 'exclusive', ifAvailable = false, steal = false, signal, expires } = {}) {
		if (this.locked) {
			throw new DOMException('Already locked');
		} else if (! this.supported) {
			throw new DOMException('WebLocks not supported');
		} else {
			const deferred = getDeferred({ signal });

			navigator.locks.request(name, { mode, ifAvailable, steal, signal }, async lock => {
				if (! lock) {
					deferred.reject(new DOMException('Error acquiring lock'));
				} else {
					const { resolve, reject, promise } = getDeferred({ signal });
					locks.set(this, { resolve, reject, promise, lock });
					deferred.resolve(lock);
					this.dispatchEvent(new CustomEvent('locked', { detail: lock }));

					if (Number.isSafeInteger(expires)) {
						this.expireIn(expires, { signal });
					}

					return await promise.then(detail => {
						locks.delete(this);
						resolve(detail);
						this.dispatchEvent(new CustomEvent('unlocked', { detail }));
						return detail;
					}).catch(error => {
						locks.delete(this);
						reject(error);
						this.dispatchEvent(new CustomEvent('error', { detail: error }))
						this.dispatchEvent(new CustomEvent('unlocked', { detail: { error }}));
					});
				}
			}).catch(deferred.reject);

			return await deferred.promise;
		}
	}

	async unlock(reason) {
		if (! this.locked) {
			throw new DOMException('Attempting to unlock a lock which is not locked');
		} else {
			const { resolve, reject, lock } = locks.get(this);
			locks.delete(this);

			if (reason instanceof Error) {
				reject(reason);
			} else {
				resolve(reason);
			}

			return lock;
		}
	}
}
