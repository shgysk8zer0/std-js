(function() {
	'use strict';

	if (document.createElement('dialog') instanceof HTMLUnknownElement && ! HTMLUnknownElement.prototype.hasOwnProperty('open')) {
		HTMLUnknownElement.prototype.show = function() {
			this.open = true;
		};

		HTMLUnknownElement.prototype.close = function(returnValue = null) {
			this.open = false;
			if (this.tagName === 'DIALOG') {
				const event = new CustomEvent('close');

				if (typeof returnValue === 'string') {
					event.returnValue = true;
					this.returnValue = returnValue;
				}
				this.dispatchEvent(event);
				delete this.returnValue;
			}
		};

		Object.defineProperty(HTMLUnknownElement.prototype, 'open', {
			set: function(open) {
				if (this.tagName === 'DETAILS') {
					this.dispatchEvent(new CustomEvent('toggle'));
					this.toggleAttribute('open', open);
				} else if (this.tagName === 'DIALOG') {
					this.toggleAttribute('open', open);
					if (! open) {
						this.classList.remove('modal');
						const next = this.nextElementSibling;
						if (next instanceof HTMLElement && next.matches('.backdrop')) {
							next.remove();
						}
					}
				}
			},
			get: function() {
				return this.hasAttribute('open');
			}
		});
	}

	if (! (document.createElement('dialog').showModal instanceof Function)) {
		HTMLUnknownElement.prototype.showModal = function() {
			const controller = new AbortController();
			const signal = controller.signal;
			document.addEventListener('keydown', function escapeHandle({ key }) {
				if (key === 'Escape') {
					this.close();
				}
			}, { passive: true, signal });

			this.addEventListener('close', () => controller.abort(), { once: true, signal });
			this.open = true;
			this.classList.add('modal');
			const backdrop = document.createElement('div');
			backdrop.classList.add('backdrop');
			this.after(backdrop);
		};
	}
})();
