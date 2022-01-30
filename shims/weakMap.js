if (! (WeakMap.prototype.emplace instanceof Function)) {
	WeakMap.prototype.emplace = function emplace(key, { insert, update } = {}) {
		const existing = this.get(key);

		if (typeof existing === 'undefined' && insert instanceof Function) {
			const value = insert.call(this, key, this);
			this.set(key, value);
			return value;
		} else if (typeof existing !== 'undefined' && update instanceof Function) {
			const value = update.call(this, existing, key, this);
			if (value !== existing) {
				this.set(key, value);
			}
			return value;
		} else {
			throw new Error('Key is not found and no `insert()` given');
		}
	};
}
