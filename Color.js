import { clamp, between, uint8clamped } from './math.js';
import { COLOR } from './patterns.js';
import { parseHexColor, toHexColor, hslaToRGBA, rgbaToHSLA, rgb, rgba, hsl, hsla, complimentaryColor } from './color-utils.js';

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

	get hue() {
		return this.hsl.hue;
	}

	set hue(val) {
		const { saturation, lightness } = this.hsl;
		const { red, green, blue } = hslaToRGBA({ hue: val, saturation, lightness });
		protectedData.set(this, { red, green, blue, opacity: this.opacity });
	}

	get saturation() {
		return this.hsl.saturation;
	}

	set saturation(val) {
		const { hue, lightness } = this.hsl;
		const { red, green, blue } = hslaToRGBA({ hue, saturation: val, lightness });
		protectedData.set(this, { red, green, blue, opacity: this.opacity });
	}

	get lightness() {
		return this.hsl.lightness;
	}

	set lightness(val) {
		const { hue, saturation } = this.hsl;
		const { red, green, blue } = hslaToRGBA({ hue, saturation, lightness: val });
		protectedData.set(this, { red, green, blue, opacity: this.opacity });
	}

	get hsl() {
		const { red, green, blue } = protectedData.get(this);
		const { hue, saturation, lightness} = rgbaToHSLA({ red, green, blue });
		return { hue, saturation, lightness };
	}

	get complimentary() {
		const hex = this.toHexString();
		const comp = complimentaryColor(hex);
		return Color.parse(comp);
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

	toHSLString() {
		const { red, green, blue } = protectedData.get(this);
		const { hue, saturation, lightness } = rgbaToHSLA({ red, green, blue });
		return hsl(hue, saturation, lightness);
	}

	toHSLAString() {
		const { red, green, blue, opacity: alpha } = protectedData.get(this);
		const { hue, saturation, lightness, alpha: opacity } = rgbaToHSLA({ red, green, blue, alpha });
		return hsla(hue, saturation, lightness, opacity);
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

	rotateHue(val) {
		const { hue, saturation, lightness } = this.hsl;
		return Color.hsla(
			hue + parseInt(val) % 360,
			saturation,
			lightness,
			this.opacity,
		);
	}

	saturate(val) {
		const { hue, saturation, lightness } = this.hsl;
		return Color.hsla(
			hue,
			clamp(0, saturation + parseInt(val), 100),
			lightness,
			this.opacity,
		);
	}

	lighten(val) {
		const { hue, saturation, lightness } = this.hsl;
		return Color.hsla(
			hue,
			saturation,
			clamp(0, lightness + parseInt(val), 100),
			this.opacity,
		);
	}

	static parse(hex) {
		const { red, green, blue, alpha: opacity } = parseHexColor(hex);
		return new Color({ red, green, blue, opacity });
	}

	static rgb(red, green, blue) {
		return new Color({ red, green, blue });
	}

	static hsl(hue, saturation, lightness) {
		const { red, green, blue } = hslaToRGBA({ hue, saturation, lightness });
		return new Color({ red, green, blue });
	}

	static hsla(hue, saturation, lightness, alpha) {
		const { red, green, blue, alpha: opacity } = hslaToRGBA({ hue, saturation, lightness, alpha });
		return new Color({ red, green, blue, opacity });
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
