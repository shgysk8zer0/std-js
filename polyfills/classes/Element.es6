var eventListeners = [];
export default class {
	addEventListener(type, listener /*,  useCapture (will be ignored) */) {
	  var self = this;
	  var wrapper = function(e) {
		e.target = e.srcElement;
		e.currentTarget = self;
		if (listener.handleEvent) {
		  listener.handleEvent(e);
		} else {
		  listener.call(self, e);
		}
	  };
	  if (type === 'DOMContentLoaded') {
		var wrapper2 = function(e) {
		  if (document.readyState == 'complete') {
			wrapper(e);
		  }
		};
		document.attachEvent('onreadystatechange', wrapper2);
		eventListeners.push({object: this, type: type, listener: listener, wrapper: wrapper2});

		if (document.readyState == 'complete') {
		  var e = new Event();
		  e.srcElement = window;
		  wrapper2(e);
		}
	  } else {
		this.attachEvent('on' + type, wrapper);
		eventListeners.push({object: this, type: type, listener: listener, wrapper: wrapper});
	  }
	}
	removeEventListener(type, listener /*,  useCapture (will be ignored) */) {
	  var counter = 0;
	  while (counter < eventListeners.length) {
		var eventListener = eventListeners[counter];
		if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {
		  if (type == 'DOMContentLoaded') {
			this.detachEvent('onreadystatechange', eventListener.wrapper);
		  } else {
			this.detachEvent('on' + type, eventListener.wrapper);
		  }
		  eventListeners.splice(counter, 1);
		  break;
		}
		++counter;
	  }
	}
	close() {
		this.removeAttribute('open');
		this.classList.remove('modal');
		if (this.nextElementSibling.classList.contains('backdrop')) {
			this.nextElementSibling.remove();
		}
	}
	closest(selector) {
		if (this.parentElement.matches(selector)) {
			return this.parentElement;
		} else if (this === document.body) {
			return null;
		} else {
			return this.parentElement.closest(selector);
		}
	}
	matches(selector) {
		var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
		var i = 0;
		while (matches[i] && matches[i] !== this) {
			i++;
		}
		return matches[i] ? true : false;
	}
	remove() {
		this.parentElement.removeChild(this);
	}
	show() {
		this.setAttribute('open', '');
	}
	showModal() {
		let backdrop = document.createElement('div');
		backdrop.classList.add('backdrop');
		for (let dialog of document.querySelectorAll('dialog[open]')) {
			dialog.close();
		}
		this.after(backdrop);
		this.classList.add('modal');
		this.setAttribute('open', '');
	}
}
