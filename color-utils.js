import { between, clamp, toHex } from './math.js';
import { COLOR } from './patterns.js';

export function parseHexColor(hex) {
	if (! (typeof hex === 'string' && between(3, hex.length, 9) && COLOR.test(hex))) {
		throw new TypeError(`${hex} is not a valid hex color.`);
	} else if (hex.startsWith('#')) {
		hex = hex.substr(1);
	}

	switch (hex.length) {
		case 6:
			return {
				red: clamp(0, parseInt(hex.slice(0, 2), 16), 255),
				green: clamp(0, parseInt(hex.slice(2, 4), 16), 255),
				blue: clamp(0, parseInt(hex.slice(4, 6), 16), 255),
				alpha: 1,
			};

		case 3:
			return {
				red: clamp(0, parseInt(hex.slice(0, 1).repeat(2), 16), 255),
				green: clamp(0, parseInt(hex.slice(1, 2).repeat(2), 16), 255),
				blue: clamp(0, parseInt(hex.slice(2, 3).repeat(2), 16), 255),
				alpha: 1,
			};

		case 4:
			return {
				red: clamp(0, parseInt(hex.slice(0, 1).repeat(2), 16), 255),
				green: clamp(0, parseInt(hex.slice(1, 2).repeat(2), 16), 255),
				blue: clamp(0, parseInt(hex.slice(2, 3).repeat(2), 16), 255),
				alpha: clamp(0, parseInt(hex.slice(3, 4).repeat(2), 16) / 255, 1),
			};

		case 8:
			return {
				red: clamp(0, parseInt(hex.slice(0, 2), 16), 255),
				green: clamp(0, parseInt(hex.slice(2, 4), 16), 255),
				blue: clamp(0, parseInt(hex.slice(4, 6), 16), 255),
				alpha: clamp(0, parseInt(hex.slice(6, 8), 16) / 255, 1),
			};

		default:
			throw new TypeError(`${hex} is not a valid hex color.`);

	}
}

export function toHexColor({ red, green, blue, alpha = 1 }) {
	if (alpha === 1) {
		return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
	} else {
		return `#${toHex(red)}${toHex(green)}${toHex(blue)}${toHex(parseInt(alpha * 255))}`;
	}
}

export const rgb = (red, green, blue) => `rgb(${clamp(0, red, 255)}, ${clamp(0, green, 255)}, ${clamp(0, blue, 255)})`;
export const rgba = (red, green, blue, alpha = 1) => `rgba(${clamp(0, red, 255)}, ${clamp(0, green, 255)}, ${clamp(0, blue, 255)}, ${clamp(0, alpha, 1)})`;
export const hsl = (h, s, l) => `hsl(${h % 360}deg, ${clamp(0, s, 100)}%, ${clamp(0, l, 100)}%)`;
export const hsla = (h, s, l, a = 1) => `hsla(${h % 360}deg, ${clamp(0, s, 100)}%, ${clamp(0, l, 100)}%, ${clamp(0, a, 1)})`;

export function hexToRGB(hex) {
	const { red = 0, green = 0, blue = 0 } = parseHexColor(hex);
	return rgb(red, green, blue);
}

export function hexToRGBA(hex) {
	const { red = 0, green = 0, blue = 0, alpha = 1 } = parseHexColor(hex);
	return rgb(red, green, blue, alpha);
}

/**
 * @see https://stackoverflow.com/a/44134328
 */
export function hslToRGB({ hue = 0, saturation = 50, lightness = 100 }) {
	lightness /= 100;
	const a = saturation * Math.min(lightness, 1 - lightness) / 100;

	const f = n => {
		const k = (n + hue / 30) % 12;
		const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return clamp(0, 255 * color, 255);
	};

	return { red: f(0), green: f(8), blue: f(4) };
}

export function hslaToRGBA({ hue = 0, saturation = 50, lightness = 100, alpha = 1 }) {
	const { red, green, blue } = hslToRGB({ hue, saturation, lightness });
	return { red, green, blue, alpha: clamp(0, alpha, 1) };
}

export function hslToHex({ hue = 0, saturation = 50, lightness = 100 }) {
	const { red, green, blue } = hslToRGB({ hue, saturation, lightness });
	return toHexColor({ red, green, blue });
}

/**
 * @see https://stackoverflow.com/a/58426404
 */
export function rgbToHSL({ red = 0, green = 0, blue = 0 }) {
	const r = clamp(0, red / 255, 1);
	const g = clamp(0, green / 255, 1);
	const b = clamp(0, blue / 255, 1);
	const cmin = Math.min(r, g, b);
	const cmax = Math.max(r, g, b);
	const delta = cmax - cmin;
	let h = 0;
	let s = 0;
	let l = 0;

	if (delta === 0) {
		h = 0;
	} else if (cmax === r) {
		h = ((g - b) / delta) % 6;
	} else if (cmax === g) {
		h = (b - r) / delta + 2;
	} else {
		h = (r - g) / delta + 4;
	}

	h = Math.round(h * 60);

	if (h < 0) {
		h += 360;
	}

	l = (cmax + cmin) / 2;

	s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return { hue: h, saturation: s, lightness: l };
}

export function rgbaToHSLA({ red = 0, green = 0, blue = 0, alpha = 1 }) {
	const { hue, saturation, lightness } = rgbToHSL({ red, green, blue });
	return { hue, saturation, lightness, alpha: clamp(0, alpha, 1) };
}

export function hexToHSL(hex) {
	const { red, green, blue } = parseHexColor(hex);
	return rgbToHSL({ red, green, blue });
}

export function hexToHSLA(hex) {
	const { red, green, blue, alpha } = parseHexColor(hex);
	return rgbaToHSLA({ red, green, blue, alpha });
}

export const rotateHue = hue => hue + 180 % 360;

export function complimentaryColor(hex) {
	const { hue, saturation, lightness } = hexToHSL(hex);
	if (hue % 360 === 0) {
		return hslToHex({ hue: 0, saturation: Math.abs(saturation - 100), lightness: Math.abs(lightness - 100) });
	} else {
		return hslToHex({ hue: hue + 180 % 360, saturation, lightness });
	}
}
