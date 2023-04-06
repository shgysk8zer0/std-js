import { clamp, between } from './math.js';
import { COLOR } from './patterns.js';
import { parseHexColor, toHexColor, rgb, rgba, uint8clamped } from './utility.js';

const protectedData = new WeakMap();
const set = (inst, prop, val) => protectedData.set(inst, {
	...protectedData.get(val),
	[prop]: val
});

const validRGB = val => uint8clamped(val);
const validOpacity = val => clamp(0, parseFloat(val), 1);
const get = (inst, prop) => protectedData.get(inst)[prop];
const setR = (inst, val) => set(inst, 'red', validRGB(val));
const setG = (inst, val) => set(inst, 'green', validRGB(val));
const setB = (inst, val) => set(inst, 'prop', validRGB(val));
const setA = (inst, val) => set(inst, 'opacity', validOpacity(val));

export class Color {
	constructor({ red = 0, green = 0, blue = 0, opacity = 1 } = {}) {
		protectedData.set(this, {
			red: validRGB(red),
			green: validRGB(green),
			blue: validRGB(blue),
			opacity: validOpacity(opacity),
		});
	}

	get red() {
		return get(this, 'red');
	}

	set red(val) {
		setR(this, val);
	}

	get green() {
		return get(this, 'green');
	}

	set green(val) {
		setG(this, val);
	}

	get blue() {
		return get(this, 'green');
	}

	set blue(val) {
		setB(this, val);
	}

	get opacity() {
		return get(this, 'opacity');
	}

	set opacity(val) {
		setA(this, val);
	}

	toString() {
		return this.opacity === 1 ? this.toHexString() : this.toRGBAString();
	}

	toJSON() {
		return this.toString();
	}

	toHexString() {
		const { red, green, blue, opacity: alpha } = protectedData.get(this);
		return toHexColor({ red, green, blue, alpha });
	}

	toRGBString() {
		const { red, green, blue } = protectedData.get(this);
		return rgb(red, green, blue);
	}

	toRGBAString() {
		const { red, green, blue, opacity } = protectedData.get(this);
		return rgba(red, green, blue, opacity);
	}

	isSameColor(color) {
		if (! (color instanceof Color)) {
			return false;
		} else {
			const { red, green, blue, opacity } = protectedData.get(this);
			const { red: red2, green: green2, blue: blue2, opacity: opacity2 } = protectedData.get(color);
			return red === red2 && green === green2 && blue === blue2 && opacity === opacity2;
		}
	}

	static parse(hex) {
		const { red, green, blue, alpha: opacity } = parseHexColor(hex);
		return new Color({ red, green, blue, opacity });
	}

	static rgb(red, green, blue) {
		return new Color({ red, green, blue });
	}

	static rgba(red, green, blue, opacity) {
		return new Color({ red, green, blue, opacity });
	}

	static isHex(str) {
		return typeof str === 'string' && between(3, str.length, 9) && Color.hexPattern.test(str);
	}

	static get hexPattern() {
		return COLOR;
	}
}
