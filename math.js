import './math-shims.js';

export function* range(start, end, step = 1) {
	[start, end] = [Math.min(start, end), Math.max(start, end)];

	while (start <= end) {
		yield start;
		start += step;
	}
}

export function* fibonacci() {
	let current = 1, prev = 1;
	yield 1;

	while (Number.isSafeInteger(current)) {
		yield current;
		[prev, current] = [current, current + prev];
	}
}

export function randomFloat(min, max) {
	[min, max] = [Math.min(min, max), Math.max(min, max)];
	return Math.random() * (max - min + 1) + min;
}

export function randomInt(min, max) {
	return Math.trunc(randomFloat(min, max));
}

export function sigma(start, end, callback) {
	let sum = 0;
	for (let num of range(start, end)) {
		sum += callback(num);
	}
	return sum;
}

export function sum(...nums) {
	return nums.reduce((sum, num) => sum + num, 0);
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
