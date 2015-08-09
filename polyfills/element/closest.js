if(!('closest' in Element.prototype)) {
	Element.prototype.closest = function(selector) {
		if (this.parentElement.matches(selector)) {
			return this.parentElement;
		} else if (this === document.body) {
			return null;
		} else {
			return this.parentElement.closest(selector);
		}
	};
}
