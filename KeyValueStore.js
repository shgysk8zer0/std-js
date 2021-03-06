import { when } from './dom.js';

const protectedData = new WeakMap();

function setData(obj, data) {
	if (protectedData.has(obj)) {
		protectedData.set(obj, {...protectedData.get(obj), ...data });
	} else {
		protectedData.set(obj, data);
	}
}

function getData(obj, key, defaultValue) {
	if (! protectedData.has(obj)) {
		return defaultValue;
	} else if (typeof key === 'string') {
		return protectedData.get(obj)[key] || defaultValue;
	} else {
		return protectedData.get(obj);
	}
}

async function getObjectStore(obj, { mode = 'readonly' } = {}) {
	await obj.connected;
	const { store, db } = getData(obj);
	const trans = db.transaction([store], mode);
	return trans.objectStore(store);
}

async function doAsyncAction(obj, { successEvent = 'success', errorEvent = 'error' } = {}) {
	if (! (obj instanceof EventTarget)) {
		throw new TypeError('doAsyncAction() required obj to be an instance of EventTarget');
	} else {
		return new Promise((resolve, reject) => {
			obj.addEventListener(successEvent, resolve);
			obj.addEventListener(errorEvent, reject);
		});
	}
}

export class KeyValueStore extends EventTarget {
	constructor({ name = KeyValueStore.dbName, store = KeyValueStore.storeName, version = 1 } = {}) {
		super();

		if (! KeyValueStore.supported) {
			throw new DOMException('IndexedDB is not supported in this browser');
		} else {
			const req = indexedDB.open(name, version);

			req.addEventListener('upgradeneeded', async ({ target: { result: db }}) => {
				// @TODO handle migrating between versions
				try {
					const oStore = db.createObjectStore(store, { keyPath: 'key' });
					oStore.createIndex('value', 'value', { unique: false });
					oStore.createIndex('updated', 'updated', { unique: false });
				} catch(err) {
					console.error(err);
				}
			});

			doAsyncAction(req).then(({ target: { result: db }}) => {
				setData(this, { db, store, version });
				this.dispatchEvent(new Event('connected'));
			}).catch(err => {
				throw err;
			});
		}
	}

	get connected() {
		if (protectedData.has(this)) {
			return Promise.resolve(this);
		} else {
			return when([this], 'connected').then(() => this);
		}
	}

	get length() {
		return this.count();
	}

	async close() {
		if (protectedData.has(this)) {
			const db = getData(this, 'db');
			db.close();
			protectedData.delete(this);
			return true;
		} else {
			return false;
		}
	}

	async count(query) {
		const store = await getObjectStore(this, { mode: 'readonly' });
		return await doAsyncAction(store.count(query))
			.then(({ target: { result }}) => result);
	}

	async get(key) {
		const store = await getObjectStore(this, { mode: 'readonly' });

		return await doAsyncAction(store.get(key))
			.then(({ target: { result = { value: undefined }}}) =>result.value);
	}

	async getAll(...keys) {
		const store = await getObjectStore(this, { mode: 'readonly' });

		if (keys.length === 0) {
			const results = await doAsyncAction(store.getAll())
				.then(({ target: { result = [] }}) => result);

			return results.reduce((val, { key, value, updated }) => {
				val[key] = { value, updated };
				return val;
			}, {});
		} else {
			const results = await Promise.all(keys.map(async key => {
				const { target: { result }} = await doAsyncAction(store.get(key));
				if (typeof result === 'undefined') {
					return { key, value: undefined, updated: 0 };
				} else {
					return result;
				}
			}));

			return results.reduce((val, { key, value, updated }) => {
				val[key] = { value, updated };
				return val;
			}, {});
		}
	}

	async set(key, value) {
		const store = await getObjectStore(this, { mode: 'readwrite' });
		await doAsyncAction(store.put({ key, value, updated: Date.now() }));
		this.dispatchEvent(new CustomEvent('update', { detail: { key, value }}));
	}

	async setAll(obj) {
		if (! (obj instanceof Object)) {
			throw new TypeError('setAll() expects an Object');
		} else {
			const store = await getObjectStore(this, { mode: 'readwrite' });
			const entries = Object.entries(obj);

			await Promise.all(entries.map(async ([key, value]) => {
				await doAsyncAction(store.put({ key, value, updated: Date.now() }));
			}));

			this.dispatchEvent(new CustomEvent('update', { detail: obj }));
		}
	}

	async has(...keys) {
		const stored = await this.keys();

		switch(keys.length) {
			case 0:
				return true;

			case 1:
				return stored.includes(keys[0]);

			default:
				return keys.every(key => stored.includes(key));
		}
	}

	async delete(...keys) {
		try {
			const store = await getObjectStore(this, { mode: 'readwrite' });
			await Promise.all(keys.map(async key => await doAsyncAction(store.delete(key))));

			this.dispatchEvent(new CustomEvent('update', {
				detail: Object.fromEntries(keys.map(key => [key, undefined])),
			}));

			return true;
		} catch(err) {
			console.error(err);
			return false;
		}
	}

	async keys({ query, count } = {}) {
		const store = await getObjectStore(this, { mode: 'readonly' });
		return await doAsyncAction(store.getAllKeys(query, count))
			.then(({ target: { result = [] }}) => result);
	}

	async values() {
		const store = await getObjectStore(this, { mode: 'readonly' });

		return await doAsyncAction(store.getAll())
			.then(({ target: { result = [] }}) => {
				return result.map(({ value }) => value);
			});
	}

	async entries() {
		const store = await getObjectStore(this, { mode: 'readonly' });

		return await doAsyncAction(store.getAll())
			.then(({ target: { result = [] }}) => {
				return result.map(({ key, value }) => [key, value]);
			});
	}

	/**
	 * NOTE: `.json()` cannot handle `File`s, etc.
	 */
	async json() {
		const store = await getObjectStore(this, { mode: 'readonly' });
		const results = await doAsyncAction(store.getAll())
			.then(({ target: { result = [] }}) => result);

		const obj = results.reduce((retVal, { key, value }) => {
			retVal[key] = value;
			return retVal;
		}, {});

		return JSON.stringify(obj);
	}

	async reset() {
		try {
			const store = await getObjectStore(this, { mode: 'readwrite' });
			await doAsyncAction(store.clear());
			return true;
		} catch(err) {
			console.error(err);
			return false;
		}
	}

	static get dbName() {
		return 'key-value-store';
	}

	static get storeName() {
		return 'key-value';
	}

	static get supported() {
		return 'indexedDB' in window;
	}
}
