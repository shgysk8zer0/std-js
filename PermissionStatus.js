import EventTarget from './EventTarget.js';

const statuses = {};

export default class PermissionStatus extends EventTarget {
	constructor(name = null, state = 'prompt') {
		super();

		this._state = state;
		this._name = name;
	}

	get state() {
		return this._state;
	}

	set state(val) {
		if (typeof val === 'string' && val !== this._state) {
			this._state = val;
			const event = new Event('change');
			event.state = val;
			this.dispatchEvent(event);
		}
	}

	static get(name, state) {
		if (name in statuses) {
			const stat = statuses[name];
			stat.state = state;
			return stat;
		} else {
			const stat = new PermissionStatus(name, state);
			statuses[name] = stat;
			return stat;
		}
	}
}
