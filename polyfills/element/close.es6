export default () => {
	if (!('close' in Element.prototype)) {
		Element.prototype.close = function() {
			this.removeAttribute('open');
			this.classList.remove('modal');
			if (this.nextElementSibling.classList.contains('backdrop')) {
				this.nextElementSibling.remove();
			}
		};
	}
}
