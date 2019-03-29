export default class Color extends EventTarget {
	constructor({r = 0, g = 0, b = 0} = {}) {
		super();
		this.red = r;
		this.green = g;
		this.blue = b;
	}

	get red() {
		return this._r;
	}

	set red(val) {
		this._r = parseInt(val);
		this.dispatchEvent(new CustomEvent('change', {detail: this}));
	}

	get green() {
		return this._g;
	}

	set green(val) {
		this._g = parseInt(val);
		this.dispatchEvent(new CustomEvent('change', {detail: this}));
	}

	get blue() {
		return this._b;
	}

	set blue(val) {
		this._b = parseInt(val);
		this.dispatchEvent(new CustomEvent('change', {detail: this}));
	}

	toString() {
		const {red, green, blue} = this;
		return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
	}

	toJSON() {
		return {r: this.red, g: this.greeb, b: this.green};
	}

	static parse(hex) {
		if (hex.startsWith('#')) {
			hex = hex.substring(1);
		}

		if (hex.length === 6) {
			return new Color({
				r: parseInt(hex.slice(0, 2), 16),
				g: parseInt(hex.slice(2, 4), 16),
				b: parseInt(hex.slice(4, 6), 16),
			});
		} else if (hex.length === 3) {
			return new Color({
				r: parseInt(hex.slice(0, 1).repeat(2), 16),
				g: parseInt(hex.slice(1, 2).repeat(2), 16),
				b: parseInt(hex.slice(2, 3).repeat(2), 16),
			});
		} else {
			throw new Error('Hex colors must be 3 or 6 characters long');
		}
	}
}
