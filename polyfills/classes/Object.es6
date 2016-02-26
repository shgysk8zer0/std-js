function Temp() {}
export default class {
	static create(object) {
		if (typeof object != 'object') {
			throw TypeError('Object prototype may only be an Object or null');
		}
		Temp.prototype = object;
		let obj = new Temp();
		Temp.prototype = null;
		if (arguments.length > 1) {
			let Properties = Object(arguments[1]);
			for (let prop in Properties) {
				if (Object.prototype.hasOwnProperty.call(Properties, prop)) {
					obj[prop] = Properties[prop];
				}
			}
		}
		return obj;
	}
}
