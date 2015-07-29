/*======================================================zQ Functions=========================================================*/
function zQ(q) {
	if(typeof q === 'undefined') {
		q = document.documentElement;
	}
	this.query = q;
	try {
		switch(typeof this.query) {
			case 'string':
				this.results = document.querySelectorAll(this.query);
				break;

			default:
				this.results = [this.query];
		}
	} catch (error) {
		console.error(error, this);
		console.error('No results for ' + this.query);
	}
	this.length = this.results.length;
	this.found = (!!this.results.length);
	this.filters = [];
	return this;
}
Object.prototype.isZQ = false;
zQ.prototype.isZQ = true;
function $(q) {
	if(typeof q === 'undefined') {
		q = document.documentElement;
	} else if(q.isZQ) {
		return q;
	}
	return new zQ(q);
}
zQ.prototype.constructor = zQ;
zQ.prototype.get = function(n) {
	return this.results.item(n);
};
zQ.prototype.each = function(callback) {
	if(this.found) {
		this.results.forEach(callback);
	}
	return this;
};
zQ.prototype.toArray = function() {
	if(!this.results.isArray) {
		var temp = [];
		this.each(function(node) {
			temp.push(node);
		});
		this.results = temp;
	}
	return this;
};
zQ.prototype.indexOf = function(i) {
	return this.results.indexOf(i);
};
zQ.prototype.some = function(callback) {
	return this.results.some(callback);
};
zQ.prototype.every = function(callback) {
	return this.results.every(callback);
};
zQ.prototype.filter = function(callback) {
	this.filters.push(callback.toString());
	this.results = this.results.filter(callback);
	this.length = this.results.length;
	return this;
};
zQ.prototype.map = function(callback) {
	return this.results.map(callback);
};
zQ.prototype.addClass = function(cname) {
	this.each(function(el) {
		el.classList.add(cname);
	});
	return this;
};
zQ.prototype.removeClass = function(cname) {
	this.each(function(el) {
		el.classList.remove(cname);
	});
	return this;
};
zQ.prototype.hasClass = function(cname) {
	return this.some(function(el) {
		return el.classList.contains(cname);
	});
};
zQ.prototype.toggleClass = function(cname, condition) {
	if (typeof condition === 'undefined') {
		this.each(function(el) {
			el.classList.toggle(cname);
		});
	} else {
		this.each(function(el) {
			el.classList.toggle(cname, condition);
		});
	}
	return this;
};
zQ.prototype.swapClass = function(cname1, cname2) {
	this.each(function(el) {
		el.classList.swap(cname1, cname2);
	});
	return this;
};
zQ.prototype.pickClass = function(cname1, cname2, condition) {
	(condition) ? this.addClass(cname1) : this.addClass(cname2);
	return this;
};
zQ.prototype.delete = function() {
	this.each(function(el) {
		el.parentElement.removeChild(el);
	});
};
zQ.prototype.hasAttribute = function(attr) {
	return this.some(function(el) {
		return el.hasAttribute(attr);
	});
};
zQ.prototype.attr = function(attr, val) {
	if(typeof val == 'undefined' || val === true) {
		val = '';
	}
	if(val === false) {
		this.each(function(el) {
			el.removeAttribute(attr);
		});
	} else {
		this.each(function(el) {
			el.setAttribute(attr, val);
		});
	}
	return this;

};
zQ.prototype.pause = function() {
	this.each(function(media) {
		media.pause();
	});
	return this;
};
/*======================================================Listener Functions=========================================================*/

zQ.prototype.on = function (event, callback) {
	this.each(function (e) {
		('addEventListener' in Element.prototype) ? e.addEventListener(event, callback, true) : e['on' + event] = callback;
	});
	return this;
};
/*Listeners per event type*/
[
	'click',
	'dblclick',
	'contextmenu',
	'keypress',
	'keyup',
	'keydown',
	'mouseenter',
	'mouseleave',
	'mouseover',
	'mouseout',
	'mousemove',
	'mousedown',
	'mouseup',
	'input',
	'change',
	'submit',
	'reset',
	'invalid',
	'select',
	'focus',
	'blur',
	'resize',
	'updateready',
	'DOMContentLoaded',
	'load',
	'unload',
	'beforeunload',
	'abort',
	'error',
	'scroll',
	'drag',
	'offline',
	'online',
	'visibilitychange',
	'popstate',
	'pagehide'
].forEach(function(event) {
	zQ.prototype[event] = function(callback) {
		return this.on(event, callback);
	};
});
zQ.prototype.ready = function(callback) {
	return this.on('DOMContentLoaded', callback);
};
zQ.prototype.networkChange = function (callback) {
	return this.online(callback) .offline(callback);
};
zQ.prototype.playing = function (callback) {
	this.each(function (e) {
		/*Does not work with listeners. Use onEvent by default*/
		e.onplay = callback;
	});
	return this;
};
zQ.prototype.paused = function (callback) {
	this.each(function (e) {
		e.onpause = callback;
	});
	return this;
};
zQ.prototype.visibilitychange = function (callback) {
	this.each(function (e) {
		[
			'',
			'moz',
			'webkit',
			'ms'
		].forEach(function (pre) {
			$(e) .on(pre + 'visibilitychange', callback);
		});
	});
	return this;
};
zQ.prototype.watch = function(watching, options, attributeFilter) {
	/*https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver*/
	if(typeof options === 'undefined') {
		options = [];
	}
	var watcher = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			watching[mutation.type].call(mutation);
		});
	}),
	watches = {};
	Object.keys(watching).concat(options).forEach(function(event) {
		watches[event] = true;
	});
	if(typeof attributeFilter !== 'undefined' && attributeFilter.isArray) {
		watches.attributeFilter = attributeFilter;
	}
	this.each(function(el) {
		watcher.observe(el, watches);
	});
	return this;
};
/*====================================================================================================================*/
zQ.prototype.$ = function (selector) {
	return $(this.query.split(',').map(function(str) {
		return selector.split(',').map(function(q) {
			return str.trim() + ' ' + q.trim();
		});
	}).join(', '));
};
Object.prototype.$ = function(q) {
	if(this === document || this === window) {
		return $(q);
	}
	return $(this).$(q);
};
zQ.prototype.css = function (args) { /*Set style using CSS syntax*/
	/*var n,
		i,
		e,
		value = [
		];
	args = args.replace('; ', ';') .replace(': ', ':') .replace('float', 'cssFloat') .split(';');
	for (var i = 0; i < args.length; i++) {
		value[i] = args[i].slice(args[i].indexOf(':') + 1).trim();
		args[i] = args[i].slice(0, args[i].indexOf(':')).trim().camelCase();
	}
	for (var i = 0; i < args.length; i++) {
		this.each(function (e) {
			e.style[args[i]] = value[i];
		});
	}*/
	var style = document.styleSheets[document.styleSheets.length - 1];
	style.insertRule(this.query + '{' + args + '}', style.cssRules.length);
	return this;
};
