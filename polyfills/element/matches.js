if (!('matches' in Element.prototype)) {
	/*Check if Element matches a given CSS selector*/
	if ('mozMatchesSelector' in Element.prototype) {
		Element.prototype.matches = Element.prototype.mozMatchesSelector;
	} else if ('webkitMatchesSelector' in Element.prototype) {
		Element.prototype.matches = Element.prototype.webkitMatchesSelector;
	} else if ('oMatchesSelector' in Element.prototype) {
		Element.prototype.matches = Element.prototype.oMatchesSelector;
	} else if ('msMatchesSelector' in Element.prototype) {
		Element.prototype.matches = Element.prototype.msMatchesSelector;
	} else {
		Element.prototype.matches = function (selector) {
			var element = this;
			var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
			var i = 0;
			while (matches[i] && matches[i] !== element) {
				i++;
			}
			return matches[i] ? true : false;
		};
	}
}
