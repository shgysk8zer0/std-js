const eventHandlers = new WeakMap();

export default class EventHander {
	constructor() {
		eventHandlers.set(this, {});
	}

	addEventListener(event, callback) {
		if (typeof(event) !== 'string') {
			throw new TypeError('Argument 1 must be a string.');
		} else if (! (callback instanceof Function)) {
			throw new TypeError('Callback must be a function');
		}

		const system = eventHandlers.get(this);
		if (! system.hasOwnProperty(event)) {
			system[event] = new Set([callback]);
		} else {
			system[event].add(callback);
		}
	}

	removeEventListener(event, callback) {
		if (typeof(event) !== 'string') {
			throw new TypeError('Argument 1 must be a string.');
		} else if (! (callback instanceof Function)) {
			throw new TypeError('Callback must be a function');
		}

		const system = eventHandlers.get(this);
		if (system.hasOwnProperty(event)) {
			system[event].remove(callback);
		}
	}

	dispatchEvent(event) {
		if (!(event instanceof CustomEvent)) {
			throw new TypeError('Argument 1 must be a CustomEvent.');
		}

		const system = eventHandlers.get(this);
		if (system.hasOwnProperty(event.type)) {
			system[event.type].forEach(callback => callback(event));
		}
	}
}
