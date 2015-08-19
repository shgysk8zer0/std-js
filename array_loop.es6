Array.prototype.loop = function* () {
	var n = 0;
	while(true) {
		while(n < this.length) {
			yield this[n++];
		}
		n = 0;
	}
};

