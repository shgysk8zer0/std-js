/*eslint no-use-before-define: 0*/
/*============================ zQ Functions =======================*/
class zQ {
	constructor(selector = document) {
		try {
			switch(typeof selector) {
				case 'string':
					this.results = document.querySelectorAll(selector);
					break;

				case 'object':
					this.results = (selector instanceof zQ) ? selector.results : [selector];
					break;

				case 'undefined':
					this.results = [document.documentElement];
					break;
			}
			this.query = selector || ':root';
		} catch (error) {
			console.error(error, this);
			console.error(`No results for ${this.query}`);
		} finally {
			this.length = this.results.length;
			this.found = (this.results.length !== 0);
			this.filters = [];
		}
	}
	item(n) {
		return this.results.item(n);
	}
	each(callback) {
		if (this.found) {
			this.results.forEach(callback);
		}
		return this;
	}
	toArray() {
		if (!this.results.isArray) {
			this.results = Array.prototype.slice.call(this.results, 0);
		}
		return this;
	}
	indexOf(i) {
		return this.results.indexOf(i);
	}
	some(callback) {
		return this.results.some(callback);
	}
	every(callback) {
		return this.results.every(callback);
	}
	filter(callback) {
		this.filters.push(callback.toString());
		this.results = this.results.filter(callback);
		this.length = this.results.length;
		return this;
	}
	map(callback) {
		return this.results.map(callback);
	}
	addClass(cname) {
		this.each(el => el.classList.add(cname));
		return this;
	}
	removeClass(cname) {
		this.each(el => el.classList.remove(cname));
		return this;
	}
	hasClass(cname) {
		return this.some(el => el.classList.contains(cname));
	}
	toggleClass(cname, condition) {
		if (typeof condition === 'undefined') {
			this.each(el => el.classList.toggle(cname));
		} else {
			this.each(el => el.classList.toggle(cname, condition));
		}
		return this;
	}
	swapClass(cname1, cname2) {
		this.each(el => el.classList.swap(cname1, cname2));
		return this;
	}
	pickClass(cname1, cname2, condition) {
		(condition) ? this.addClass(cname1) : this.addClass(cname2);
		return this;
	}
	remove() {
		this.each(el => el.remove());
		return this;
	}
	delete() {
		return this.remove();
	}
	hasAttribute(attr) {
		return this.some(el => el.hasAttribute(attr));
	}
	attr(attr, val) {
		if (typeof val == 'undefined' || val === true) {
			val = '';
		}
		if (val === false) {
			this.each(el => el.removeAttribute(attr));
		} else {
			this.each(el => el.setAttribute(attr, val));
		}
		return this;
	}
	pause() {
		this.each(media => media.pause());
		return this;
	}
	/*==================== Listener Functions =================================*/
	on(event, callback) {
		this.each(function (e) {
			('addEventListener' in Element.prototype)
				? e.addEventListener(event, callback, true)
				: e[`on${event}`] = callback;
		});
		return this;
	}
	ready(callback) {
		if (document.readyState !== 'loading') {
			callback();
			return this;
		}
		return this.on('DOMContentLoaded', callback);
	}
	networkChange(callback) {
		return this.online(callback) .offline(callback);
	}
	playing(callback) {
		this.each(e => e.onplay = callback);
		return this;
	}
	paused(callback) {
		this.each(e => e.onpause = callback);
		return this;
	}
	visibilitychange(callback) {
		this.each(function (e) {
			[
				'',
				'moz',
				'webkit',
				'ms'
			].forEach(function (pre) {
				$(e).on(`${pre}visibilitychange`, callback);
			});
		});
		return this;
	}
	click(callback) {
		return this.on('click', callback);
	}
	dblclick(callback) {
		this.on('dblclick', callback);
	}
	contextmenu(callback) {
		return this.on('contextmenu', callback);
	}
	keypress(callback) {
		return this.on('keypress', callback);
	}
	keyup(callback) {
		return this.on('keyup', callback);
	}
	keydown(callback) {
		return this.on('keydown', callback);
	}
	mouseenter(callback) {
		return this.on('mouseenter', callback);
	}
	mouseleave(callback) {
		return this.on('mouseleave', callback);
	}
	mouseover(callback) {
		return this.on('mouseover', callback);
	}
	mouseout(callback) {
		return this.on('mouseout', callback);
	}
	mousemove(callback) {
		return this.on('mousemove', callback);
	}
	mousedown(callback) {
		return this.on('mousedown', callback);
	}
	mouseup(callback) {
		return this.on('mouseup', callback);
	}
	input(callback) {
		return this.on('input', callback);
	}
	change(callback) {
		return this.on('change', callback);
	}
	submit(callback) {
		return this.on('submit', callback);
	}
	reset(callback) {
		return this.on('reset', callback);
	}
	invalid(callback) {
		return this.on('invalid', callback);
	}
	select(callback) {
		return this.on('select', callback);
	}
	focus(callback) {
		return this.on('focus', callback);
	}
	blur(callback) {
		return this.on('blur', callback);
	}
	resize(callback) {
		return this.on('resize', callback);
	}
	updateready(callback) {
		return this.on('updateready', callback);
	}
	DOMContentLoaded(callback) {
		return this.on('DOMContentLoaded', callback);
	}
	load(callback) {
		if (document.readyState === 'complete') {
			callback();
			return this;
		}
		return this.on('load', callback);
	}
	unload(callback) {
		return this.on('unload', callback);
	}
	beforeunload(callback) {
		return this.on('beforeunload', callback);
	}
	abort(callback) {
		return this.on('abort', callback);
	}
	error(callback) {
		return this.on('error', callback);
	}
	scroll(callback) {
		return this.on('scroll', callback);
	}
	drag(callback) {
		return this.on('drag', callback);
	}
	offline(callback) {
		return this.on('offline', callback);
	}
	online(callback) {
		return this.on('online', callback);
	}
	/*visibilitychange(callback) {
		return this.on('visibilitychange', callback);
	}*/
	popstate(callback) {
		return this.on('popstate', callback);
	}
	pagehide(callback) {
		return this.on('pagehide', callback);
	}
	watch(watching, options, attributeFilter) {
		/*https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver*/
		if (typeof options === 'undefined') {
			options = [];
		}
		/*var watcher = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				watching[mutation.type].call(mutation);
			});
		})*/
		var watcher = new MutationObserver(
			mutations => mutations.forEach(mutation =>
				watching[mutation.type].call(mutation)
			)
		),
		watches = {};
		Object.keys(watching).concat(options).forEach(event => watches[event] = true);
		if (typeof attributeFilter !== 'undefined' && attributeFilter.isArray) {
			watches.attributeFilter = attributeFilter;
		}
		this.each(el => watcher.observe(el, watches));
		return this;
	}
	/*====================================================================================================================*/
	$(selector) {
		return $(this.query.split(',').map(
			str => selector.split(',').map(
				q => `${str.trim()} ${q.trim()}`
			)
		)).join(', ');
	}

	css(args) {
		var style = document.styleSheets[document.styleSheets.length - 1];
		style.insertRule(`${this.query} {${args}}`, style.cssRules.length);
		return this;
	}
}
Object.prototype.$ = function(q) {
	if (this === document || this === window) {
		return $(q);
	}
	return $(this).$(q);
};
Object.prototype.isZQ = false;
zQ.prototype.isZQ = true;
function $(q = document) {
	return q.isZQ ? q : new zQ(q);
}
