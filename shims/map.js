(function() {
	'use strict';

	/**
	 * @see https://github.com/tc39/proposal-upsert
	 */

	if (! (Map.prototype.emplace instanceof Function)) {
		Map.prototype.emplace = function emplace(key, { insert, update } = {}) {
			const has = this.has(key);

			if (has && update instanceof Function) {
				const existing = this.get(key);
				const value = update.call(this, existing, key, this);

				if (value !== existing) {
					this.set(key, value);
				}

				return value;
			} else if (has) {
				return this.get(key);
			} else if (insert instanceof Function) {
				const value = insert.call(this, key, this);
				this.set(key, value);
				return value;
			} else {
				throw new Error('Key is not found and no `insert()` given');
			}
		};
	}
})();
