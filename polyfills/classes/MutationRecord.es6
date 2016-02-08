export class MutationRecord {
	constructor(type, target) {
		this.type = type;
		this.target = target;
		this.addedNodes = [];
		this.removedNodes = [];
		this.previousSibling = null;
		this.nextSibling = null;
		this.attributeName = null;
		this.attributeNamespace = null;
		this.oldValue = null;
	}
}
