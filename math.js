export const isNumber = num => typeof num === 'number' && ! Number.isNaN(num);

export const divisibleBy = (num, divisor) => isNumber(num) && num % divisor === 0;

export const even = num => divisibleBy(num, 2);

export const odd = num => ! even(num);

export const between = (min, val, max) => isNumber(val) && val >= min && val <= max;

export const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

export function* range(start, end, step = 1) {
	if (Number.range instanceof Function) {
		return Number.range(start, end, step);
	} else {
		[start, end] = [Math.min(start, end), Math.max(start, end)];

		while (start <= end) {
			yield start;
			start += step;
		}
	}
}

export function* fibonacci(terms = Number.MAX_SAFE_INTEGER) {
	if (! (Number.isSafeInteger(terms) && terms > 0)) {
		throw new TypeError('Invalid terms given');
	}

	let current = 1, prev = 1;
	yield 1;

	for (let term = 1; term < terms; term++) {
		yield current;
		[prev, current] = [current, current + prev];
	}
}

export function randomFloat(min, max) {
	[min, max] = [Math.min(min, max), Math.max(min, max)];
	return Math.random() * (max - min + 1) + min;
}

export function randomInt(min = 0, max = 100) {
	return min + crypto.getRandomValues(new Uint32Array(1))[0] % (max - min + 1);
}

export function* rng({ length = 32 } = {}) {
	for (const num of crypto.getRandomValues(new Uint8ClampedArray(length))) {
		yield num;
	}
}

export function sigma(start, end, callback) {
	return Array.from(range(start, end)).reduce((sum, num) => sum + callback(num));
}

export function sum(...nums) {
	return nums.reduce((sum, num) => sum + num);
}

export function product(...nums) {
	return nums.reduce((prod, num) => prod * num);
}

export function mean(...nums) {
	return sum(...nums) / nums.length;
}

export function variance(...nums) {
	if (nums.length <= 1) {
		return 0;
	}
	const m = mean(...nums);
	return nums.reduce((sum, num) => sum + (num - m)**2, 0) / (nums.length - 1);
}

export function standardDeviation(...nums) {
	return Math.sqrt(variance(...nums));
}

export function choose(n, k) {
	if (k === 0 || k === n) {
		return 1;
	} else if (! (Number.isInteger(n) && Number.isInteger(k))) {
		return NaN;
	}
	return factorial(n) / (k * factorial(n - k));
}

export function factorial(n) {
	if (! Number.isInteger(n)) {
		return NaN;
	} else if (n > 1) {
		return n * factorial(n - 1);
	} else if (n === 1 || n === 0) {
		return 1;
	} else {
		return undefined;
	}
}
