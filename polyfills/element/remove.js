if(!('remove' in Element.prototype)) {
	Element.prototype.remove = function() {
		this.parentElement.removeChild(this);
	};
}
