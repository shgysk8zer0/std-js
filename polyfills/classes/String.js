export default class {
	trim() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	}
	startsWith(searchString, position) {
		position = position || 0;
		return this.lastIndexOf(searchString, position) === position;
	}
	endsWith(searchString, position) {
		var subjectString = this.toString();
		if (position === undefined || position > subjectString.length) {
			position = subjectString.length;
		}
		position -= searchString.length;
		var lastIndex = subjectString.indexOf(searchString, position);
		return lastIndex !== -1 && lastIndex === position;
	}
	includes() {
		return String.prototype.indexOf.apply(this, arguments) !== -1;
	}
	repeat(count) {
		if (this == null) {
			throw new TypeError('can\'t convert ' + this + ' to object');
		}
		var str = '' + this;
		count = +count;
		if (count != count) {
			count = 0;
		}
		if (count < 0) {
			throw new RangeError('repeat count must be non-negative');
		}
		if (count == Infinity) {
			throw new RangeError('repeat count must be less than infinity');
		}
		count = Math.floor(count);
		if (str.length == 0 || count == 0) {
			return '';
		}
		// Ensuring count is a 31-bit integer allows us to heavily optimize the
		// main part. But anyway, most current (August 2014) browsers can't handle
		// strings 1 << 28 chars or longer, so:
		if (str.length * count >= 1 << 28) {
			throw new RangeError('repeat count must not overflow maximum string size');
		}
		var rpt = '';
		for (;;) {
			if ((count & 1) == 1) {
				rpt += str;
			}
			count >>>= 1;
			if (count == 0) {
				break;
			}
			str += str;
		}
		// Could we try:
		// return Array(count + 1).join(this);
		return rpt;
	}
}
