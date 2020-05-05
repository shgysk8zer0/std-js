let module = EventTarget;

try {
	new EventTarget();
} catch (err) {
	module = class EventTarget {
		constructor() {
			this._target = document.createElement('div');
		}

		addEventListener(event, ...args) {
			this._target.addEventListener(event, ...args);
		}

		dispatchEvent(event, ...args) {
			this._target.dispatchEvent(event, ...args);
		}

		removeEventListener(event, ...args) {
			this._target.removeEventListener(event, ...args);
		}
	};
}
console.info(module);
export default module;
