(function() {
	'use strict';

	if (! (Element.prototype.closest instanceof Function)) {
		Element.prototype.closest = function closest(selector) {
			if (this.matches(selector)) {
				return this;
			} else {
				let found = null;
				let target = this.parentElement;

				while(target instanceof Element) {
					if (target.matches(selector)) {
						found = target;
						break;
					} else {
						target = target.parentElement;
					}
				}

				return found;
			}
		};
	}

	if (! (Element.prototype.toggleAttribute instanceof Function)) {
		Element.prototype.toggleAttribute = function(name, force) {
			if (typeof force === 'undefined') {
				return this.toggleAttribute(name, ! this.hasAttribute(name));
			} else if (force) {
				this.setAttribute(name, '');
				return true;
			} else {
				this.removeAttribute(name);
				return false;
			}
		};
	}

	if (! (Element.prototype.remove instanceof Function)) {
		Element.prototype.remove = function remove() {
			if (this.parentNode instanceof Node) {
				this.parentNode.removeChild(this);
			}
		};
	}

	if (! (Element.prototype.after instanceof Function)) {
		Element.prototype.after = function after(...items) {
			items.forEach(item => {
				if (item instanceof Node) {
					this.insertAdjacentElement('afterend', item);
				} else {
					this.insertAdjacentText('afterend', item);
				}
			});
		};
	}

	if (! (Element.prototype.before instanceof Function)) {
		Element.prototype.before = function before(...items) {
			items.forEach(item => {
				if (item instanceof Node) {
					this.insertAdjacentElement('beforebegin', item);
				} else {
					this.insertAdjacentText('beforebegin', item);
				}
			});
		};
	}

	if (! (Element.prototype.append instanceof Function)) {
		Element.prototype.append = function append(...items) {
			items.forEach(item => {
				if (item instanceof Node) {
					this.appendChild(item);
				} else {
					this.appendChild(document.createTextNode(item));
				}
			});
		};
	}

	if (! (Element.prototype.prepend instanceof Function)) {
		Element.prototype.prepend = function prepend(...items) {
			items.forEach(item => {
				if (item instanceof Node) {
					this.insertAdjacentElement('afterbegin', item);
				} else {
					this.insertAdjacentText('afterbegin', item);
				}
			});
		};
	}

	if (! (Element.prototype.replaceWith instanceof Function)) {
		Element.prototype.replaceWith = function replaceWith(...items) {
			this.before(...items);
			this.remove();
		};
	}

	if (! (Element.prototype.replaceChildren instanceof Function)) {
		Element.prototype.replaceChildren = function(...items) {
			[...this.children].forEach(el => el.remove());
			this.append(...items);
		};

		Document.prototype.replaceChildren = function(...items) {
			Element.prototype.replaceChildren.apply(this, items);
		};

		DocumentFragment.prototype.replaceChildren = function(...items) {
			Element.prototype.replaceChildren.apply(this, items);
		};

		if ('ShadowRoot' in globalThis) {
			ShadowRoot.prototype.replaceChildren = function(...items) {
				Element.prototype.replaceChildren.apply(this, items);
			};
		}
	}

	if (! (Element.prototype.getAttributeNames instanceof Function)) {
		Element.prototype.getAttributeNames = function() {
			return Array.from(this.attributes).map(({ name }) => name);
		};
	}

	if (! ('hidden' in Element.prototype)) {
		Object.defineProperty(Element.prototype, 'hidden', {
			get: function() {
				return this.hasAttribute('hidden');
			},
			set: function(value) {
				this.toggleAttribute('hidden', value);
			}
		});
	}
})();
