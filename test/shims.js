import {supportsAsClasses} from '../support_test.js';
import deprefix from '../deprefixer.js';

deprefix();
supportsAsClasses('svg', 'audio', 'video', 'picture', 'canvas', 'menuitem',
'details', 'dialog', 'dataset', 'HTMLimports', 'classList', 'connectivity',
'visibility', 'notifications', 'ApplicationCache', 'indexedDB',
'localStorage', 'sessionStorage', 'CSSgradients', 'transitions',
'animations', 'CSSvars', 'CSSsupports', 'CSSmatches', 'querySelectorAll',
'workers', 'promises', 'ajax', 'FormData');

function closeOnEscape(event) {
	if (event.key === 'Escape') {
		document.querySelector('dialog[open]').close();
	}
}

if (document.createElement('dialog') instanceof HTMLUnknownElement) {
	if (! ('open' in HTMLElement.prototype)) {
		Object.defineProperty(HTMLElement.prototype, 'open', {
			get: function() {
				return this.hasAttribute('open');
			},
			set: function(open) {
				if (open) {
					this.setAttribute('open', '');
				} else {
					this.removeAttribute('open');
					if (this.tagName === 'DIALOG') {
						document.removeEventListener('keypress', closeOnEscape);
						// if (document.fullscreen && document.fullscreenElement === this) {
						// 	this.dispatchEvent(new CustomEvent('cancel', {detail: null}));
						// 	document.exitFullscreen();
						// }
						this.dispatchEvent(new CustomEvent('close', {detail: null}));
					}
				}
			}
		});
	}

	HTMLElement.prototype.show = function() {
		this.open = true;
	};

	HTMLElement.prototype.close = function(returnValue = null) {
		this.returnValue = returnValue;
		this.open = false;
	};

	HTMLElement.prototype.showModal = function() {
		this.open = true;
		document.addEventListener('keypress', closeOnEscape);
		// this.requestFullscreen();
	};
} else if (document.createElement('details') instanceof HTMLUnknownElement) {
	if (! ('open' in HTMLElement.prototype)) {
		Object.defineProperty(HTMLElement.prototype, 'open', {
			get: function() {
				return this.hasAttribute('open');
			},
			set: function(open) {
				open ? this.setAttribute('open', '') : this.removeAttribute('open');
			}
		});
	}
}

if (!('replace' in DOMTokenList.prototype)) {
	DOMTokenList.prototype.replace = function (oldToken, newToken) {
		if (this.contains(oldToken)) {
			this.remove(oldToken);
			this.add(newToken);
		}
	};
}
