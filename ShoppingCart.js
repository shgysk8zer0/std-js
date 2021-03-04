export const keyPath = 'uuid';

export const currency = 'USD';

export const version = 1;

export const fields = [{
	name: keyPath,
	primary: true,
	unique: true,
	required: true,
	type: 'uuid',
}, {
	name: 'name',
	unique: true,
	primary: false,
	required: true,
	type: 'text',
}, {
	name: 'quantity',
	unique: false,
	primary: false,
	required: true,
	type: 'int',
}, {
	name: 'price',
	unique: false,
	primary: false,
	required: true,
	type: 'float',
}, {
	name: 'updated',
	unique: false,
	primary: false,
	required: true,
	type: 'int',
}];

async function doAsyncAction(obj, { successEvent = 'success', errorEvent = 'error' } = {}) {
	if (! (obj instanceof EventTarget)) {
		console.info({ obj });
		throw new TypeError('doAsyncAction() required obj to be an instance of EventTarget');
	} else {
		return new Promise((resolve, reject) => {
			obj.addEventListener(successEvent, resolve);
			obj.addEventListener(errorEvent, reject);
		});
	}
}

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

async function getObjectStores(obj, { stores = [ShoppingCart.objectStoreName], mode = 'readonly' } = {}) {
	await obj.ready;
	const db = getData(obj, 'db');
	const trans = db.transaction(stores, mode);
	return stores.map(store => trans.objectStore(store));
}

async function getObjectStore(obj, { store = ShoppingCart.objectStoreName, mode = 'readonly' } = {}) {
	const [objectStore] = await getObjectStores(obj, { stores: [store], mode });
	return objectStore;
}

export class ShoppingCart extends EventTarget {
	constructor(name = 'shopping') {
		super();
		const req = indexedDB.open(name, version);

		req.addEventListener('upgradeneeded', async event => {
			const db = event.target.result;
			// @TODO handle migrating between versions
			const oStore = db.createObjectStore(ShoppingCart.objectStoreName, { keyPath });

			await Promise.all(fields.map(({ name, unique, primary }) => {
				if (primary !== true) {
					return oStore.createIndex(name, name, { unique });
				}
			}));
		});

		doAsyncAction(req).then(({ target: { result }}) => {
			setData(this, { db: result });
			this.dispatchEvent(new Event('ready'));
		}).catch(err => {
			throw err;
		});
	}

	get ready() {
		if (! protectedData.has(this)) {
			return new Promise(r => this.addEventListener('ready', () => r(), { once: true }));
		} else {
			return Promise.resolve();
		}
	}

	get items() {
		return this.getAllItems();
	}

	get total() {
		return this.items.then(items => {
			return {
				label: 'Total Cost',
				amount: {
					currency,
					value: items.reduce((sum, { price }) => sum + price, 0).toFixed(2)
				},
			};
		});
	}

	get isEmpty() {
		return this.itemCount.then(cnt => cnt === 0);
	}

	get itemCount() {
		return getObjectStore(this, { mode: 'readonly' })
			.then(store => doAsyncAction(store.count()))
			.then(({ target: { result }}) => result);
	}

	get displayItems() {
		return this.items.then(items => items.map(({ name, price, quantity }) => ({
			label: quantity === 1 ? name : `${name} [x${quantity}]`,
			amount: {
				currency,
				value: price * quantity,
			}
		})));
	}

	get paymentRequestDetails() {
		return Promise.all([this.total, this.displayItems])
			.then(([total, displayItems]) => ({ total, displayItems }));
	}

	async addItem({ uuid, name, quantity = 1, price, allowUpdate = true }) {
		try {
			const store = await getObjectStore(this, { mode: 'readwrite' });
			const updated = Date.now();

			if (quantity < 1) {
				return await this.deleteItem(uuid);
			} else if (allowUpdate) {
				await store.put({ uuid, name, quantity, price, updated });
				return true;
			} else {
				await store.add({ uuid, name, quantity, price, updated });
				return true;
			}
		} catch(err) {
			return false;
		}
	}

	async addItems(...items) {
		try {
			const store = await getObjectStore(this, { mode: 'readwrite' });
			const updated = Date.now();

			await Promise.all(items.map(async ({ uuid, name, quantity = 1, price }) => {
				store.put({ uuid, name, quantity, price, updated });
			}));
			return true;
		} catch(err) {
			console.error(err);
			return false;
		}
	}

	async getItem(uuid) {
		const store = await getObjectStore(this, { mode: 'readonly' });
		return await doAsyncAction(store.get(uuid)).then(({ target: { result }}) => result);
	}

	async deleteItem(uuid) {
		try {
			const store = await getObjectStore(this, { mode: 'readwrite' });
			await doAsyncAction(store.delete(uuid));
			return true;
		} catch(err) {
			console.error(err);
			return false;
		}
	}

	async emptyCart() {
		try {
			const store = await getObjectStore(this, { mode: 'readwrite' });
			await doAsyncAction(store.clear());
			return true;
		} catch(err) {
			console.error(err);
			return false;
		}
	}

	async getAllItems(query, count) {
		const store = await getObjectStore(this, { mode: 'readonly' });
		return await doAsyncAction(store.getAll(query, count)).then(({ target: { result }}) => result);
	}

	async getTotal() {
		const items = await this.getAllItems();
		return items.reduce((sum, { price }) => sum + price, 0).toFixed(2);
	}

	static get supported() {
		return 'indexedDB' in self;
	}

	static get objectStoreName() {
		return 'cart';
	}
}
