let module = EventTarget;

try {
	new EventTarget();
} catch (err) {
	const storage = new WeakMap();
	module = class EventTarget {
		constructor() {
			storage.set(this, document.createElement('div'));
		}

		addEventListener(event, ...args) {
			storage.get(this).addEventListener(event, ...args);
		}

		dispatchEvent(event, ...args) {
			storage.get(this).dispatchEvent(event, ...args);
		}

		removeEventListener(event, ...args) {
			storage.get(this).removeEventListener(event, ...args);
		}
	};
}

export default module;
