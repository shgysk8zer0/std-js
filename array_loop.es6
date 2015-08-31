Array.prototype.loop = function*(times = Infinity) {
	while(times-- > 0) {
		for (let el of this) {
			yield el;
		}
	}
};
