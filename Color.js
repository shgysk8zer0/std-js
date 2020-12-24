function validRGB(val) {
	return Math.max(0, Math.min(parseInt(val), 255));
}

export default class Color {
	constructor({ red = 0, green = 0, blue = 0, opacity = 1 } = {}) {
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.opacity = opacity;
	}

	get red() {
		return validRGB(this._r);
	}

	set red(val) {
		this._r = validRGB(val);
	}

	get green() {
		return validRGB(this._g);
	}

	set green(val) {
		this._g = validRGB(val);
	}

	get blue() {
		return validRGB(this._b);
	}

	set blue(val) {
		this._b = validRGB(val);
	}

	get opacity() {
		return Math.max(0, Math.min(this._o, 1));
	}

	set opacity(val) {
		this._o = Math.max(0, Math.min(parseFloat(val), 1));
	}

	toString() {
		if (this.opacity === 1) {
			return this.toHexString();
		} else {
			return this.toRGBAString();
		}
	}

	toJSON() {
		return this.toString();
	}

	toHexString() {
		const { red, green, blue } = this;
		return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
	}

	toRGBString() {
		const { red, green, blue } = this;
		return `rgb(${red}, ${green}, ${blue})`;
	}

	toRGBAString() {
		const { red, green, blue, opacity } = this;
		return `rgb(${red}, ${green}, ${blue}, ${opacity})`;
	}

	static parse(hex) {
		if (typeof hex !== 'string') {
			throw new Error('Cannot parse a color from a non-string code');
		} else if (hex.startsWith('#')) {
			hex = hex.substring(1);
		}

		if (hex.length === 6) {
			return new Color({
				red: parseInt(hex.slice(0, 2), 16),
				green: parseInt(hex.slice(2, 4), 16),
				blue: parseInt(hex.slice(4, 6), 16),
			});
		} else if (hex.length === 3) {
			return new Color({
				red: parseInt(hex.slice(0, 1).repeat(2), 16),
				green: parseInt(hex.slice(1, 2).repeat(2), 16),
				blue: parseInt(hex.slice(2, 3).repeat(2), 16),
			});
		} else if (hex.length === 4) {
			return new Color({
				red: parseInt(hex.slice(0, 1).repeat(2), 16),
				green: parseInt(hex.slice(1, 2).repeat(2), 16),
				blue: parseInt(hex.slice(2, 3).repeat(2), 16),
				opacity: parseInt(hex.slice(3, 4).repeat(2), 16) / 255,
			});
		} else if (hex.length === 8) {
			return new Color({
				red: parseInt(hex.slice(0, 2), 16),
				green: parseInt(hex.slice(2, 4), 16),
				blue: parseInt(hex.slice(4, 6), 16),
				opacity: parseInt(hex.slice(6, 8), 16) / 255,
			});
		} else {
			throw new Error('Not a valid Hex color code');
		}
	}

	static rgb(red, green, blue) {
		return new Color({ red, green, blue });
	}

	static rgba(red, green, blue, opacity) {
		return new Color({ red, green, blue, opacity });
	}
}
