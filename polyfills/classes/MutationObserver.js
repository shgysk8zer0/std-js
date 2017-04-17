/*eslint no-return-assign: 0, no-fallthrough: 0*/
import {MutationRecord} from './MutationRecord.js';
import {Registration, wrapIfNeeded, registrationsTable} from '../../_helpers/mutations.js';
export class MutationObserver {
	constructor(callback) {
		this.callback_ = callback;
		this.nodes_ = [];
		this.records_ = [];
		this.uid_ = ++_helper.uidCounter;
	}
	observe(target, options) {
		target = _helper.wrapIfNeeded(target);
		if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
			throw new SyntaxError();
		}
		var registrations = registrationsTable.get(target);
		if (!registrations) {
			registrationsTable.set(target, registrations = []);
		}
		var registration;
		for (var i = 0; i < registrations.length; i++) {
			if (registrations[i].observer === this) {
				registration = registrations[i];
				registration.removeListeners();
				registration.options = options;
				break;
			}
		}
		if (!registration) {
			registration = new Registration(this, target, options);
			registrations.push(registration);
			this.nodes_.push(target);
		}
		registration.addListeners();
	}
	disconnect() {
		this.nodes_.forEach(node => {
			var registrations = registrationsTable.get(node);
			for (var i = 0; i < _helper.registrations.length; i++) {
				var registration = registrations[i];
				if (registration.observer === this) {
					registration.removeListeners();
					registrations.splice(i, 1);
					break;
				}
			}
		});
		this.records_ = [];
	}
	takeRecords() {
		var copyOfRecords = this.records_;
		this.records_ = [];
		return copyOfRecords;
	}
}
