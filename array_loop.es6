Array.prototype.loop = function* () {
	var n = 0;
	for(;;) {
		while(n < this.length) {
			yield this[n++];
		}
		n = 0;
	}
};
