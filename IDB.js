const protectedData = new WeakMap();

export class IDB extends EventTarget {
	async open({ name, version = 1, stores = [] }) {
		const db = await new Promise((resolve, reject) => {
			const req = indexedDB.open(name, version);

			if (Array.isArray(stores)) {
				req.addEventListener('upgradeneeded', ({ target: { result: db }}) => {
					const objectStores = db.objectStoreNames;

					stores.forEach(({ name, options, indicies }) => {
						if (! objectStores.contains(name) && Array.isArray(indicies)) {
							const store = db.createObjectStore(name, options);

							indicies.forEach(({ name, keyPath, unique = false, multiEntry = false, locale = 'auto' }) => {
								store.createIndex(name, name || keyPath, { unique, multiEntry, locale });
							});
						}
						// @TODO update indicies of existing stores?
					});
				});
			}

			req.addEventListener('success', ({ target: { result: db }}) => {
				resolve(db);
				this.dispatchEvent(new Event('connected'));
			});

			req.addEventListener('error', reject);
		});

		if (db) {
			protectedData.set(this, db);
			this.dispatchEvent(new Event('connected'));
		}
	}

	get objectStoreNames() {
		if (protectedData.has(this)) {
			return protectedData.get(this).objectStoreNames;
		} else {
			return {
				contains: () => false,
				length: () => 0,
			};
		}
	}

	get name() {
		if (protectedData.has(this)) {
			return protectedData.get(this).name;
		} else {
			return null;
		}
	}

	get version() {
		if (protectedData.has(this)) {
			return protectedData.get(this).version;
		} else {
			return NaN;
		}
	}

	async whenConnected(timeout = 100) {
		if (protectedData.has(this)) {
			return this;
		} else if (Number.isInteger(timeout) && timeout > 0) {
			return Promise.race([
				new Promise(r => this.addEventListener('connected', () => r(this), { once: true })),
				new Promise((resolve, reject) => setTimeout(() => reject('Connection timeout'), timeout)),
			]);
		} else {
			return new Promise(r => this.addEventListener('connected', () => r(this), { once: true }));
		}
	}

	async count(store, { query, timeout } = {}) {
		const oStore = await this.store(store, { timeout });

		return await new Promise((resolve, reject) => {
			const req = oStore.count(query);
			req.addEventListener('success', ({ target: { result }}) => resolve(result));
			req.addEventListener('error', ({ target: { error }}) => reject(error));
		});
	}

	async transaction(stores, { mode = 'readonly', durability = 'default', timeout } = {}) {
		await this.whenConnected(timeout);
		return protectedData.get(this).transaction(stores, mode, { durability });
	}

	async store(name, { mode = 'readonly', durability = 'default', timeout } = {}) {
		const transaction = await this.transaction(name, { mode, durability, timeout });
		return transaction.objectStore(name);
	}

	async get(store, key, { timeout }) {
		const oStore = await this.store(store, { timeout });

		return await new Promise((resolve, reject) => {
			const req = oStore.get(key);
			req.addEventListener('success', ({ target: { result }}) => resolve(result));
			req.addEventListener('error', ({ target: { error }}) => reject(error));
		});
	}

	async getAll(store, { query, count, timeout } = {}) {
		const oStore = await this.store(store, { timeout });

		return await new Promise((resolve, reject) => {
			const req = oStore.getAll(query, count);
			req.addEventListener('success', ({ target: { result }}) => resolve(result));
			req.addEventListener('error', ({ target: { error }}) => reject(error));
		});
	}

	async getAllKeys(store, { query, count, timeout } = {}) {
		const oStore = await this.store(store, { timeout });

		return await new Promise((resolve, reject) => {
			const req = oStore.getAllKeys(query, count);
			req.addEventListener('success', ({ target: { result }}) => resolve(result));
			req.addEventListener('error', ({ target: { error }}) => reject(error));
		});
	}

	async add(store, data, { key, durability = 'default', timeout } = {}) {
		const oStore = await this.store(store, { mode: 'readwrite', durability, timeout });

		return await new Promise((resolve, reject) => {
			const req = oStore.add(data, key);
			req.addEventListener('success', ({ target: { result }}) => resolve(result));
			req.addEventListener('error', ({ target: { error }}) => reject(error));
		});
	}

	async addItems(store, items, { durability = 'default', timeout } = {}) {
		const oStore = await this.store(store, { mode: 'readwrite', durability, timeout });

		return await Promise.all(items.map(async item => {
			return new Promise((resolve, reject) => {
				const req = oStore.add(item);
				req.addEventListener('success', ({ target: { result }}) => resolve(result));
				req.addEventListener('error', ({ target: { error }}) => reject(error));
			});
		}));
	}

	async putItems(store, items, { durability = 'default', timeout } = {}) {
		const oStore = await this.store(store, { mode: 'readwrite', durability, timeout });

		return await Promise.all(items.map(async item => {
			return new Promise((resolve, reject) => {
				const req = oStore.put(item);
				req.addEventListener('success', ({ target: { result }}) => resolve(result));
				req.addEventListener('error', ({ target: { error }}) => reject(error));
			});
		}));
	}

	async put(store, data, { key, durability = 'default', timeout } = {}) {
		const oStore = await this.store(store, { mode: 'readwrite', durability, timeout });

		return await new Promise((resolve, reject) => {
			const req = oStore.put(data, key);
			req.addEventListener('success', ({ target: { result }}) => resolve(result));
			req.addEventListener('error', ({ target: { error }}) => reject(error));
		});
	}

	async delete(store, key, { durability = 'default', timeout } = {}) {
		const oStore = await this.store(store, { mode: 'readwrite', durability, timeout });

		return await new Promise((resolve, reject) => {
			const req = oStore.delete(key);
			req.addEventListener('success', ({ target: { result }}) => resolve(result));
			req.addEventListener('error', ({ target: { error }}) => reject(error));
		});
	}

	async clear(store, { durability = 'default', timeout } = {}) {
		const oStore = await this.store(store, { mode: 'readwrite', durability, timeout });

		return await new Promise((resolve, reject) => {
			const req = oStore.clear();
			req.addEventListener('success', ({ target: { result }}) => resolve(result));
			req.addEventListener('error', ({ target: { error }}) => reject(error));
		});
	}

	async close() {
		if (protectedData.has(this)) {
			protectedData.get(this).close();
			protectedData.delete(this);
			return true;
		} else {
			return false;
		}
	}

	async openCursor(store, { query, mode = 'readonly', durability = 'default', direction = 'next', timeout } = {}) {
		const oStore = await this.store(store, { mode, durability, timeout });
		return oStore.openCursor(query, direction);
	}

	async openKeyCursor(store, { query, mode = 'readonly', durability = 'default', direction = 'next', timeout } = {}) {
		const oStore = await this.store(store, { mode, durability, timeout });
		return oStore.openKeyCursor(query, direction);
	}
}
