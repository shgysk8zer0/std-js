import Notification from './Notification.js';

if (! window.hasOwnProperty('Notification')) {
	window.Notification = Notification;
}

if (document.createElement('dialog') instanceof HTMLUnknownElement && !HTMLElement.prototype.hasOwnProperty('open')) {
	HTMLElement.prototype.show = function() {
		this.open = true;
	};

	HTMLElement.prototype.close = function(returnValue = null) {
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

	Object.defineProperty(HTMLElement.prototype, 'open', {
		set: function(open) {
			if (open) {
				this.setAttribute('open', '');
			} else {
				this.removeAttribute('open');
				if (this.tagName === 'DIALOG') {
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
if (! document.createElement('dialog').hasOwnProperty('showModal')) {
	HTMLElement.prototype.showModal = function() {
		this.open = true;
		this.classList.add('modal');
		const backdrop = document.createElement('div');
		backdrop.classList.add('backdrop');
		this.after(backdrop);
	};
}

if (! ('content' in document.createElement('template'))) {
	Object.defineProperty(HTMLUnknownElement.prototype, 'content', {
		get: function() {
			const frag = document.createDocumentFragment();
			for (let i = 0; i < this.childNodes.length; i++) {
				frag.appendChild(this.childNodes[i].cloneNode(true));
			}
			return frag;
		}
	});
}

if (! HTMLElement.prototype.hasOwnProperty('contextMenu')){
	Object.defineProperty(HTMLElement.prototype, 'contextMenu', {
		get: function() {
			if (this.hasAttribute('contextmenu')) {
				return document.getElementById(this.getAttribute('contextmenu'));
			}
		}
	});
}
