const REQUIRED = [
	'@type',
	'@context'
];

function valid(data) {
	return ((typeof data === 'object') && REQUIRED.every(data.hasOwnProperty));
}
export default class SchemaData extends Map {
	constructor(data) {
		if (! typeof data === 'object') {
			throw new Error(`Expected and object but received a ${typeof data}`);
		} else if (! REQUIRED.every(key => data.hasOwnProperty(key))) {
			throw new Error(`SchemaData argument object is missing required properties`);
		} else {
			super();
			Object.keys(data).forEach(key => this.set(key, data[key]));
		}
		/*if (valid(data)) {
			super();
			Object.keys(data).forEach(key => this.set(key, data[key]));
		} else {
			throw new Error('Invalid data given to SchemaData');
		}*/
	}

	toString() {
		return JSON.stringify(this);
	}

	get type() {
		return this.get('@type');
	}

	get context() {
		return this.get('@context');
	}

	get itemtype() {
		return `${new URL(this.type, this.context)}`;
	}
}
