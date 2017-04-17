import {MutationRecord} from '../polyfills/MutationRecord.js';
/* eslint no-redeclare: 0 no-fallthrough: 0*/
export var registrationsTable = new WeakMap();
var setImmediate = window.msSetImmediate;
if (!setImmediate) {
	var setImmediateQueue = [];
	var sentinel = String(Math.random());
	window.addEventListener('message', function (e) {
		if (e.data === sentinel) {
			var queue = setImmediateQueue;
			setImmediateQueue = [
			];
			queue.forEach(function (func) {
				func();
			});
		}
	});
	setImmediate = function (func) {
		setImmediateQueue.push(func);
		window.postMessage(sentinel, '*');
	};
}
var isScheduled = false;
var scheduledObservers = [];
function scheduleCallback(observer) {
	scheduledObservers.push(observer);
	if (!isScheduled) {
		isScheduled = true;
		setImmediate(dispatchCallbacks);
	}
}
function removeTransientObserversFor(observer) {
	observer.nodes_.forEach(function (node) {
		var registrations = registrationsTable.get(node);
		if (!registrations) {
			return;
		}
		registrations.forEach(function (registration) {
			if (registration.observer === observer) {
				registration.removeTransientObservers();
			}
		});
	});
}
export function wrapIfNeeded(node) {
	return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
}
function dispatchCallbacks() {
	isScheduled = false;
	var observers = scheduledObservers;
	scheduledObservers = [
	];
	observers.sort(function (o1, o2) {
		return o1.uid_ - o2.uid_;
	});
	var anyNonEmpty = false;
	observers.forEach(function (observer) {
		var queue = observer.takeRecords();
		removeTransientObserversFor(observer);
		if (queue.length) {
			observer.callback_(queue, observer);
			anyNonEmpty = true;
		}
	});
	if (anyNonEmpty) {
		dispatchCallbacks();
	}
}
function forEachAncestorAndObserverEnqueueRecord(target, callback) {
	for (var node = target; node; node = node.parentNode) {
		var registrations = registrationsTable.get(node);
		if (registrations) {
			for (var j = 0; j < registrations.length; j++) {
				var registration = registrations[j];
				var options = registration.options;
				if (node !== target && !options.subtree) {
					continue;
				}
				var record = callback(options);
				if (record) {
					registration.enqueue(record);
				}
			}
		}
	}
}

