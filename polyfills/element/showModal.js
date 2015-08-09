if (!('showModal' in Element.prototype)) {
	Element.prototype.showModal = function() {
		var backdrop = document.createElement('div');
		backdrop.classList.add('backdrop');
		$('dialog[open]').each(function(dialog) {
			dialog.close();
		});
		this.after(backdrop);
		this.classList.add('modal');
		this.setAttribute('open', '');
	};
}
