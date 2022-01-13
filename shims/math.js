if (! (Math.clamp instanceof Function)) {
	Math.clamp = function(value, min, max) {
		return Math.min(Math.max(value, min), max);
	};
}

/*
 * Question of if it will be `Math.clamp` or `Math.constrain`
 */
if (! (Math.constrain instanceof Function)) {
	Math.constrain = Math.clamp;
}
