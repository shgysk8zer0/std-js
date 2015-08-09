if (!('includes' in String.prototype)) {
	String.prototype.includes = function() {
		return String.prototype.indexOf.apply(this, arguments) !== -1;
	};
}
