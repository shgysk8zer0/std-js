const protectedData = new WeakMap();

export class ObserverableObject extends EventTarget {
	constructor(object = {}) {
		super();

		/* Destructure to avoid issues with frozen Objects */
		protectedData.set(this, { data: { ...object }});

		Object.keys(object).forEach(key => {
			Object.defineProperty(this, key, {
				get() {
					return this.get(key);
				},
				set(val) {
					if (typeof val === 'undefined') {
						this.delete(key);
					} else {
						this.set(key, val);
					}
				},
				enumerable: true,
				configurable: true,
			})
		});
	}

	get(key) {
		return protectedData.get(this).data[key];
	}

	has(key) {
		return protectedData.get(this).data.hasOwnProperty(key);
	}

	set(key, value) {
		if (typeof value === 'undefined') {
			this.delete(key);
		} else {
			const { data, ...rest } = protectedData.get(this);
			data[key] = value;
			protectedData.set(this, { ...rest, data });

			this.dispatchEvent(new Event(`set:${key}`));
		}

		return this;
	}

	delete(key) {
		const { data, ...rest } = protectedData.get(this);

		if (data.hasOwnProperty(key)) {
			delete data[key];
			protectedData.set(this, { data, ...rest });
			this.dispatchEvent(new Event(`delete:${key}`));
		}

		return this;
	}

	toString() {
		return '[object ObserverableObject]';
	}

	toJSON() {
		return protectedData.get(this).data;
	}

	keys() {
		return Object.keys(protectedData.get(this).data);
	}

	values() {
		return Object.values(protectedData.get(this).data);
	}

	entries() {
		return Object.entries(protectedData.get(this).data);
	}
}
