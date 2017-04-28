/*eslint no-use-before-define: 0*/
/*============================ zQ Functions =======================*/
export default class zQ {
	constructor(selector, parent = document) {
		try {
			this.results = [];
			if (typeof selector === 'string') {
				this.results = Array.from(parent.querySelectorAll(selector));
				if (parent instanceof HTMLElement && parent.matches(selector)) {
					this.results.push(parent);
				}
			} else if (selector instanceof NodeList || selector instanceof HTMLCollection) {
				this.results = Array.from(selector);
			} else if (typeof selector === 'object') {
				this.results = [selector];
			} else {
				throw new TypeError(`Expected a string or Nodelist but got a ${typeof selector}: ${selector}.`);
			}
			this.query = selector || ':root';
		} catch (error) {
			console.error(error);
		} finally {
			this.filters = [];
		}
	}

	get length() {
		return this.results.length;
	}

	get found() {
		return this.results.length !== 0;
	}

	get text() {
		return this.results.map(node => node.textContent);
	}

	set text(str) {
		this.results.forEach(node => node.textContent = str);
	}

	get html() {
		return this.results.map(node => node.innerHTML);
	}
	set html(html) {
		this.results.forEach(node => node.innerHTML = html);
	}
	toString() {
		return this.query;
	}
	item(n) {
		return this.results[n];
	}
	each(callback) {
		this.results.forEach(callback);
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
		return this;
	}
	map(callback) {
		return this.results.map(callback);
	}
	/* *getResults() {
		for (let result of this.results) {
			yield result;
		}
	}*/
	addClass(cname) {
		this.results.forEach(el => el.classList.add(cname));
		return this;
	}
	removeClass(cname) {
		this.results.forEach(el => el.classList.remove(cname));
		return this;
	}
	hasClass(cname) {
		return this.some(el => el.classList.contains(cname));
	}
	toggleClass(cname, condition) {
		if (typeof condition === 'undefined') {
			this.results.forEach(el => el.classList.toggle(cname));
		} else {
			this.results.forEach(el => el.classList.toggle(cname, condition));
		}
		return this;
	}
	swapClass(cname1, cname2) {
		this.results.forEach(el => el.classList.swap(cname1, cname2));
		return this;
	}
	pickClass(cname1, cname2, condition) {
		(condition) ? this.addClass(cname1) : this.addClass(cname2);
		return this;
	}
	remove() {
		this.results.forEach(el => el.remove());
		return this;
	}
	hide() {
		this.results.forEach(el => el.hidden = true);
		return this;
	}
	unhide() {
		this.results.forEach(el => el.hidden = false);
		return this;
	}
	delete() {
		return this.remove();
	}
	append(node) {
		this.results.forEach(el => {
			el.appendChild(document.importNode(node.cloneNode(true), true));
		});
		return this;
	}
	afterBegin(text) {
		this.results.forEach(el => el.insertAdjacentHTML('afterbegin', text));
		return this;
	}
	afterEnd(text) {
		this.results.forEach(el => el.insertAdjacentHTML('afterend', text));
		return this;
	}
	beforeBegin(text) {
		this.results.forEach(el => el.insertAdjacentHTML('beforebegin', text));
		return this;
	}
	beforeEnd(text) {
		this.results.forEach(el => el.insertAdjacentHTML('beforeend', text));
		return this;
	}
	hasAttribute(attr) {
		return this.results.some(el => el.hasAttribute(attr));
	}
	attr(attr, val) {
		if (typeof val == 'undefined' || val === true) {
			val = '';
		}
		if (val === false) {
			this.results.forEach(el => el.removeAttribute(attr));
		} else {
			this.results.forEach(el => el.setAttribute(attr, val));
		}
		return this;
	}
	pause() {
		this.results.forEach(media => media.pause());
		return this;
	}
	/*==================== Listener Functions =================================*/
	on(event, callback, useCapture = false) {
		this.results.forEach(function (e) {
			('addEventListener' in Element.prototype)
				? e.addEventListener(event, callback, useCapture)
				: e.attachEvent(`on${event}`, callback);
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
		this.results.forEach(e => e.onplay = callback);
		return this;
	}
	paused(callback) {
		this.results.forEach(e => e.onpause = callback);
		return this;
	}
	visibilitychange(callback) {
		this.results.forEach(function (e) {
			[
				'',
				'moz',
				'webkit',
				'ms'
			].forEach(function (pre) {
				e.addEventListener(`${pre}visibilitychange`, callback);
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
	watch(watching, options = [], attributeFilter = []) {
		/*https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver*/
		var watcher = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				watching[mutation.type].call(mutation);
			});
		});
		var watches = {};
		Object.keys(watching).concat(options).forEach(event => {
			watches[event] = true;
		});
		if (attributeFilter.length > 0) {
			watches.attributeFilter = attributeFilter;
		}
		this.results.forEach(el => {
			watcher.observe(el, watches);
		});
		return this;
	}
	/*====================================================================================================================*/
	$(selector) {
		return new zQ(this.query.split(',').map(
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
