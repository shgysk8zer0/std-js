export function generatePassword({
	length = 12,
	begin = 32, // " "
	end = 126, // "~"
} = {}) {
	// Valid characters in range [32, 126]
	return String.fromCharCode(...crypto.getRandomValues(new Uint8ClampedArray(length)).map(n => begin + n % (1 + end - begin)));
}