var currentRecord;
var recordWithOldValue;
function getRecord(type, target) {
	return currentRecord = new MutationRecord(type, target);
}
function getRecordWithOldValue(oldValue) {
	if (recordWithOldValue) {
		return recordWithOldValue;
	}
	recordWithOldValue = copyMutationRecord(currentRecord);
	recordWithOldValue.oldValue = oldValue;
	return recordWithOldValue;
}
function clearRecords() {
	currentRecord = recordWithOldValue = undefined;
}
function recordRepresentsCurrentMutation(record) {
	return record === recordWithOldValue || record === currentRecord;
}
function selectRecord(lastRecord, newRecord) {
	if (lastRecord === newRecord) {
		return lastRecord;
	}
	if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) {
		return recordWithOldValue;
	}
	return null;
}
export var uidCounter = 0;
function copyMutationRecord(original) {
	var record = new MutationRecord(original.type, original.target);
	record.addedNodes = original.addedNodes.slice();
	record.removedNodes = original.removedNodes.slice();
	record.previousSibling = original.previousSibling;
	record.nextSibling = original.nextSibling;
	record.attributeName = original.attributeName;
	record.attributeNamespace = original.attributeNamespace;
	record.oldValue = original.oldValue;
	return record;
}
export class Registration {
	constructor(observer, target, options) {
		this.observer = observer;
		this.target = target;
		this.options = options;
		this.transientObservedNodes = [];
	}
	enqueue(record) {
		var records = this.observer.records_;
		var length = records.length;
		if (records.length > 0) {
			var lastRecord = records[length - 1];
			var recordToReplaceLast = selectRecord(lastRecord, record);
			if (recordToReplaceLast) {
				records[length - 1] = recordToReplaceLast;
				return;
			}
		} else {
			scheduleCallback(this.observer);
		}
		records[length] = record;
	}
	addListeners() {
		this.addListeners_(this.target);
	}
	addListeners_(node) {
		var options = this.options;
		if (options.attributes) {
			node.addEventListener('DOMAttrModified', this, true);
		}
		if (options.characterData) {
			node.addEventListener('DOMCharacterDataModified', this, true);
		}
		if (options.childList) {
			node.addEventListener('DOMNodeInserted', this, true);
		}
		if (options.childList || options.subtree) {
			node.addEventListener('DOMNodeRemoved', this, true);
		}
	}
	removeListeners() {
		this.removeListeners_(this.target);
	}
	removeListeners_(node) {
		var options = this.options;
		if (options.attributes) {
			node.removeEventListener('DOMAttrModified', this, true);
		}
		if (options.characterData) {
			node.removeEventListener('DOMCharacterDataModified', this, true);
		}
		if (options.childList) {
			node.removeEventListener('DOMNodeInserted', this, true);
		}
		if (options.childList || options.subtree) {
			node.removeEventListener('DOMNodeRemoved', this, true);
		}
	}
	addTransientObserver(node) {
		if (node === this.target) {
			return;
		}
		this.addListeners_(node);
		this.transientObservedNodes.push(node);
		var registrations = registrationsTable.get(node);
		if (!registrations) {
			registrationsTable.set(node, registrations = []);
		}
		registrations.push(this);
	}
	removeTransientObservers() {
		var transientObservedNodes = this.transientObservedNodes;
		this.transientObservedNodes = [];
		transientObservedNodes.forEach(node => {
			this.removeListeners_(node);
			var registrations = registrationsTable.get(node);
			for (var i = 0; i < registrations.length; i++) {
				if (registrations[i] === this) {
					registrations.splice(i, 1);
					break;
				}
			}
		}, this);
	}
	handleEvent(e) {
		e.stopImmediatePropagation();
		switch (e.type) {
		case 'DOMAttrModified':
			var name = e.attrName;
			var namespace = e.relatedNode.namespaceURI;
			var target = e.target;
			var record = new getRecord('attributes', target);
			record.attributeName = name;
			record.attributeNamespace = namespace;
			var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
			forEachAncestorAndObserverEnqueueRecord(target, function (options) {
				if (!options.attributes) {
					return;
				}
				if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
					return;
				}
				if (options.attributeOldValue) {
					return getRecordWithOldValue(oldValue);
				}
				return record;
			});
			break;
		case 'DOMCharacterDataModified':
			forEachAncestorAndObserverEnqueueRecord(e.target, options => {
				if (!options.characterData) {
					return;
				}
				if (options.characterDataOldValue) {
					return getRecordWithOldValue(e.prevValue);
				}
				return getRecord('characterData', e.target);
			});
			break;
		case 'DOMNodeRemoved':
			this.addTransientObserver(e.target);
		case 'DOMNodeInserted':
			var target = e.relatedNode;
			var changedNode = e.target;
			var addedNodes,
				removedNodes;
			if (e.type === 'DOMNodeInserted') {
				addedNodes = [changedNode];
				removedNodes = [
				];
			} else {
				addedNodes = [];
				removedNodes = [changedNode];
			}
			var previousSibling = changedNode.previousSibling;
			var nextSibling = changedNode.nextSibling;
			var record = getRecord('childList', target);
			record.addedNodes = addedNodes;
			record.removedNodes = removedNodes;
			record.previousSibling = previousSibling;
			record.nextSibling = nextSibling;
			forEachAncestorAndObserverEnqueueRecord(target, function (options) {
				if (!options.childList) {
					return;
				}
				return record;
			});
		}
		clearRecords();
	}
}
