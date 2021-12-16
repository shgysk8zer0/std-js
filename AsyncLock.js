import { getDeferred, sleep } from './promises.js';
const locks = new WeakMap();

export class AsyncLock extends EventTarget {
	constructor(name) {
		super();
		locks.set(this, { name });
	}

	get locked() {
		return 'lock' in locks.get(this);
	}

	get mode() {
		if (this.locked) {
			return locks.get(this).lock.mode;
		} else {
			return null;
		}
	}

	get name() {
		return locks.get(this).name;
	}

	get supported() {
		return 'locks' in navigator && navigator.locks.request instanceof Function;
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
			if (this.locked) {
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

	async lock({ mode = 'exclusive', ifAvailable = false, steal = false, signal, expires } = {}) {
		if (this.locked) {
			throw new DOMException('Already locked');
		} else if (! this.supported) {
			throw new DOMException('WebLocks not supported');
		} else {
			const deferred = getDeferred({ signal });
			const name = this.name;

			navigator.locks.request(name, { mode, ifAvailable, steal, signal }, async lock => {
				if (! lock) {
					deferred.reject(new DOMException('Error acquiring lock'));
				} else {
					const { resolve, reject, promise } = getDeferred({ signal });
					locks.set(this, { name, resolve, reject, promise, lock });
					deferred.resolve(lock);
					this.dispatchEvent(new CustomEvent('locked', { detail: lock }));

					if (Number.isSafeInteger(expires)) {
						this.expireIn(expires, { signal });
					}

					return await promise.then(detail => {
						locks.set(this, { name });
						resolve(detail);
						this.dispatchEvent(new CustomEvent('unlocked', { detail }));
						return detail;
					}).catch(error => {
						locks.set(this, { name });
						reject(error);
						this.dispatchEvent(new CustomEvent('error', { detail: error }));
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
			const { resolve, reject, lock, name } = locks.get(this);
			locks.set(this, { name });

			if (reason instanceof Error) {
				reject(reason);
			} else {
				resolve(reason);
			}

			return lock;
		}
	}
}
