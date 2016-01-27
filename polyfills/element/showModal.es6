export default () => {
	if (!('showModal' in Element.prototype)) {
		Element.prototype.showModal = function() {
			let backdrop = document.createElement('div');
			backdrop.classList.add('backdrop');
			for (let dialog of document.querySelectorAll('dialog[open]')) {
				dialog.close();
			}
			this.after(backdrop);
			this.classList.add('modal');
			this.setAttribute('open', '');
		};
	}
}
