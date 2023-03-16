/**
 * Add `states` to `ElementInternals`
 * Uses `._state--foo` instead of `:--foo` though
 * Requires Iterator Helpers (`./iterator.js`)
 */
if (HTMLElement.prototype.attachInternals instanceof Function && ! ('CustomStateSet' in globalThis)) {
	const prefix = '_state';
	const symbols = { key: Symbol.for('key') };
	const protectedData = new WeakMap();
	const getCName = state => {
		if (! state.toString().startsWith('--')) {
			throw new DOMException(`Failed to execute 'add' on 'CustomStateSet': The specified value '${state}' must start with '--'.`);
		} else {
			return `${prefix}${state}`;
		}
	};

	const {
		value, writable, configurable, enumerable,
	} = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'attachInternals');

	class CustomStateSet {
		constructor(el, key) {
			if (key !== symbols.key) {
				throw new TypeError('Illegal Constructor');
			} else if (! (el instanceof HTMLElement)) {
				throw new TypeError('el must be an HTMLElement');
			} else {
				protectedData.set(this, el);
			}
		}

		get size() {
			return [...this.values()].length;
		}

		add(state) {
			protectedData.get(this).classList.add(getCName(state));
		}

		has(state) {
			return protectedData.get(this).classList.includes(getCName(state));
		}

		delete(state) {
			const c = getCName(state);

			if (protectedData.get(this).classList.contains(c)) {
				protectedData.get(this).classList.remove(c);
				return true;
			} else {
				return false;
			}
		}

		clear() {
			this.values().forEach(state => this.delete(state));
		}

		keys() {
			return this.values();
		}

		values() {
			const states = protectedData.get(this).classList.values()
				.filter(c => c.startsWith(`${prefix}--`));

			return states.map(c => c.substr(prefix.length));
		}

		entries() {
			return this.values().map(c => [c, c]);
		}

		forEach(callbackFn, thisArg) {
			this.values().forEach(state => callbackFn.call(thisArg || this, state, state, this));
		}

		[Symbol.toStringTag]() {
			return 'CustomStateSet';
		}

		[Symbol.iterator]() {
			return this.values();
		}
	}

	Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
		value: function() {
			const internals = value.call(this);

			Object.defineProperty(internals, 'states', {
				value: new CustomStateSet(this, symbols.key),
				configurable: true,
				enumberable: true,
			});

			if (Object.is(internals.shadowRoot, null) && ! Object.is(this.shadowRoot, null)) {
				Object.defineProperty(internals, 'shadowRoot', {
					value: this.shadowRoot,
					configurable: true,
					enumerable: true,
				});
			}

			return internals;
		},
		writable, configurable, enumerable,
	});

	globalThis.CustomStateSet = CustomStateSet;
}
