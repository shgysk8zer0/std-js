if (!('show' in Element.prototype)) {
	Element.prototype.show = function() {
		'use strict';
		this.setAttribute('open', '');
	};
}
